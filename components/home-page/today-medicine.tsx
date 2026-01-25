import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useSnackbar } from '@/context/snackbar';
import { useTheme } from '@/context/theme-context';
import { DoseHistory, Medication, takenStatus } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ItemSection } from './today-section/item-card';
import { MedicineEmptySection } from './today-section/medicine-empty';

interface TodayMedication extends Medication {
    doseHistory?: DoseHistory;
}

function isMedication(item: any): item is Medication {
    return item &&
        typeof item === 'object' &&
        'name' in item &&
        'dosage' in item &&
        'startDate' in item &&
        'reminderEnabled' in item;
}

export function TodayMedicationSection() {
    const { medications, loading, refreshMedications, takeMedication, getTodayDoseCount, globalNotifications } = useMedication();
    const { showSnackbar } = useSnackbar();
    const { theme, isDark } = useTheme();
    const [showAll, setShowAll] = useState(false);

    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            refreshMedications();
            return () => { };
        }, [])
    );

    const getTodayMedications = React.useMemo((): TodayMedication[] => {
        const today = new Date().toISOString().split('T')[0];

        const validMedications = medications.filter(isMedication);

        const todayMeds: TodayMedication[] = validMedications
            .filter((med: Medication) => {
                // Keep showing medications once they have started
                return med.startDate <= today;
            })
            .map((med: Medication): TodayMedication => {
                const doseCount = getTodayDoseCount(med.id);
                const requiredDoses = med.times?.length || 1;
                const isExpired = med.endDate && med.endDate < today;

                // Sort times to check them in order
                const sortedTimes = [...(med.times || [])].sort();
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentTimeVal = currentHour * 60 + currentMinute;

                let status: takenStatus = 'take';

                if (doseCount >= requiredDoses) {
                    status = 'taken';
                } else {
                    // Check if the next scheduled dose (based on doseCount) has passed
                    // e.g. if doseCount = 0, check sortedTimes[0]
                    // if doseCount = 1, check sortedTimes[1]
                    const nextDoseIndex = Math.min(doseCount, sortedTimes.length - 1);
                    if (sortedTimes.length > 0) {
                        const [h, m] = sortedTimes[nextDoseIndex].split(':').map(Number);
                        const scheduledTimeVal = h * 60 + m;

                        if (currentTimeVal > scheduledTimeVal) {
                            status = 'missed';
                        }
                    }
                }

                return {
                    ...med,
                    doseHistory: {
                        id: `dose-${med.id}-${today}`,
                        medicationId: med.id,
                        timeStamp: new Date().toISOString(),
                        taken: doseCount,
                        takenStatus: status
                    },
                    isActive: med.reminderEnabled && !isExpired && globalNotifications
                };
            });

        return todayMeds;
    }, [medications, getTodayDoseCount, globalNotifications]);

    // Separate active and inactive medications
    const activeMedications = React.useMemo(() => {
        return getTodayMedications.filter(med => med.isActive);
    }, [getTodayMedications]);

    const inactiveMedications = React.useMemo(() => {
        return getTodayMedications.filter(med => !med.isActive);
    }, [getTodayMedications]);

    // Calculate visible medications based on showAll state
    const visibleMedications = React.useMemo(() => {
        if (showAll) {
            // Show All: Return everything (Active + Inactive)
            return getTodayMedications;
        }

        // Show Active: Return only active medications (reminderEnabled === true && !expired)
        return activeMedications;
    }, [showAll, getTodayMedications, activeMedications]);

    const visibleActiveMeds = React.useMemo(() => {
        return visibleMedications.filter(med => med.isActive);
    }, [visibleMedications]);

    const visibleInactiveMeds = React.useMemo(() => {
        return visibleMedications.filter(med => !med.isActive);
    }, [visibleMedications]);

    const hasActiveData = activeMedications.length > 0;
    const hasInactiveData = inactiveMedications.length > 0;
    const hasData = getTodayMedications.length > 0;

    // Button visibility:
    // Show toggle if there are ANY inactive medications to hide/show
    // If all meds are active, "Show Active" and "Show All" are the same, so no need for button?
    // User requirement: "Show All -> tampilkan semua", "Show Active -> tampilkan reminderEnabled === true"
    // So if there are inactive meds, we allow toggling.
    const shouldShowAllButton = hasInactiveData;

    const visibleActiveMedsToShow = visibleActiveMeds;
    const visibleInactiveMedsToShow = visibleInactiveMeds;

    const handleEdit = (id: string) => {
        router.push({
            pathname: '/medication/add',
            params: { id }
        });
    };

    const handleTakeMedication = async (medicationId: string, status: takenStatus) => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const result = await takeMedication(medicationId, time);
        if (result.success) {
            showSnackbar('Medication marked as taken', 'success');
        } else {
            showSnackbar(result.error || 'Failed to record dose', 'error');
        }
    };

    if (loading) {
        return (
            <View style={styles.section}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colorsTheme.primary} />
                    <Text style={[styles.loadingText, { color: theme.icon }]}>Loading Medications....</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            {/* Title & See All Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Schedule</Text>
                    {shouldShowAllButton && (
                        <TouchableOpacity onPress={() => setShowAll(prev => !prev)}>
                            <Text style={styles.seeAllBtn}>
                                {showAll ? 'Show Active' : `Show All (${getTodayMedications.length})`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.headerAddBtn}
                    onPress={() => router.push('/medication/add')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={{ height: 12 }} />

            {/* SCENARIO 1: Empty State - No medications at all */}
            {!hasData && <MedicineEmptySection />}

            {/* SCENARIO 2: Has Data */}
            {hasData && (
                <>
                    {/* Active Medications Section */}
                    {visibleActiveMedsToShow.length > 0 ? (
                        <View style={styles.medicationsContainer}>
                            {visibleActiveMedsToShow.map((item: TodayMedication) => (
                                <View key={item.id} style={styles.activeCard}>
                                    <ItemSection
                                        medicine={item}
                                        doseHistory={item.doseHistory!}
                                        onEdit={() => handleEdit(item.id)}
                                        onTakeMedication={() => handleTakeMedication(item.id, 'taken')}
                                    />
                                </View>
                            ))}
                        </View>
                    ) : (
                        // If we are in "Show Active" mode but there are no active meds (only inactive)
                        !showAll && hasInactiveData && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No active medications.</Text>
                                <Text style={styles.emptySubtext}>Switch to "Show All" to see inactive reminders.</Text>
                            </View>
                        )
                    )}

                    {/* Inactive Medications Section - Only visible when Active options are exhausted or simply just list them */}
                    {visibleInactiveMedsToShow.length > 0 && (
                        <View style={[styles.inactiveSection, { marginTop: visibleActiveMedsToShow.length > 0 ? 16 : 0 }]}>
                            <Text style={styles.inactiveTitle}>Inactive Reminders</Text>
                            <View style={styles.medicationsContainer}>
                                {visibleInactiveMedsToShow.map((item: TodayMedication) => (
                                    <View key={item.id} style={styles.inactiveCard}>
                                        <View style={styles.inactiveOverlay} />
                                        <ItemSection
                                            medicine={item}
                                            doseHistory={item.doseHistory!}
                                            onEdit={() => handleEdit(item.id)}
                                            onTakeMedication={() => handleTakeMedication(item.id, 'taken')}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerAddBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colorsTheme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colorsTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    seeAllBtn: {
        fontSize: 14,
        fontWeight: '600',
        color: colorsTheme.primary,
    },
    medicationsContainer: {
        marginBottom: 8,
    },
    activeCard: {
        marginBottom: 12,
    },
    inactiveSection: {
        // marginTop is set dynamically inline based on hasActiveData
    },
    inactiveTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        marginLeft: 4,
    },
    inactiveCard: {
        marginBottom: 12,
        position: 'relative',
    },
    inactiveOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 16,
        zIndex: 0.9,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: 'transparent',
    },
    loadingText: {
        marginTop: 16,
        color: '#8E8E93',
        fontSize: 15,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        marginTop: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#8E8E93',
    }
});