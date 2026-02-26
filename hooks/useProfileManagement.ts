import { deleteBackupData } from '@/utils/backup';
import { getUser, saveUser } from '@/utils/storage';
import { User as AppUser } from '@/utils/ttype';
import { useRouter } from 'expo-router';
import { deleteUser, updateProfile, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useProfileManagement(user: User | null, auth: any, clearAllData: () => Promise<void>) {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [wakeTime, setWakeTime] = useState('07:00');
    const [sleepTime, setSleepTime] = useState('22:00');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        const profile = await getUser();
        if (profile) {
            if (profile.wakeTime) setWakeTime(profile.wakeTime);
            if (profile.sleepTime) setSleepTime(profile.sleepTime);
        }
    };

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        setLoading(true);
        try {
            // Update Extended Profile (Local Storage)
            const appUser: AppUser = {
                username: displayName.trim(),
                wakeTime,
                sleepTime,
                dailyCycle: false
            };
            await saveUser(appUser);

            // Update Firebase Auth Profile
            if (user) {
                await updateProfile(user, {
                    displayName: displayName.trim(),
                });
                Alert.alert('Success', 'Profile updated successfully');
                router.back();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you absolutely sure? This action cannot be undone and all your medication data will be lost forever.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'DELETE',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const currentUser = auth.currentUser;
                            if (currentUser) {
                                const uid = currentUser.uid;

                                // 1. Delete Firestore Backup FIRST (while still authenticated)
                                try {
                                    await deleteBackupData(uid);
                                } catch (backupError) {
                                    console.warn('Failed to delete backup data:', backupError);
                                    // Proceed anyway to ensure account deletion
                                }

                                // 2. Clear Local Data
                                try {
                                    await clearAllData();
                                } catch (localError) {
                                    console.warn('Failed to clear local data:', localError);
                                }

                                // 3. Delete Firebase Auth User
                                console.log('[Profile] Deleting Auth User...');
                                await deleteUser(currentUser);

                                Alert.alert('Account Deleted', 'Your account and data have been removed.');
                                router.replace('/(auth)/sign-in');
                            }
                        } catch (error: any) {
                            console.error('[Profile] Delete Account Error:', error);
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert(
                                    'Security Re-verification Needed',
                                    'Your data has been securely wiped, but we need you to log in again to permanently delete your account access.',
                                    [{ text: 'Log Out & Delete', onPress: () => auth.signOut() }]
                                );
                            } else {
                                Alert.alert('Error', error.message || 'Failed to delete account.');
                            }
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return {
        displayName,
        setDisplayName,
        wakeTime,
        setWakeTime,
        sleepTime,
        setSleepTime,
        loading,
        handleUpdateProfile,
        handleDeleteAccount
    };
}



