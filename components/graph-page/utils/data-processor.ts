import { DoseHistory, Medication } from '@/utils/ttype';
import { AdherenceStats, DayHistory, GraphDataPoint, MedicationHistoryItem, TimePeriod } from '../types';

/**
 * Helper to normalize dates to start or end of day with safety checks
 */
function normalizeToEdge(date: Date, type: 'start' | 'end'): Date {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date(); // Fallback to current date if invalid

    if (type === 'start') {
        d.setHours(0, 0, 0, 0);
    } else {
        d.setHours(23, 59, 59, 999);
    }
    return d;
}

/**
 * Get date range based on selected period
 */
export function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
    const end = normalizeToEdge(new Date(), 'end');
    const start = new Date(end);

    switch (period) {
        case 'week':
            start.setDate(end.getDate() - 6);
            break;
        case 'month':
            // 6 months ago
            start.setMonth(end.getMonth() - 5);
            start.setDate(1);
            break;
        case 'calendar':
            start.setDate(1);
            break;
    }

    return { start: normalizeToEdge(start, 'start'), end };
}

/**
 * Generate graph data points from medications and actual dose history
 */
/**
 * Helper to format date as YYYY-MM-DD using LOCAL time
 * Safe replacement for toISOString().split('T')[0] which uses UTC
 */
function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate graph data points from medications and actual dose history
 */
