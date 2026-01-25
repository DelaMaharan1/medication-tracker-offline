/**
 * Graph Page Types
 * @module GraphPageTypes
 */

export type TimePeriod = 'week' | 'month' | 'calendar';

export interface GraphDataPoint {
    date: string;
    taken: number;
    total: number;
    adherenceRate: number;
    startDate?: string; // For monthly view - start of the month
    endDate?: string;   // For monthly view - end of the month
}

export interface StatCardData {
    label: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
}

export interface AdherenceStats {
    totalDoses: number;
    takenDoses: number;
    missedDoses: number;
    adherenceRate: number;
}

export interface MedicationHistoryItem {
    id: string;
    medicationId: string;
    medicationName: string;
    time: string;
    status: 'taken' | 'missed' | 'pending';
    dosage: string;
}

export interface DayHistory {
    date: string;
    items: MedicationHistoryItem[];
}
