import { useTheme } from '@/context/theme-context';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MedicationHistoryItem } from './types';

interface HistoryItemProps {
    item: MedicationHistoryItem;
}

export function HistoryItem({ item }: HistoryItemProps) {
    const { theme, isDark } = useTheme();
    const isTaken = item.status === 'taken';
    const isMissed = item.status === 'missed';
    const isPending = item.status === 'pending';

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: isDark ? theme.surface : '#FFFFFF',
                borderColor: isDark ? '#333' : '#F2F2F7'
            }
        ]}>
            <View style={styles.content}>
                <Text style={[styles.name, { color: theme.text }]}>{item.medicationName}</Text>
                <Text style={[styles.details, { color: isDark ? theme.icon : '#8E8E93' }]}>{item.dosage} • {item.time}</Text>
            </View>

            <View style={[
                styles.badge,
                {
                    backgroundColor: isTaken ? '#34C75920' : isMissed ? '#FF3B3020' : (isDark ? '#333' : '#E5E5EA')
                }
            ]}>
                <Text style={[
                    styles.badgeText,
                    {
                        color: isTaken ? '#34C759' : isMissed ? '#FF3B30' : (isDark ? '#A0A0A0' : '#8E8E93')
                    }
                ]}>
                    {isTaken ? 'Taken' : isMissed ? 'Missed' : 'Pending'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    details: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});



