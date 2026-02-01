import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { auth } from '@/utils/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export function SignIn() {
    const { theme, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

    const router = useRouter();

    // Password validation function (sama seperti di SignUp)
    const validatePassword = (pass: string) => {
        const errors: string[] = [];

        if (pass.length < 8) {
            errors.push('At least 8 characters');
        }

        if (!/[A-Z]/.test(pass)) {
            errors.push('At least one uppercase letter');
        }

        if (!/[a-z]/.test(pass)) {
            errors.push('At least one lowercase letter');
        }

        if (!/\d/.test(pass)) {
            errors.push('At least one number');
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
            errors.push('At least one special character');
        }

        return errors;
    };

    // Update password errors when password changes
    useEffect(() => {
        if (password) {
            const errors = validatePassword(password);
            setPasswordErrors(errors);
        } else {
            setPasswordErrors([]);
        }
    }, [password]);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Validasi format email (jika input berupa email)
        if (email.includes('@') && !email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        // Check for password errors (sama seperti di SignUp)
        const errors = validatePassword(password);
        if (errors.length > 0) {
            Alert.alert(
                'Password Requirements',
                'Please ensure your password meets all requirements:\n' + errors.map(error => `• ${error}`).join('\n')
            );
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Alert.alert('Error', 'Invalid email or password');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error', 'Invalid email address');
            } else if (error.code === 'auth/too-many-requests') {
                Alert.alert('Error', 'Too many failed attempts. Please try again later or reset your password.');
            } else {
                Alert.alert('Error', error.message || 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if password meets all requirements
    const isPasswordValid = passwordErrors.length === 0;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2D1A1A' : '#FEF2F2' }]}>
                        <MaterialCommunityIcons
                            name="medical-bag"
                            size={48}
                            color={colorsTheme.primary}
                        />
                    </View>
                    <Text variant="headlineMedium" style={[styles.title, { color: theme.text }]}>
                        Welcome Back
                    </Text>
                    <Text variant="bodyMedium" style={[styles.subtitle, { color: isDark ? theme.icon : '#6B7280' }]}>
                        Sign in to continue tracking your health
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Email or Username"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        mode="outlined"
                        style={[styles.input, { backgroundColor: isDark ? theme.card : '#FFFFFF' }]}
                        outlineColor={isDark ? '#333' : '#E5E7EB'}
                        textColor={theme.text}
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="account-outline" color={isDark ? theme.icon : "#9CA3AF"} />}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                        mode="outlined"
                        style={[styles.input, { backgroundColor: isDark ? theme.card : '#FFFFFF' }]}
                        outlineColor={isDark ? '#333' : '#E5E7EB'}
                        textColor={theme.text}
                        activeOutlineColor={colorsTheme.primary}
                        left={<TextInput.Icon icon="lock-outline" color={isDark ? theme.icon : "#9CA3AF"} />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off-outline" : "eye-outline"}
                                color={isDark ? theme.icon : "#9CA3AF"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />

                    {/* Password requirements indicator (sama seperti di SignUp) */}
                    {password.length > 0 && (
                        <View style={[
                            styles.passwordRequirements,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB',
                                borderColor: isDark ? '#333' : '#E5E7EB'
                            }
                        ]}>
                            <Text style={[styles.requirementsTitle, { color: theme.text }]}>Password must contain:</Text>
                            {[
                                {
                                    label: 'At least 8 characters',
                                    isValid: password.length >= 8
                                },
                                {
                                    label: 'At least one uppercase letter (A-Z)',
                                    isValid: /[A-Z]/.test(password)
                                },
                                {
                                    label: 'At least one lowercase letter (a-z)',
                                    isValid: /[a-z]/.test(password)
                                },
                                {
                                    label: 'At least one number (0-9)',
                                    isValid: /\d/.test(password)
                                },
                                {
                                    label: 'At least one special character (!@#$%^&*...)',
                                    isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
                                },
                            ].map((req, index) => (
                                <View key={index} style={styles.requirementItem}>
                                    <MaterialCommunityIcons
                                        name={req.isValid ? "check-circle" : "circle-outline"}
                                        size={16}
                                        color={req.isValid ? "#10B981" : (isDark ? "#636366" : "#9CA3AF")}
                                        style={styles.requirementIcon}
                                    />
                                    <Text style={[
                                        styles.requirementText,
                                        { color: req.isValid ? "#10B981" : (isDark ? theme.icon : "#6B7280") }
                                    ]}>
                                        {req.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push('/forgot-password')}
                        style={styles.forgotPassword}
                    >
                        <Text style={[styles.forgotPasswordText, { color: colorsTheme.primary }]}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    <Button
                        mode="contained"
                        onPress={handleSignIn}
                        loading={loading}
                        disabled={loading || !isPasswordValid}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        buttonColor={colorsTheme.primary}
                    >
                        Sign In
                    </Button>


                    <View style={styles.footer}>
                        <Text variant="bodyMedium" style={[styles.footerText, { color: isDark ? theme.icon : '#6B7280' }]}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/sign-up')}>
                            <Text
                                variant="bodyMedium"
                                style={[styles.footerLink, { color: colorsTheme.primary }]}
                            >
                                Sign Up
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
    passwordRequirements: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    requirementIcon: {
        marginRight: 8,
    },
    requirementText: {
        fontSize: 13,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontWeight: '600',
        fontSize: 14,
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
    footerText: {
        color: '#6B7280',
    },
    footerLink: {
        fontWeight: '700',
    },
});


