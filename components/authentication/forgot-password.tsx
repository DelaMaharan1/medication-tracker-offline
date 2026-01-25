import { colorsTheme } from '@/constants/theme';
import { auth } from '@/utils/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        const actionCodeSettings = {
            // URL ini harus terdaftar di Authorized Domains Firebase Console
            url: 'https://meditrack-c224d.firebaseapp.com/input-new-password',
            handleCodeInApp: true,
            // Bundle ID/Package name aplikasi kamu
            android: {
                packageName: 'com.yourname.meditrack', // Sesuaikan jika berbeda di app.json
                installApp: true,
                minimumVersion: '12'
            },
        };

        setLoading(true);
        console.log('DEBUG: Initiating password reset request for:', email);
        console.log('DEBUG: ActionCodeSettings:', actionCodeSettings);

        try {
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            console.log('DEBUG: sendPasswordResetEmail call successful for:', email);
            Alert.alert(
                'Success',
                'A password reset link has been sent to your email. Clicking the link will allow you to return to the app automatically.',
                [{ text: 'OK', onPress: () => router.push('/(auth)/input-new-password') }]
            );
        } catch (error: any) {
            console.error('DEBUG: Password reset failed:', {
                code: error.code,
                message: error.message,
                email: email
            });

            if (error.code === 'auth/user-not-found') {
                Alert.alert('Error', 'No user found with this email address. Please check and try again.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error', 'The email address format is invalid.');
            } else if (error.code === 'auth/network-request-failed') {
                Alert.alert('Error', 'Network error. Please check your internet connection and try again.');
            } else if (error.code === 'auth/too-many-requests') {
                Alert.alert('Error', 'Too many requests. Please wait a moment before trying again.');
            } else {
                Alert.alert('Error', `Failed to send reset email: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name="lock-reset"
                            size={48}
                            color={colorsTheme.primary}
                        />
                    </View>
                    <Text variant="headlineMedium" style={styles.title}>
                        Reset Password
                    </Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Enter your email to receive a reset link
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        mode="outlined"
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="email-outline" color="#9CA3AF" />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleResetPassword}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        buttonColor={colorsTheme.primary}
                    >
                        Send Reset Link
                    </Button>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => router.push('/sign-in')}>
                            <Text
                                variant="bodyMedium"
                                style={[styles.footerLink, { color: colorsTheme.primary }]}
                            >
                                Back to Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 8,
        color: '#6B7280',
        textAlign: 'center',
        fontSize: 16,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
    },
    button: {
        borderRadius: 12,
        elevation: 0,
    },
    buttonContent: {
        height: 54,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerLink: {
        fontWeight: '700',
    },
});
