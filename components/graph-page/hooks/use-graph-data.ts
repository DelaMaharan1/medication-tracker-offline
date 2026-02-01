import { useMedication } from '@/context/medicine';
import { getDoseHistory } from '@/utils/storage';
import { DoseHistory } from '@/utils/ttype';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdherenceStats, DayHistory, GraphDataPoint, TimePeriod } from '../types';
import {
    calculateAdherenceStats,
    generateGraphData,
    generateHistoryData,
    generateMonthlyGraphData,
    getDateRangeForPeriod
} from '../utils/data-processor';

export function useGraphData() {
    const { medications, refreshMedications } = useMedication();
    const [period, setPeriod] = useState<TimePeriod>('calendar');
    const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            if (refreshMedications) {
                await refreshMedications();
            }
            const history = await getDoseHistory();
            setDoseHistory(history || []);
        } catch (error) {
            console.error('[GraphData] Refresh failed:', error);
            setDoseHistory([]);
        } finally {
            setLoading(false);
        }
    }, [refreshMedications]);

    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, [refreshData])
    );

    useEffect(() => {
        refreshData();
    }, [period]);

    const dateRange = useMemo(() => {
        return getDateRangeForPeriod(period);
    }, [period]);

    const graphData = useMemo<GraphDataPoint[]>(() => {
        // Use monthly aggregation for month period
        if (period === 'month') {
            return generateMonthlyGraphData(medications, doseHistory, dateRange);
        }
        return generateGraphData(medications, doseHistory, dateRange);
    }, [medications, doseHistory, dateRange, period]);

    const stats = useMemo<AdherenceStats>(() => {
        return calculateAdherenceStats(graphData);
    }, [graphData]);

    const historyData = useMemo<DayHistory[]>(() => {
        return generateHistoryData(medications, doseHistory, dateRange);
    }, [medications, doseHistory, dateRange]);

    return {
        period,
        setPeriod,
        graphData,
        stats,
        historyData,
        loading,
        dateRange,
        refreshData,
    };
}



