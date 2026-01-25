import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useTheme } from '@/context/theme-context';
import { deleteBackupData } from '@/utils/backup';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { deleteUser, getAuth, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function EditProfileScreen() {
    const auth = getAuth();
    const user = auth.currentUser;
    const router = useRouter();
    const { clearAllData } = useMedication();
    const { theme, isDark } = useTheme();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);

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
                        try {
                            if (user) {
                                // 1. Clear local medication data first
                                await clearAllData();

                                // 2. Delete cloud backup from Firestore
                                await deleteBackupData(user.uid);

                                // 3. Delete user from Firebase Auth
                                await deleteUser(user);

                                // 4. Log out to clear session
                                await auth.signOut();

                                Alert.alert('Account Deleted', 'Your account and data have been removed.');
                                router.replace('/(auth)/sign-in');
                            }
                        } catch (error: any) {
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert(
                                    'Action Required',
                                    'For security reasons, please log out and log back in before deleting your account.',
                                    [{ text: 'OK', onPress: () => auth.signOut() }]
                                );
                            } else {
                                Alert.alert('Error', error.message || 'Failed to delete account');
                            }
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: isDark ? theme.background : '#F2F2F7' }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
                    <Text style={[styles.subtitle, { color: isDark ? theme.icon : '#666' }]}>Update your personal information</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Username"
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        mode="outlined"
                        style={[styles.input, { backgroundColor: isDark ? theme.card : 'white' }]}
                        outlineColor={isDark ? '#333' : '#E5E7EB'}
                        textColor={theme.text}
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="account-outline" color={isDark ? theme.icon : "#9CA3AF"} />}
                    />
                    <TextInput
                        label="Email Address (Not changeable)"
                        value={user?.email || ''}
                        disabled
                        mode="outlined"
                        style={[styles.input, { backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA' }]}
                        outlineColor={isDark ? '#333' : '#E5E7EB'}
                        textColor={isDark ? '#A0A0A0' : '#8E8E93'}
                        left={<TextInput.Icon icon="email-outline" color={isDark ? theme.icon : "#9CA3AF"} />}
                    />
                    <Button
                        mode="contained"
                        onPress={handleUpdateProfile}
                        loading={loading}
                        disabled={loading}
                        style={styles.saveButton}
                        contentStyle={styles.buttonContent}
                        buttonColor={colorsTheme.primary}
                    >
                        Save Changes
                    </Button>

                    <View style={[styles.dangerZone, {
                        backgroundColor: isDark ? '#2D1A1A' : '#FFF5F5',
                        borderColor: isDark ? '#4A2A2A' : '#FED7D7'
                    }]}>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteAccount}
                        >
                            <MaterialCommunityIcons name="delete-forever" size={20} color="#EF4444" />
                            <Text style={styles.deleteButtonText}>Delete My Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginVertical: 40,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 28,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 20,
    },
    saveButton: {
        marginTop: 8,
        borderRadius: 12,
    },
    buttonContent: {
        height: 54,
    },
    dangerZone: {
        marginTop: 40,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
