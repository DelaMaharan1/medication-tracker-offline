import { auth } from '@/utils/';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

// WE DO NOT STATICALLY IMPORT GoogleSignin here because it crashes Expo Go
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface GoogleSignInButtonProps {
    onSuccess?: (user: any) => void;
}

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Cek apakah modul GoogleSignin tersedia (tidak tersedia di Expo Go)
        try {
            // Kita coba butuh modulnya secara dinamis
            const { GoogleSignin } = require('@react-native-google-signin/google-signin');
            if (GoogleSignin) {
                GoogleSignin.configure({
                    webClientId: '811966391838-6h6m2iog8ostlbbrguhmo4omui62akdq.apps.googleusercontent.com',
                    offlineAccess: true,
                });
            }
        } catch (e) {
            console.log('DEBUG: GoogleSignin native module not found (expected in Expo Go)');
        }
    }, []);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            // Dinamis require di sini agar tidak crash saat file di-load
            let GoogleSigninModule;
            try {
                const { GoogleSignin } = require('@react-native-google-signin/google-signin');
                GoogleSigninModule = GoogleSignin;
            } catch (e) {
                // Modul tidak ketemu
            }

            if (!GoogleSigninModule || !GoogleSigninModule.signIn) {
                Alert.alert(
                    'Development Build Required',
                    'Google Sign-In requires a Native Development Build. It is not supported in Expo Go. You can continue using Email/Password or build the app with "npx expo run:android".'
                );
                setLoading(false);
                return;
            }

            console.log('DEBUG: Starting Google Sign-In...');
            await GoogleSigninModule.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the users ID token
            const signInResult = await GoogleSigninModule.signIn();
            console.log('DEBUG: Sign-In result received');

            // Handle token extraction based on version (v13+ uses .data)
            let idToken = signInResult.data?.idToken;
            if (!idToken) {
                // @ts-ignore
                idToken = signInResult.idToken;
            }

            if (!idToken) {
                throw new Error('No ID token found from Google Sign-In (check Firebase console config)');
            }

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await signInWithCredential(auth, googleCredential);

            if (onSuccess) {
                onSuccess(userCredential.user);
            }
            console.log('DEBUG: Firebase Auth successful:', userCredential.user.email);
        } catch (error: any) {
            console.error('DEBUG: Google Sign-In Error:', error.code, error.message);

            if (error.code === 'SIGN_IN_CANCELLED' || error.code === '7') {
                // Cancelled
            } else if (error.code === 'DEVELOPER_ERROR') {
                Alert.alert('Config Error', 'DEVELOPER_ERROR: Check SHA-1 and package name in Firebase.');
            } else {
                Alert.alert('Error', `Google Sign-In failed: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.line} />
            </View>

            <Button
                mode="outlined"
                onPress={handleGoogleSignIn}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                textColor="#444"
                icon={({ size, color }) => (
                    <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                )}
            >
                Continue with Google
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
        fontWeight: '600',
        fontSize: 12,
    },
    button: {
        borderRadius: 12,
        borderColor: '#E5E7EB',
        borderWidth: 1.5,
    },
    buttonContent: {
        height: 54,
    },
});
