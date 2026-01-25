import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HistoryItem } from './history-item';
import { DayHistory } from './types';

interface HistoryListProps {
    data: DayHistory[];
}

export function HistoryList({ data }: HistoryListProps) {
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No medication history for this period.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Medication History</Text>

            {data.map((day, index) => (
                <View key={day.date} style={styles.daySection}>
                    <Text style={styles.dateLabel}>
                        {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Text>

                    {day.items.map(item => (
                        <HistoryItem key={item.id} item={item} />
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 16,
    },
    daySection: {
        marginBottom: 20,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 15,
    },
});
