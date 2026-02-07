import { colorsTheme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsFooterProps {
    onLogout: () => void;
    isGuest?: boolean;
    onSignIn?: () => void;
}

export const SettingsFooter = ({ onLogout, isGuest, onSignIn }: SettingsFooterProps) => (
    <View style={styles.container}>
        {isGuest ? (
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colorsTheme.secondary, opacity: 0.5 }]}
                onPress={onSignIn}
            >
                <Text style={[styles.logoutText, { color: colorsTheme.primary }]}>Sign In</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={onLogout}
            >
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        paddingBottom: 20,
    },
    logoutButton: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: '#FF3B3010',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF3B30',
    },
});



