import { colorsTheme } from "@/constants/theme";
import { useMedication } from "@/context/medicine";
import { useTheme } from "@/context/theme-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function ClosestMedicine() {
    const { isDark } = useTheme();
    const { medications, todayDoses } = useMedication();
    const [nearestDose, setNearestDose] = useState<{
        name: string;
        dosage: string;
        time: string;
        countdown: string;
        color: string;
        isOverdue: boolean;
    } | null>(null);

    useEffect(() => {
        const updateClosest = () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const { toLocalISOString } = require('@/utils/ttype');
            const todayStr = toLocalISOString(now);

            let closestDiff = Infinity;
            let closestMed = null;

            medications.forEach(med => {
                if (!med.isActive || med.startDate > todayStr || (med.endDate && med.endDate < todayStr)) return;

                med.times.forEach(time => {
                    const [h, m] = time.split(':').map(Number);
                    const doseMinutes = h * 60 + m;

                    // We want the smallest NON-NEGATIVE difference (future/now)
                    // If we want to show overdue, we'd look for negative diffs that aren't taken.
                    // For now, let's focus on "Next Upcoming" as per standard "Closest" logic.
                    // If user wants overdue specific, we can adjust. 
                    // Let's stick to future >= currentMinutes.

                    // Actually, if it's 14:05 and dose was 14:00 and not taken, it IS the closest relevant one.
                    // But the prompt says "kurang berapa menit/ jam terdekat obat diminum" (how many mins/hrs left UNTIL).
                    // This implies future tense. So we stick to diff >= 0.

                    let diff = doseMinutes - currentMinutes;

                    if (diff >= 0 && diff < closestDiff) {
                        const isTaken = todayDoses.some(d => d.medicationId === med.id && d.timeStamp.includes(`${todayStr}T`));

                        if (!isTaken) {
                            closestDiff = diff;

                            // Format countdown
                            let countdown = "";
                            if (diff === 0) {
                                countdown = "Now";
                            } else if (diff < 60) {
                                countdown = `${diff} min left`;
                            } else {
                                const hrs = Math.floor(diff / 60);
                                const mins = diff % 60;
                                countdown = mins > 0 ? `${hrs}h ${mins}m left` : `${hrs} hours left`;
                            }

                            closestMed = {
                                name: med.name,
                                dosage: `${med.dosage} ${med.dosageUnit}`,
                                time: time,
                                countdown: countdown,
                                color: med.color || colorsTheme.primary,
                                isOverdue: false
                            };
                        }
                    }
                });
            });

            setNearestDose(closestMed);
        };

        updateClosest();
        // Update every minute to keep countdown fresh
        const interval = setInterval(updateClosest, 60000);
        return () => clearInterval(interval);
    }, [medications, todayDoses]);

    if (!nearestDose) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
                <View style={[styles.emptyContent, { opacity: 0.6 }]}>
                    <MaterialCommunityIcons name="check-all" size={32} color={colorsTheme.primary} />
                    <View>
                        <Text style={[styles.emptyTitle, { color: isDark ? '#fff' : '#000' }]}>All Caught Up</Text>
                        <Text style={[styles.emptySubtitle, { color: isDark ? '#A0A0A0' : '#666' }]}>No more doses for today</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
            <View style={styles.topRow}>
                <View style={styles.leftCol}>
                    <Text style={[styles.label, { color: isDark ? '#A0A0A0' : '#888' }]}>NEXT DOSE</Text>
                    <Text style={[styles.medName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
                        {nearestDose.name}
                    </Text>
                    <Text style={[styles.dosage, { color: isDark ? '#ccc' : '#666' }]}>
                        {nearestDose.dosage}
                    </Text>
                </View>

                <View style={styles.rightCol}>
                    <View style={[styles.countdownBadge, { backgroundColor: nearestDose.color + '15' }]}>
                        <MaterialCommunityIcons name="timer-outline" size={16} color={nearestDose.color} />
                        <Text style={[styles.countdownText, { color: nearestDose.color }]}>
                            {nearestDose.countdown}
                        </Text>
                    </View>
                    <Text style={[styles.timeText, { color: isDark ? '#fff' : '#333' }]}>
                        {nearestDose.time}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 4,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftCol: {
        flex: 1,
        gap: 4,
    },
    rightCol: {
        alignItems: 'flex-end',
        gap: 6,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    medName: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    dosage: {
        fontSize: 14,
        fontWeight: '500',
    },
    countdownBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    countdownText: {
        fontSize: 13,
        fontWeight: '700',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
    emptyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptySubtitle: {
        fontSize: 13,
    },
});