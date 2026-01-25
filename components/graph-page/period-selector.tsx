import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TimePeriod } from './types';

interface PeriodSelectorProps {
    selected: TimePeriod;
    onSelect: (period: TimePeriod) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
    { value: 'calendar', label: 'Calendar' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
];

export function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
    return (
        <View style={styles.container}>
            {PERIODS.map((period) => {
                const isSelected = selected === period.value;
                return (
                    <TouchableOpacity
                        key={period.value}
                        style={[styles.button, isSelected && styles.buttonSelected]}
                        onPress={() => onSelect(period.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.text, isSelected && styles.textSelected]}>
                            {period.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSelected: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
    },
    textSelected: {
        color: '#EA7B7B',
        fontWeight: '600',
    },
});
