import { deleteBackupData } from '@/utils/backup';
import { useRouter } from 'expo-router';
import { deleteUser, updateProfile, User } from 'firebase/auth';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useProfileManagement(user: User | null, auth: any, clearAllData: () => Promise<void>) {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        setLoading(true);
        try {
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

                                // 1. Try to delete the FAB user first. 
                                await deleteUser(currentUser);

                                // 2. If Auth deletion was successful, proceed to clean up data.
                                try {
                                    await deleteBackupData(uid);
                                    await clearAllData();
                                } catch (cleanupError) {
                                    console.warn('Account deleted but data cleanup failed:', cleanupError);
                                }

                                Alert.alert('Account Deleted', 'Your account and data have been removed.');
                                router.replace('/(auth)/sign-in');
                            }
                        } catch (error: any) {
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert(
                                    'Security Re-verification',
                                    'For security reasons, please log out and log back in to delete your account.',
                                    [{ text: 'Log Out', onPress: () => auth.signOut() }]
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
        loading,
        handleUpdateProfile,
        handleDeleteAccount
    };
}



