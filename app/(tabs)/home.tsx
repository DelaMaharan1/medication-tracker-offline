import { CircularProgressSection } from '@/components/home-page/circular-progress';
import { HomeHeaderSection } from '@/components/home-page/home-header';
import { TodayMedicationSection } from '@/components/home-page/today-medicine';
import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useTheme } from '@/context/theme-context';
import { Medication, User } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  user?: User
}

import NotificationCard from '@/components/notification/notification-card';
import RefillModal from '@/components/notification/refill-modal';
import RefillNotificationCard from '@/components/notification/refill-notification';

export default function HomeScreen({ user: propUser }: Props) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { theme, isDark } = useTheme();

  // Create a user object that matches the expected interface
  const user = propUser || {
    username: currentUser?.displayName || 'User',
    email: currentUser?.email || ''
  };

  const {
    medications,
    refreshMedications,
    getCompletedDosesCount,
    getTodayDoseCount, // Added this
    pendingCount,
    getNotifications,
    takeMedication,
    refillNotifications,
    handleRefillLater,
    refillMedication,
    globalNotifications
  } = useMedication();

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [skippedList, setSkippedList] = React.useState<string[]>([]);

  // Refill Modal state
  const [refillMedId, setRefillMedId] = React.useState<string | null>(null);
  const selectedRefillMed = React.useMemo(() =>
    medications.find(m => m.id === refillMedId),
    [medications, refillMedId]
  );

  useFocusEffect(
    React.useCallback(() => {
      refreshMedications();
      setShowNotifications(false); // Explicitly close modal on return/focus
      return () => { };
    }, [])
  );

  const calculateTotalDoses = (meds: Medication[]) => {
    if (!globalNotifications) return 0;

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return meds.reduce((total, med) => {
      // Basic validity check: Is it scheduled for today regardless of activation?
      const isScheduledToday = med.startDate <= today && (!med.endDate || med.endDate >= today);
      if (!isScheduledToday) return total;

      // Logic:
      // 1. If Active: Count ALL scheduled times (Target)
      // 2. If Inactive: Count ONLY what was actually taken (History)

      const isActive = med.isActive && med.reminderEnabled;

      if (isActive) {
        return total + (med.times?.length || 0);
      } else {
        // For inactive meds, we only assume "Total" = "Taken" so they don't drag down percentage
        // e.g. Taken 1/1 then archived -> Total becomes 1. Progress 1/1.
        return total + getTodayDoseCount(med.id);
      }
    }, 0)
  }

  const totalDoses = calculateTotalDoses(medications);
  const completedDoses = getCompletedDosesCount();
  const progress = totalDoses > 0 ? completedDoses / totalDoses : 0;

  const notifications = React.useMemo(() => {
    return getNotifications().filter(notif => !skippedList.includes(`${notif.medication.id}-${notif.time}`));
  }, [getNotifications, skippedList]);

  return (
    <View style={[styles.mainContainer, { backgroundColor: isDark ? '#151718' : '#F2F2F7' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.headerWrapper, { backgroundColor: isDark ? '#151718' : '#fff' }]}>
          <LinearGradient
            colors={[colorsTheme.primary, isDark ? '#822F2F' : colorsTheme.secondary]}
            style={styles.gradient}
          >
            <View style={styles.headerContentContainer}>
              <HomeHeaderSection
                user={user}
                onNotificationPress={() => setShowNotifications(true)}
                notificationCount={notifications.length + refillNotifications.length}
              />
            </View>

            <View style={styles.progressContainer}>
              <CircularProgressSection
                medicine={medications}
                progress={progress}
                completedDoses={completedDoses}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Content - Removed Refill Card from here */}
        <View style={{ paddingTop: 16 }}>
          {/* No refill cards here anymore */}
        </View>

        <TodayMedicationSection />

        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={modalStyles.overlay}>
            <View style={[modalStyles.container, { backgroundColor: theme.background }]}>
              <View style={modalStyles.header}>
                <View>
                  <Text style={[modalStyles.title, { color: theme.text }]}>Notifications</Text>
                  <Text style={modalStyles.subtitle}>{notifications.length + refillNotifications.length} alerts pending</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowNotifications(false)}
                  style={[modalStyles.closeButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {notifications.length === 0 && refillNotifications.length === 0 ? (
                <View style={modalStyles.emptyState}>
                  <View style={modalStyles.emptyIconContainer}>
                    <Ionicons name="checkmark-done-circle" size={60} color={colorsTheme.primary + '40'} />
                  </View>
                  <Text style={[modalStyles.emptyText, { color: theme.text }]}>All caught up!</Text>
                  <Text style={modalStyles.emptySubtext}>No pending medications for now.</Text>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                  {/* Refill Notifications Section */}
                  {refillNotifications.map((notif) => (
                    <RefillNotificationCard
                      key={`refill-${notif.medicationId}`}
                      medicationName={notif.medicationName}
                      currentSupply={notif.currentSupply}
                      onRefill={() => {
                        setShowNotifications(false); // Close modal to show refill modal
                        setRefillMedId(notif.medicationId);
                      }}
                      onLater={() => {
                        import('react-native').then(({ Alert }) => {
                          Alert.alert(
                            "Disable Reminder?",
                            `Are you sure you want to stop reminders for ${notif.medicationName}? You manually re-enable them in settings later.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Yes, DISABLE",
                                style: "destructive",
                                onPress: () => handleRefillLater(notif.medicationId)
                              }
                            ]
                          );
                        });
                      }}
                    />
                  ))}

                  {/* Dose Notifications Section */}
                  {notifications.map((notif, index) => (
                    <NotificationCard
                      key={`${notif.medication.id}-${notif.time}-${index}`}
                      medication={notif.medication}
                      time={notif.time}
                      onTake={async () => {
                        await takeMedication(notif.medication.id, notif.time);
                        // No need to add to skippedList, getNotifications will naturally exclude it once recorded
                      }}
                      onSkip={() => {
                        setSkippedList(prev => [...prev, `${notif.medication.id}-${notif.time}`]);
                      }}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {selectedRefillMed && (
          <RefillModal
            visible={!!refillMedId}
            onClose={() => setRefillMedId(null)}
            onSubmit={async (amount) => {
              await refillMedication(selectedRefillMed.id, amount);
              setRefillMedId(null);
            }}
            medicationName={selectedRefillMed.name}
            dosage={selectedRefillMed.dosage}
            currentSupply={selectedRefillMed.currentSupply}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS styled system gray
  },
  headerWrapper: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 0,
    elevation: 4,
    zIndex: 10,
  },
  gradient: {
    width: '100%',
    paddingBottom: 10,
  },
  headerContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  progressContainer: {
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
})

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(254, 250, 250, 0.1)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "60%",
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: 'center',
  },
});