import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatCard } from './stat-card';
import { AdherenceStats, StatCardData } from './types';

const GAP = 14;

interface StatsGridProps {
    stats: AdherenceStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const allStats: StatCardData[] = [
        {
            label: 'Adherence Rate',
            value: `${stats.adherenceRate.toFixed(1)}%`,
            icon: 'trophy',
            color: '#EA7B7B',
            trend: stats.adherenceRate >= 80 ? 'up' : 'down'
        },
        {
            label: 'Total Doses',
            value: stats.totalDoses,
            icon: 'medical',
            color: '#007AFF',
        },
        {
            label: 'Taken',
            value: stats.takenDoses,
            icon: 'checkmark-circle',
            color: '#34C759',
        },
        {
            label: 'Missed',
            value: stats.missedDoses,
            icon: 'close-circle',
            color: '#FF3B30',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {allStats.slice(0, 1).map((item, index) => (
                    <View key={index} style={styles.flexCard}>
                        <StatCard data={item} />
                    </View>
                ))}
            </View>
            <View style={styles.row}>
                {allStats.slice(1, 2).map((item, index) => (
                    <View key={index} style={styles.flexCard}>
                        <StatCard data={item} />
                    </View>
                ))}
            </View>
            <View style={styles.row}>
                {allStats.slice(2, 4).map((item, index) => (
                    <View key={index} style={styles.flexCard}>
                        <StatCard data={item} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },

    row: {
        flexDirection: 'row',
        gap: GAP,
        marginBottom: GAP,
    },

    flexCard: {
        flex: 1,
    },

    fullWidthCard: {
        width: '100%',
    },
});


