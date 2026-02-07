import { CircularProgressSection } from '@/components/home-page/circular-progress';
import { HomeHeaderSection } from '@/components/home-page/home-header';
import { TodayMedicationSection } from '@/components/home-page/today-medicine';
import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useSnackbar as useAppSnackbar } from '@/context/snackbar';
import { useTheme } from '@/context/theme-context';
import { Medication, User } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  user?: User
}

import { ClosestMedicine } from '@/components/home-page/hour-medicine';
import NotificationCard from '@/components/notification/notification-card';
import RefillModal from '@/components/notification/refill-modal';
import RefillNotificationCard from '@/components/notification/refill-notification';

export default function HomeScreen({ user: propUser }: Props) {
  const router = useRouter();
  const params = useLocalSearchParams();
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
    getTodayDoseCount,
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

  // Listen for notification action
  React.useEffect(() => {
    if (params.action === 'open_notifications') {
      setTimeout(() => {
        setShowNotifications(true);
        router.setParams({ action: '', t: '' });
      }, 100);
    }
  }, [params.action, params.t]);

  const { showSnackbar } = useAppSnackbar();
  // Keep track of which (medId + time) we have already alerted for THIS session
  const [alertedDoses, setAlertedDoses] = React.useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      refreshMedications();
      // Only close if NOT triggered by notification action
      if (params.action !== 'open_notifications') {
        setShowNotifications(false);
      }
      return () => { };
    }, [params.action])
  );

  useFocusEffect(
    React.useCallback(() => {
      // Check for strictly upcoming dose to alert
      const now = new Date();
      const currentTimeVal = now.getHours() * 60 + now.getMinutes();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Flatten all scheduled times for today into a list of candidates
      const allUpcoming = medications.reduce<{ medName: string, time: string, timeVal: number, id: string }[]>((acc, med) => {
        if (!med.isActive) return acc;
        if (med.startDate > todayStr || (med.endDate && med.endDate < todayStr)) return acc;

        med.times.forEach(t => {
          const [h, m] = t.split(':').map(Number);
          const tVal = h * 60 + m;
          if (tVal > currentTimeVal) {
            acc.push({ medName: med.name, time: t, timeVal: tVal, id: med.id });
          }
        });
        return acc;
      }, []);

      // Sort by time and take the first one
      allUpcoming.sort((a, b) => a.timeVal - b.timeVal);
      const nextDose = allUpcoming[0];

      return () => { };
    }, [medications, alertedDoses])
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

            <View style={styles.closestReminder}>
              <ClosestMedicine />
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
  closestReminder: {
    marginHorizontal: 4,
    marginBottom: 10,
    paddingHorizontal: 6
  }
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