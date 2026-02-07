import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatCardData } from './types';

interface StatCardProps {
    data: StatCardData;
    fullWidth?: boolean;
}

export function StatCard({ data, fullWidth }: StatCardProps) {
    const { label, value, icon, color, trend } = data;
    const { theme, isDark } = useTheme();

    return (
        <View style={[
            styles.container,
            fullWidth && styles.fullWidth,
            { backgroundColor: isDark ? theme.card : '#FFFFFF' }
        ]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon as any} size={18} color={color} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: isDark ? theme.icon : '#8E8E93' }]} numberOfLines={2}>
                    {label}
                </Text>

                <View style={styles.valueRow}>
                    <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
                    {trend && (
                        <Ionicons
                            name={trend === 'up' ? 'trending-up' : 'trending-down'}
                            size={14}
                            color={trend === 'up' ? '#34C759' : '#FF3B30'}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        minHeight: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    fullWidth: {
        width: '100%',
    },

    iconContainer: {
        width: 40,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    content: {
        flex: 1,
    },

    label: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 2,
    },

    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12
    },

    value: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
    },
});



