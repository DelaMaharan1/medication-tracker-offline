import { colorsTheme } from '@/constants/theme';
import { auth } from '@/utils/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmPasswordReset } from 'firebase/auth';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

export function InputNewPassword() {
    const { oobCode: paramCode } = useLocalSearchParams();
    const [actionCode, setActionCode] = useState((paramCode as string) || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Pastikan jika paramCode berubah (saat deep link masuk), state actionCode terupdate
    useState(() => {
        if (paramCode) {
            setActionCode(paramCode as string);
        }
    });

    const handleUpdatePassword = async () => {
        if (!actionCode || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields including the reset code');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        console.log('Attempting to reset password with action code...');
        try {
            await confirmPasswordReset(auth, actionCode, password);
            console.log('Password reset successful');
            Alert.alert(
                'Success',
                'Your password has been updated successfully',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
            );
        } catch (error: any) {
            console.error('Confirm password reset error:', error.code, error.message);
            if (error.code === 'auth/invalid-action-code') {
                Alert.alert('Error', 'The reset code is invalid or has expired. Please request a new one.');
            } else if (error.code === 'auth/expired-action-code') {
                Alert.alert('Error', 'The reset code has expired.');
            } else {
                Alert.alert('Error', `Failed to update password: ${error.message}`);
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
                            name="lock-check"
                            size={48}
                            color={colorsTheme.primary}
                        />
                    </View>
                    <Text variant="headlineMedium" style={styles.title}>
                        New Password
                    </Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Please enter your new password below
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Reset Code (from Email)"
                        value={actionCode}
                        onChangeText={setActionCode}
                        autoCapitalize="none"
                        autoCorrect={false}
                        mode="outlined"
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="key-outline" color="#9CA3AF" />}
                    />
                    <HelperText type="info" visible={true} style={styles.helperText}>
                        Enter the code sent to your email
                    </HelperText>

                    <TextInput
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                        mode="outlined"
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="lock-outline" color="#9CA3AF" />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off-outline" : "eye-outline"}
                                color="#9CA3AF"
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />

                    <TextInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCorrect={false}
                        mode="outlined"
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="lock-check-outline" color="#9CA3AF" />}
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                color="#9CA3AF"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        }
                    />

                    {/* Password match indicator */}
                    {password && confirmPassword && (
                        <View style={styles.passwordMatchContainer}>
                            <MaterialCommunityIcons
                                name={password === confirmPassword ? "check-circle" : "alert-circle"}
                                size={20}
                                color={password === confirmPassword ? "#10B981" : "#EF4444"}
                                style={styles.passwordMatchIcon}
                            />
                            <Text style={[
                                styles.passwordMatchText,
                                { color: password === confirmPassword ? "#10B981" : "#EF4444" }
                            ]}>
                                {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                            </Text>
                        </View>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleUpdatePassword}
                        loading={loading}
                        disabled={loading || (password !== confirmPassword)}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        buttonColor={colorsTheme.primary}
                    >
                        Update Password
                    </Button>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
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
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    helperText: {
        marginTop: -12,
        marginBottom: 8,
    },
    passwordMatchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: -8,
        paddingHorizontal: 4,
    },
    passwordMatchIcon: {
        marginRight: 8,
    },
    passwordMatchText: {
        fontSize: 14,
        fontWeight: '500',
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



