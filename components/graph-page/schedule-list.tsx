import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HistoryItem } from './history-item';
import { DayHistory, TimePeriod } from './types';

interface ScheduleListProps {
    historyData: DayHistory[];
    period: TimePeriod;
    dateRange: { start: Date; end: Date };
    isFiltered?: boolean;
}

const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatDateRange(start: Date, end: Date): string {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

    // Same day - show single date
    if (startDay === endDay && startMonth === endMonth) {
        return `${startDay} ${startMonth}`;
    }

    if (startMonth === endMonth) {
        return `${startDay} - ${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

function formatMonthHeader(date: Date): string {
    const month = MONTHS_ID[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
}

function formatDayHeader(date: Date): string {
    const dayName = DAYS_ID[date.getDay()];
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${dayName}, ${day} ${month}`;
}

export function ScheduleList({ historyData, period, dateRange, isFiltered }: ScheduleListProps) {
    const { theme, isDark } = useTheme();

    if (period === 'calendar') {
        return null;
    }

    const headerText = period === 'week'
        ? formatDateRange(dateRange.start, dateRange.end)
        : formatMonthHeader(dateRange.end);

    const isEmpty = historyData.length === 0;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? theme.card : '#FFFFFF' }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {period === 'week' ? 'Jadwal Minggu Ini' : 'Jadwal Bulanan'}
                </Text>
                <Text style={styles.headerSubtitle}>{headerText}</Text>
                <View style={styles.titleUnderline} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled
            >
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: isDark ? theme.icon : '#8E8E93' }]}>
                            Tidak ada obat yang tercatat untuk periode ini.
                        </Text>
                    </View>
                ) : (
                    historyData.map((day) => {
                        const dayDate = new Date(day.date);
                        const dayHeaderText = formatDayHeader(dayDate);

                        return (
                            <View key={day.date} style={styles.daySection}>
                                <Text style={[styles.dayHeader, { color: isDark ? theme.icon : '#8E8E93' }]}>{dayHeaderText}</Text>
                                {day.items.map((item) => (
                                    <HistoryItem key={item.id} item={item} />
                                ))}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        maxHeight: 500,
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: colorsTheme.primary,
        marginBottom: 8,
    },
    titleUnderline: {
        width: 40,
        height: 3,
        backgroundColor: colorsTheme.primary,
        borderRadius: 2,
    },
    scrollContent: {
        paddingBottom: 8,
    },
    daySection: {
        marginBottom: 16,
    },
    dayHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 14,
        textAlign: 'center',
    },
});
