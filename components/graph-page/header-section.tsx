import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PeriodSelector } from './period-selector';
import { TimePeriod } from './types';

interface HeaderSectionProps {
    period: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
}

export function HeaderSection({ period, onPeriodChange }: HeaderSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Progress Tracker</Text>
                <Text style={styles.subtitle}>Track your medication adherence</Text>
            </View>

            <PeriodSelector selected={period} onSelect={onPeriodChange} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    titleContainer: {
        marginTop: 18,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
});


