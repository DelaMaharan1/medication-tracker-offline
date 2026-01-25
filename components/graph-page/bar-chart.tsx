import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GraphDataPoint, TimePeriod } from './types';

interface BarChartProps {
    data: GraphDataPoint[];
    period: TimePeriod;
    onBarPress?: (point: GraphDataPoint) => void;
}

// Layout constants
const SCREEN_PADDING = 40;
const CARD_PADDING = 40;
const AVAILABLE_WIDTH = Dimensions.get('window').width - SCREEN_PADDING - CARD_PADDING;
const CHART_HEIGHT = 200;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function BarChart({ data, period, onBarPress }: BarChartProps) {
    const { theme, isDark } = useTheme();

    if (!data || data.length === 0) {
        return (
            <View style={[
                styles.container,
                {
                    height: CHART_HEIGHT + 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isDark ? theme.card : '#FFFFFF'
                }
            ]}>
                <Text style={[styles.legendText, { color: isDark ? theme.icon : '#8E8E93' }]}>No data available for this period</Text>
            </View>
        );
    }

    const maxValue = Math.max(...data.map(d => d.total), 1);

    // Calculate bar width - fit all bars in available width
    const gap = period === 'month' ? 12 : 8;
    const totalGap = (data.length - 1) * gap;
    const barWidth = Math.max(20, (AVAILABLE_WIDTH - totalGap) / data.length);

    const getLabel = (point: GraphDataPoint): string => {
        const dateObj = new Date(point.date + 'T00:00:00'); // Ensure local timezone
        if (period === 'month') {
            // Show month name (e.g., "Jan", "Feb")
            return MONTHS_SHORT[dateObj.getMonth()];
        } else if (period === 'week') {
            // Show day name using Indonesian (e.g., "Min", "Sen")
            return DAYS_SHORT[dateObj.getDay()];
        }
        return dateObj.getDate().toString();
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? theme.card : '#FFFFFF' }]}>
            <Text style={[styles.title, { color: theme.text }]}>Medication Adherence</Text>

            <View style={styles.chartContainer}>
                <View style={styles.barsContainer}>
                    {data.map((point, index) => {
                        const takenHeight = (point.taken / maxValue) * CHART_HEIGHT;
                        const totalHeight = (point.total / maxValue) * CHART_HEIGHT;
                        const label = getLabel(point);

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.barWrapper, { marginRight: index < data.length - 1 ? gap : 0 }]}
                                onPress={() => onBarPress?.(point)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.barColumn, { width: barWidth }]}>
                                    {/* Total bar (background) */}
                                    <View
                                        style={[
                                            styles.barBackground,
                                            {
                                                height: totalHeight || 4,
                                                backgroundColor: isDark ? theme.surface : '#E5E5EA'
                                            }
                                        ]}
                                    />

                                    {/* Taken bar (foreground) */}
                                    <LinearGradient
                                        colors={[colorsTheme.primary, colorsTheme.secondary]}
                                        style={[styles.barFill, { height: takenHeight }]}
                                    />
                                </View>

                                <Text style={[styles.label, { color: isDark ? theme.icon : '#8E8E93' }]} numberOfLines={1}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colorsTheme.primary }]} />
                    <Text style={[styles.legendText, { color: isDark ? theme.icon : '#8E8E93' }]}>Taken</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: isDark ? theme.surface : '#E5E5EA' }]} />
                    <Text style={[styles.legendText, { color: isDark ? theme.icon : '#8E8E93' }]}>Total</Text>
                </View>
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
        marginBottom: 20,
    },
    chartContainer: {
        height: CHART_HEIGHT + 30,
        marginBottom: 16,
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: CHART_HEIGHT + 30,
        justifyContent: 'space-between',
    },
    barWrapper: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
    },
    barColumn: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: CHART_HEIGHT,
        position: 'relative',
    },
    barBackground: {
        width: '100%',
        backgroundColor: '#E5E5EA',
        borderRadius: 4,
        position: 'absolute',
        bottom: 0,
    },
    barFill: {
        width: '100%',
        borderRadius: 4,
        position: 'absolute',
        bottom: 0,
    },
    label: {
        fontSize: 10,
        color: '#8E8E93',
        marginTop: 6,
        textAlign: 'center',
        width: 30, // Ensure label can span wider than bar for dates like "Jan 21"
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
});