export function generateGraphData(
    medications: Medication[],
    doseHistory: DoseHistory[],
    dateRange: { start: Date; end: Date }
): GraphDataPoint[] {
    const data: GraphDataPoint[] = [];
    const currentDate = new Date(dateRange.start);

    while (currentDate <= dateRange.end) {
        const dateStr = currentDate.toDateString();

        // Calculate total expected doses for this date
        const totalDoses = medications.reduce((sum, med) => {
            const medStartDate = new Date(med.startDate);
            if (isNaN(medStartDate.getTime())) return sum;

            const medEndDate = med.endDate ? new Date(med.endDate) : null;

            const checkDate = normalizeToEdge(currentDate, 'start');
            const start = normalizeToEdge(medStartDate, 'start');
            const end = medEndDate ? normalizeToEdge(medEndDate, 'end') : null;

            if (checkDate >= start && (!end || checkDate <= end)) {
                return sum + (med.times?.length || 0);
            }
            return sum;
        }, 0);

        // Calculate actual taken doses from history
        const takenDoses = doseHistory.filter(dose => {
            const doseDate = new Date(dose.timeStamp).toDateString();
            return doseDate === dateStr && dose.taken === 1;
        }).length;

        data.push({
            date: toLocalDateString(currentDate), // FIX: Use local date
            taken: Math.max(0, takenDoses),
            total: Math.max(0, totalDoses),
            adherenceRate: totalDoses > 0 ? Math.min(100, (takenDoses / totalDoses) * 100) : 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
}

/**
 * Generate monthly aggregated graph data (1 bar per month)
 */
export function generateMonthlyGraphData(
    medications: Medication[],
    doseHistory: DoseHistory[],
    dateRange: { start: Date; end: Date }
): GraphDataPoint[] {
    const data: GraphDataPoint[] = [];
    const currentDate = new Date(dateRange.start);
    currentDate.setDate(1); // Start from first day of month

    while (currentDate <= dateRange.end) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get first and last day of the month
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

        // Cap at dateRange boundaries
        const effectiveStart = monthStart < dateRange.start ? dateRange.start : monthStart;
        const effectiveEnd = monthEnd > dateRange.end ? dateRange.end : monthEnd;

        let totalDoses = 0;
        let takenDoses = 0;

        // Iterate through each day in the month
        const dayIterator = new Date(effectiveStart);
        while (dayIterator <= effectiveEnd) {
            const dateStr = dayIterator.toDateString();

            // Calculate total expected doses for this date
            totalDoses += medications.reduce((sum, med) => {
                const medStartDate = new Date(med.startDate);
                if (isNaN(medStartDate.getTime())) return sum;

                const medEndDate = med.endDate ? new Date(med.endDate) : null;
                const checkDate = normalizeToEdge(dayIterator, 'start');
                const start = normalizeToEdge(medStartDate, 'start');
                const end = medEndDate ? normalizeToEdge(medEndDate, 'end') : null;

                if (checkDate >= start && (!end || checkDate <= end)) {
                    return sum + (med.times?.length || 0);
                }
                return sum;
            }, 0);

            // Calculate taken doses
            takenDoses += doseHistory.filter(dose => {
                const doseDate = new Date(dose.timeStamp).toDateString();
                return doseDate === dateStr && dose.taken === 1;
            }).length;

            dayIterator.setDate(dayIterator.getDate() + 1);
        }

        data.push({
            date: toLocalDateString(monthStart), // FIX: Use local date
            taken: Math.max(0, takenDoses),
            total: Math.max(0, totalDoses),
            adherenceRate: totalDoses > 0 ? Math.min(100, (takenDoses / totalDoses) * 100) : 0,
            startDate: toLocalDateString(effectiveStart), // FIX: Use local date
            endDate: toLocalDateString(effectiveEnd), // FIX: Use local date
        });

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return data;
}

/**
 * Calculate adherence statistics from graph data
 */
export function calculateAdherenceStats(data: GraphDataPoint[]): AdherenceStats {
    const totalDoses = data.reduce((sum, point) => sum + point.total, 0);
    const takenDoses = data.reduce((sum, point) => sum + point.taken, 0);
    const missedDoses = Math.max(0, totalDoses - takenDoses);
    const adherenceRate = totalDoses > 0 ? Math.min(100, (takenDoses / totalDoses) * 100) : 0;

    return {
        totalDoses: Math.max(0, totalDoses),
        takenDoses: Math.max(0, takenDoses),
        missedDoses,
        adherenceRate,
    };
}

/**
 * Generate history data for the graph page - includes ALL scheduled medications
 */
export function generateHistoryData(
    medications: Medication[],
    doseHistory: DoseHistory[],
    dateRange: { start: Date; end: Date }
): DayHistory[] {
    const history: DayHistory[] = [];
    const currentDate = new Date(dateRange.end); // Start from most recent
    const now = new Date();

    while (currentDate >= dateRange.start) {
        const dateStr = currentDate.toDateString();
        const dayItems: MedicationHistoryItem[] = [];

        medications.forEach(med => {
            const medStartDate = new Date(med.startDate);
            if (isNaN(medStartDate.getTime())) return;

            const medEndDate = med.endDate ? new Date(med.endDate) : null;

            const checkDate = normalizeToEdge(currentDate, 'start');
            const start = normalizeToEdge(medStartDate, 'start');
            const end = medEndDate ? normalizeToEdge(medEndDate, 'end') : null;

            if (checkDate >= start && (!end || checkDate <= end)) {
                med.times.forEach(time => {
                    const [h, m] = time.split(':').map(Number);
                    const scheduledTime = new Date(currentDate);
                    scheduledTime.setHours(h, m, 0, 0);

                    // Find dose record for this medication at this time
                    const doseRecord = doseHistory.find(dose => {
                        const dDate = new Date(dose.timeStamp);
                        if (isNaN(dDate.getTime())) return false;

                        const doseDateStr = dDate.toDateString();
                        return dose.medicationId === med.id && doseDateStr === dateStr;
                    });

                    // Determine status
                    let status: 'taken' | 'missed' | 'pending';
                    let displayTime = time; // Default to scheduled time

                    if (doseRecord) {
                        status = doseRecord.taken === 1 ? 'taken' : 'missed';

                        // If taken, use the ACTUAL taken time
                        if (status === 'taken') {
                            const takenDate = new Date(doseRecord.timeStamp);
                            const h = takenDate.getHours().toString().padStart(2, '0');
                            const m = takenDate.getMinutes().toString().padStart(2, '0');
                            displayTime = `${h}:${m}`;
                        }
                    } else if (now > scheduledTime) {
                        status = 'missed';
                    } else {
                        status = 'pending';
                    }

                    dayItems.push({
                        id: `${med.id}-${currentDate.toISOString()}-${time}`,
                        medicationId: med.id,
                        medicationName: med.name,
                        time: displayTime, // Use the actual time if taken
                        status: status,
                        dosage: `${med.dosage} ${med.dosageUnit}`,
                    });
                });
            }
        });

        if (dayItems.length > 0) {
            history.push({
                date: currentDate.toISOString(),
                items: dayItems.sort((a, b) => a.time.localeCompare(b.time)),
            });
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    return history;
}

/**
 * Format date for display based on period
 */
export function formatDateLabel(dateStr: string, period: TimePeriod): string {
    const date = new Date(dateStr);

    switch (period) {
        case 'week':
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        case 'month':
            return date.getDate().toString();
        case 'calendar':
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        default:
            return dateStr;
    }
}



