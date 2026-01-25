import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileCardProps {
    name?: string | null;
    email?: string | null;
}

export const ProfileCard = ({ name, email }: ProfileCardProps) => {
    const router = useRouter();
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: theme.background }]}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.7}
        >
            <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color="white" />
            </View>
            <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.text }]}>{name || 'Health Partner'}</Text>
                <Text style={[styles.profileEmail, { color: theme.icon }]}>{email || 'Your Personalized Assistant'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colorsTheme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    profileEmail: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
});
