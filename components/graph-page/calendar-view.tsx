import { colorsTheme } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { getDoseHistory, getMedication, recordDose } from "../../utils/storage";
import { DoseHistory, Medication } from "../../utils/ttype";
import { HistoryItem } from "./history-item";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [medications, setMedications] = useState<Medication[]>([]);
    const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);

    const loadData = useCallback(async () => {
        try {
            const [meds, history] = await Promise.all([
                getMedication(),
                getDoseHistory(),
            ]);
            setMedications(meds);
            setDoseHistory(history);
        } catch (error) {
            console.error("Error loading calendar data:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(selectedDate);

    const renderCalendar = () => {
        const calendar: React.ReactNode[] = [];
        let week: React.ReactNode[] = [];

        for (let i = 0; i < firstDay; i++) {
            week.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }

        for (let day = 1; day <= days; day++) {
            const date = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                day
            );
            if (isNaN(date.getTime())) continue;

            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const hasDoses = doseHistory.some(
                (dose) => {
                    const dDate = new Date(dose.timeStamp);
                    return !isNaN(dDate.getTime()) && dDate.toDateString() === date.toDateString();
                }
            );

            week.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.calendarDay,
                        isToday && styles.today,
                        isSelected && { backgroundColor: colorsTheme.primary, borderRadius: 12 },
                        hasDoses && !isSelected && styles.hasEvents,
                    ]}
                    onPress={() => setSelectedDate(date)}
                >
                    <Text style={[
                        styles.dayText,
                        { color: isSelected ? 'white' : (isToday ? colorsTheme.primary : theme.text) },
                        isToday && styles.todayText
                    ]}>
                        {day}
                    </Text>
                    {hasDoses && <View style={[styles.eventDot, isSelected && { backgroundColor: 'white' }]} />}
                </TouchableOpacity>
            );

            if ((firstDay + day) % 7 === 0 || day === days) {
                calendar.push(
                    <View key={day} style={styles.calendarWeek}>
                        {week}
                    </View>
                );
                week = [];
            }
        }

        return calendar;
    };

    const renderMedicationsForDate = () => {
        const dateStr = selectedDate.toDateString();
        const now = new Date();
        const isPast = selectedDate < new Date(new Date().setHours(0, 0, 0, 0));
        const isToday = selectedDate.toDateString() === now.toDateString();

        const dayDoses = doseHistory.filter(
            (dose) => new Date(dose.timeStamp).toDateString() === dateStr
        );

        const validMedis = medications.filter(med => {
            const startStr = med.startDate;
            const endStr = med.endDate;

            const selDateStr = selectedDate.toISOString().split('T')[0];

            const isAfterStart = selDateStr >= startStr;
            const isBeforeEnd = !endStr || selDateStr <= endStr;

            return isAfterStart && isBeforeEnd;
        });

        if (validMedis.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: isDark ? theme.icon : '#8E8E93' }]}>No medications scheduled for this date.</Text>
                </View>
            );
        }

        return validMedis.map((medication) => {
            const dose = dayDoses.find(d => d.medicationId === medication.id);
            const scheduledTimeStr = medication.times[0] || '08:00'; // Default or first time
            const [h, m] = scheduledTimeStr.split(':').map(Number);

            const scheduledDateObj = new Date(selectedDate);
            scheduledDateObj.setHours(h, m, 0, 0);

            let status: 'taken' | 'missed' | 'pending';

            if (dose) {
                status = dose.taken ? 'taken' : 'missed';
            } else if (now > scheduledDateObj) {
                status = 'missed';
            } else {
                status = 'pending';
            }

            const timeDiff = now.getTime() - scheduledDateObj.getTime();
            const isLocked = timeDiff >= 24 * 60 * 60 * 1000;
            const isFuture = now < scheduledDateObj;

            const isInteractive = !isLocked && status !== 'taken';

            const historyItem = {
                id: medication.id,
                medicationId: medication.id,
                medicationName: medication.name,
                dosage: medication.dosage,
                time: scheduledTimeStr,
                status: status
            };

            return (
                <TouchableOpacity
                    key={medication.id}
                    disabled={!isInteractive}
                    onPress={async () => {
                        if (isInteractive) {
                            const recordDate = new Date(selectedDate);
                            recordDate.setHours(h, m, 0);
                            await recordDose(medication.id, true, recordDate.toISOString());
                            loadData();
                        }
                    }}
                    style={isLocked ? { opacity: 0.6 } : {}}
                >
                    <HistoryItem item={historyItem} />
                </TouchableOpacity>
            );
        });
    };

    const isDateToday = selectedDate.toDateString() === new Date().toDateString();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? theme.background : '#F2F2F7' }]}>
            <View style={styles.content}>
                <View style={[styles.calendarContainer, { backgroundColor: isDark ? theme.card : 'white' }]}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: isDark ? theme.surface : '#F2F2F7' }]}
                            onPress={() =>
                                setSelectedDate(
                                    new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth() - 1,
                                        1
                                    )
                                )
                            }
                        >
                            <Ionicons name="chevron-back" size={20} color={colorsTheme.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.monthText, { color: theme.text }]}>
                            {selectedDate.toLocaleString("default", {
                                month: "long",
                                year: "numeric",
                            })}
                        </Text>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: isDark ? theme.surface : '#F2F2F7' }]}
                            onPress={() =>
                                setSelectedDate(
                                    new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth() + 1,
                                        1
                                    )
                                )
                            }
                        >
                            <Ionicons name="chevron-forward" size={20} color={colorsTheme.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekdayHeader}>
                        {WEEKDAYS.map((day) => (
                            <Text key={day} style={[styles.weekdayText, { color: isDark ? theme.icon : '#8E8E93' }]}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {renderCalendar()}
                    </View>
                </View>

                <View style={[styles.scheduleContainer, { backgroundColor: isDark ? theme.card : "white" }]}>
                    <View style={styles.scheduleHeader}>
                        <Text style={[styles.scheduleTitle, { color: theme.text }]}>
                            {isDateToday ? "Today's Schedule" : selectedDate.toLocaleDateString("default", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </Text>
                        <View style={styles.titleUnderline} />
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scheduleScroll}
                    >
                        {renderMedicationsForDate()}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    content: {
        flex: 1,
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginTop: 16,
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    headerButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
    },
    monthText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1C1C1E",
    },
    weekdayHeader: {
        flexDirection: "row",
        marginBottom: 12,
    },
    weekdayText: {
        flex: 1,
        textAlign: "center",
        color: "#8E8E93",
        fontSize: 12,
        fontWeight: "600",
        textTransform: 'uppercase',
    },
    calendarGrid: {
        width: '100%',
    },
    calendarWeek: {
        flexDirection: "row",
        marginBottom: 4,
    },
    calendarDay: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        margin: 2,
    },
    dayText: {
        fontSize: 15,
        color: "#1C1C1E",
        fontWeight: '500',
    },
    today: {
        backgroundColor: colorsTheme.primary + '15',
        borderWidth: 1,
        borderColor: colorsTheme.primary + '30',
    },
    todayText: {
        color: colorsTheme.primary,
        fontWeight: "700",
    },
    hasEvents: {
        position: "relative",
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colorsTheme.primary,
        position: "absolute",
        bottom: 6,
    },
    scheduleContainer: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 30,
        paddingTop: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10,
    },
    scheduleHeader: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    scheduleTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1C1C1E",
        marginBottom: 8,
    },
    titleUnderline: {
        width: 40,
        height: 4,
        backgroundColor: colorsTheme.primary,
        borderRadius: 2,
    },
    scheduleScroll: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
    },
});