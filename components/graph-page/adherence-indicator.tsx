import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AdherenceIndicatorProps {
    rate: number;
}

export function AdherenceIndicator({ rate }: AdherenceIndicatorProps) {
    const { theme, isDark } = useTheme();

    const getColor = (rate: number): readonly [string, string] => {
        return [colorsTheme.primary, colorsTheme.secondary];
    };

    const getLabel = (rate: number): string => {
        if (rate >= 90) return 'Excellent';
        if (rate >= 70) return 'Good';
        if (rate >= 50) return 'Fair';
        return 'Needs Improvement';
    };

    const colors = getColor(rate);
    const label = getLabel(rate);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? theme.card : '#FFFFFF' }]}>
            <Text style={[styles.title, { color: theme.text }]}>Overall Adherence</Text>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBackground, { backgroundColor: isDark ? theme.surface : '#F2F2F7' }]}>
                    <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${Math.min(rate, 100)}%` }]}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.percentage, { color: colors[0] }]}>
                    {rate.toFixed(1)}%
                </Text>
                <Text style={[styles.label, { color: colors[0] }]}>{label}</Text>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBackground: {
        height: 12,
        backgroundColor: '#F2F2F7',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    percentage: {
        fontSize: 28,
        fontWeight: '700',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
});
