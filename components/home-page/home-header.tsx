import { useTheme } from '@/context/theme-context';
import { User } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    user: User;
    onNotificationPress?: () => void;
    notificationCount?: number;
}

export function HomeHeaderSection({ user, onNotificationPress, notificationCount = 0 }: Props) {
    const [greeting, setGreeting] = useState('');
    const router = useRouter();
    const { isDark } = useTheme();

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.username}>{user?.username || 'User'}</Text>
            </View>

            <TouchableOpacity
                style={styles.notificationBtn}
                onPress={onNotificationPress}
            >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
                {notificationCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 26,
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    notificationBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FF3B30',
        borderWidth: 1.5,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
});


