import { AboutModal } from '@/components/settings/AboutModal';
import { FeedbackModal } from '@/components/settings/FeedbackModal';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingRow } from '@/components/settings/SettingRow';
import { SettingsFooter } from '@/components/settings/SettingsFooter';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { useMedication } from '@/context/medicine';
import { useSnackbar as useAppSnackbar } from '@/context/snackbar';
import { useTheme } from '@/context/theme-context';
import { backupUserData, restoreUserData } from '@/utils/backup';
import { Stack, useFocusEffect } from 'expo-router';
import { getAuth, signOut, User } from 'firebase/auth';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
export default function SettingsScreen() {
  const medicineContext = useMedication();
  const themeContext = useTheme();
  const { showSnackbar } = useAppSnackbar();

  const { clearAllData, globalNotifications, setGlobalNotifications } = medicineContext;
  const { theme, isDark, mode, setMode } = themeContext;

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all medications and history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            await clearAllData();
            showSnackbar("All data cleared successfully", "success");
          }
        }
      ]
    );
  };

  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  useFocusEffect(
    useCallback(() => {
      // Reload the user to get updated profile data
      if (auth.currentUser) {
        auth.currentUser.reload().then(() => {
          setCurrentUser({ ...auth.currentUser } as User);
        });
      }
    }, [])
  );

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#151718' : '#F2F2F7' }]}>
      <Stack.Screen options={{
        title: 'Settings',
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: isDark ? '#151718' : '#F2F2F7' },
        headerTintColor: theme.text
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileCard name={currentUser?.displayName} email={currentUser?.email} />

        <SettingsGroup title="Preferences">
          <SettingRow
            icon="notifications"
            title="Push Notifications"
            subtitle="Get reminded about your doses"
            type="switch"
            value={globalNotifications}
            onValueChange={setGlobalNotifications}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]} />
          <SettingRow
            icon="beaker"
            title="Refill Reminders"
            subtitle="Get alerted when supply is low"
            type="switch"
            value={medicineContext.globalRefillReminders}
            onValueChange={medicineContext.setGlobalRefillReminders}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]} />
          <SettingRow
            icon="volume-high"
            title="Voice Notifications"
            subtitle="Hear reminders spoken aloud"
            type="switch"
            value={medicineContext.voiceNotifications}
            onValueChange={medicineContext.setVoiceNotifications}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]} />
          <SettingRow
            icon={isDark ? "moon" : "sunny"}
            title="Dark Mode"
            subtitle={mode === 'system' ? 'System' : (isDark ? 'Dark' : 'Light')}
            type="switch"
            value={isDark}
            onValueChange={(val) => setMode(val ? 'dark' : 'light')}
          />
        </SettingsGroup>

        <SettingsGroup title="Data Management">
          <SettingRow
            icon="cloud-upload"
            title="Backup Data"
            subtitle="Sync your data to cloud"
            type="arrow"
            onPress={async () => {
              if (!currentUser) {
                Alert.alert("Error", "You must be logged in to backup.");
                return;
              }
              const success = await backupUserData(currentUser.uid);
              if (success) showSnackbar("Backup completed successfully", "success");
              else showSnackbar("Backup failed", "error");
            }}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]} />
          <SettingRow
            icon="cloud-download"
            title="Restore Data"
            subtitle="Overwrite local data from cloud"
            type="arrow"
            onPress={() => {
              Alert.alert(
                "Restore Data",
                "This will overwrite your local data with the backup from cloud. Continue?",
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Restore',
                    style: 'default',
                    onPress: async () => {
                      if (!currentUser) return;
                      const success = await restoreUserData(currentUser.uid);
                      if (success) {
                        showSnackbar("Data restored. Please RESTART the app to resync notifications.", "success");
                      } else {
                        showSnackbar("Restore failed or no backup found", "error");
                      }
                    }
                  }
                ]
              );
            }}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]} />
          <SettingRow icon="trash" title="Clear All Data" type="danger" onPress={handleClearData} />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingRow
            icon="mail"
            title="Send Feedback"
            subtitle="Help us improve MediTrack"
            type="arrow"
            onPress={() => setShowFeedbackModal(true)}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]} />
        </SettingsGroup>

        <SettingsGroup title="App Version">
          <SettingRow
            icon="code-working"
            title="Version"
            subtitle="1.0.0"
            type="arrow"
            onPress={() => setShowAboutModal(true)}
          />
        </SettingsGroup>

        <SettingsFooter onLogout={() => signOut(getAuth())} />
      </ScrollView>

      <AboutModal
        visible={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        theme={theme}
      />

      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        theme={theme}
        isDark={isDark}
        currentUser={currentUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 20,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginLeft: 64 },
});



