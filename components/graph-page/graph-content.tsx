import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AdherenceIndicator } from './adherence-indicator';
import { BarChart } from './bar-chart';
import { CalendarView } from './calendar-view';
import { ScheduleList } from './schedule-list';
import { StatsGrid } from './stats-grid';
import { AdherenceStats, DayHistory, GraphDataPoint, TimePeriod } from './types';

interface GraphContentProps {
    graphData: GraphDataPoint[];
    stats: AdherenceStats;
    historyData: DayHistory[];
    period: TimePeriod;
    loading: boolean;
    dateRange: { start: Date; end: Date };
}

export function GraphContent({ graphData, stats, historyData, period, loading, dateRange }: GraphContentProps) {
    const [selectedBar, setSelectedBar] = useState<GraphDataPoint | null>(null);

    // Filter history data based on selected bar
    const filteredHistoryData = useMemo<DayHistory[]>(() => {
        if (!selectedBar) {
            return historyData;
        }

        // For month view, use startDate and endDate from the selected bar
        if (period === 'month' && selectedBar.startDate && selectedBar.endDate) {
            const startDate = new Date(selectedBar.startDate);
            const endDate = new Date(selectedBar.endDate);
            endDate.setHours(23, 59, 59, 999);

            return historyData.filter((day) => {
                const dayDate = new Date(day.date);
                return dayDate >= startDate && dayDate <= endDate;
            });
        }

        // For week view, filter by exact date
        const selectedDateStr = selectedBar.date;
        return historyData.filter((day) => {
            const dayDateStr = new Date(day.date).toISOString().split('T')[0];
            return dayDateStr === selectedDateStr;
        });
    }, [selectedBar, historyData, period]);

    // Calculate selected date range for display
    const selectedDateRange = useMemo(() => {
        if (!selectedBar) {
            return dateRange;
        }

        if (period === 'month' && selectedBar.startDate && selectedBar.endDate) {
            return {
                start: new Date(selectedBar.startDate),
                end: new Date(selectedBar.endDate),
            };
        }

        // For week - single day
        const date = new Date(selectedBar.date);
        return {
            start: date,
            end: date,
        };
    }, [selectedBar, dateRange, period]);

    const handleBarPress = (point: GraphDataPoint) => {
        // Toggle selection - if same bar is pressed, clear selection
        if (selectedBar?.date === point.date) {
            setSelectedBar(null);
        } else {
            setSelectedBar(point);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EA7B7B" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.section}>
                {period !== 'calendar' ? (
                    <>
                        <View style={styles.section}>
                            <AdherenceIndicator rate={stats.adherenceRate} />
                        </View>

                        <View style={styles.section}>
                            <BarChart
                                data={graphData}
                                period={period}
                                onBarPress={handleBarPress}
                            />
                        </View>

                        <View style={styles.section}>
                            <StatsGrid stats={stats} />
                        </View>

                        <View style={styles.section}>
                            <ScheduleList
                                historyData={filteredHistoryData}
                                period={period}
                                dateRange={selectedDateRange}
                                isFiltered={selectedBar !== null}
                            />
                        </View>
                    </>
                ) : (
                    <CalendarView />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    section: {
        marginBottom: 20,
    },
});
