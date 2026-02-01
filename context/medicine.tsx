import { recordDose, updateMedication } from '@/utils/storage';
import { DoseHistory, Medication } from '@/utils/ttype';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export interface RefillNotification {
    medicationId: string;
    medicationName: string;
    currentSupply: number;
}

interface MedicineContextType {
    medications: Medication[];
    todayDoses: DoseHistory[]; // Exposed
    loading: boolean;
    refreshMedications: () => Promise<void>;
    takeMedication: (id: string, time: string) => Promise<{ success: boolean; error?: string }>;
    refillMedication: (id: string, newSupply: number) => Promise<void>;
    handleRefillLater: (id: string) => Promise<void>;
    getTodayDoseCount: (medicationId: string) => number;
    getCompletedDosesCount: () => number;
    clearAllData: () => Promise<void>;
    getNotifications: () => { medication: Medication, time: string }[];
    refillNotifications: RefillNotification[];
    pendingCount: number;
    globalNotifications: boolean;
    setGlobalNotifications: (enabled: boolean) => Promise<void>;
    globalRefillReminders: boolean;
    setGlobalRefillReminders: (enabled: boolean) => Promise<void>;
    voiceNotifications: boolean;
    setVoiceNotifications: (enabled: boolean) => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: React.ReactNode }) {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [todayDoses, setTodayDoses] = useState<DoseHistory[]>([]);
    const [refillNotifications, setRefillNotifications] = useState<RefillNotification[]>([]);
    const [globalNotifications, setGlobalNotificationsState] = useState(true);
    const [globalRefillReminders, setGlobalRefillRemindersState] = useState(true);
    const [voiceNotifications, setVoiceNotificationsState] = useState(true);
    const [loading, setLoading] = useState(true);
    const appState = useRef(AppState.currentState);

    const refreshMedications = useCallback(async () => {
        try {
            const { getGlobalNotifications, getVoiceNotifications, getMedication, getTodayDoses, getGlobalRefillReminders } = await import('@/utils/storage');

            const [medData, doseData, globalEnabled, voiceEnabled, globalRefillEnabled] = await Promise.all([
                getMedication(),
                getTodayDoses(),
                getGlobalNotifications(),
                getVoiceNotifications(),
                getGlobalRefillReminders()
            ]);

            setMedications(medData);
            setTodayDoses(doseData);
            setGlobalNotificationsState(globalEnabled);
            setVoiceNotificationsState(voiceEnabled);
            setGlobalRefillRemindersState(globalRefillEnabled);

            const lowStockMeds = (globalEnabled && globalRefillEnabled) ? medData.filter(med =>
                // Reminder enabled (implicit true per new requirement) and logic met
                med.refillReminder &&
                med.currentSupply <= med.refillAt
            ).map(med => ({
                medicationId: med.id,
                medicationName: med.name,
                currentSupply: med.currentSupply
            })) : [];
            setRefillNotifications(lowStockMeds);
        } catch (error) {
            console.error('Failed to load medications', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auth State Listener & Storage Sync
    useEffect(() => {
        const { auth } = require('@/utils/firebase');
        const { onAuthStateChanged } = require('firebase/auth');
        const { setStorageUserId } = require('@/utils/storage');

        const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
            if (user) {
                console.log('User signed in:', user.uid);
                setStorageUserId(user.uid);
                await refreshMedications();
            } else {
                console.log('User signed out.');
                setStorageUserId(null); // Switch to guest/legacy storage
                // Option A: Clear state for privacy (preferred)
                setMedications([]);
                setTodayDoses([]);
                setRefillNotifications([]);
                // Option B: Show legacy data (guest) - uncomment to enable
                // await refreshMedications(); 
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const lastSyncHash = useRef<string>('');

    // App State Listener (Foreground Refresh)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App has come to the foreground, refreshing medications...');
                refreshMedications();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Sync Engine: Automatically update scheduled notifications when data changes
    const isSyncing = useRef(false);

    useEffect(() => {
        const sync = async () => {
            if (isSyncing.current) return;
            isSyncing.current = true;

            try {
                // Relevant state for sync: medications content, global toggle
                const medicationsHash = medications.map(m =>
                    `${m.id}-${m.updatedAt || ''}-${m.reminderEnabled}`
                ).join('|');
                const combinedHash = `${medicationsHash}-${globalNotifications}`;

                // Only sync if actual notification-related data changed
                if (combinedHash === lastSyncHash.current) {
                    isSyncing.current = false;
                    return;
                }
                lastSyncHash.current = combinedHash;

                console.log('[SyncEngine] Data changed, rescheduling notifications...');
                const { syncAllMedicationReminders } = await import('@/utils/notification');
                const { DURATION_OPTIONS } = await import('@/constants/medicine/duration');
                await syncAllMedicationReminders(medications, globalNotifications, DURATION_OPTIONS);
            } catch (error) {
                console.error("Sync Engine Error:", error);
            } finally {
                isSyncing.current = false;
            }
        };

        if (!loading) {
            sync();
        }
    }, [medications, globalNotifications, loading]);

    const toggleGlobalNotifications = async (enabled: boolean) => {
        try {
            // Optimistic Update: Update State Immediately
            setGlobalNotificationsState(enabled);

            // Async Background Work
            const { setGlobalNotifications: saveGlobal, getMedication } = await import('@/utils/storage');
            const { syncAllMedicationReminders } = await import('@/utils/notification');
            const { DURATION_OPTIONS } = await import('@/constants/medicine/duration');

            await saveGlobal(enabled);

            // Sync Notifications (Heavy operation)
            const meds = await getMedication();
            await syncAllMedicationReminders(meds, enabled, DURATION_OPTIONS);
        } catch (error) {
            console.error('Failed to toggle notifications', error);
            // Revert state on error if needed, though rare for local storage
            setGlobalNotificationsState(!enabled);
        }
    };

    const toggleVoiceNotifications = async (enabled: boolean) => {
        try {
            const { setVoiceNotifications: saveVoice } = await import('@/utils/storage');
            await saveVoice(enabled);
            setVoiceNotificationsState(enabled);
        } catch (error) {
            console.error('Failed to toggle voice notifications', error);
        }
    };

    const getTodayDoseCount = (medicationId: string): number => {
        return todayDoses.filter(dose =>
            dose.medicationId === medicationId && dose.taken === 1
        ).length;
    };

    const getCompletedDosesCount = (): number => {
        // Only count doses for ACTIVE medications that still exist
        const activeMedicationIds = new Set(medications.filter(med => med.isActive).map(med => med.id));
        return todayDoses.filter(dose =>
            dose.taken === 1 && activeMedicationIds.has(dose.medicationId)
        ).length;
    };

    const takeMedication = async (id: string, time: string) => {
        try {
            const med = medications.find(m => m.id === id);
            if (!med) return { success: false, error: 'Medication not found' };

            // 1. Guard Validation – Frequency
            const frequencyMap: Record<string, number> = {
                'once': 1,
                'twice': 2,
                'three': 3,
                'four': 4,
                'custom': med.times.length
            };
            const dailyLimit = frequencyMap[med.frequency] || med.times.length;
            const takenToday = getTodayDoseCount(id);

            if (takenToday >= dailyLimit) {
                return { success: false, error: `Daily limit reached (${dailyLimit} doses)` };
            }

            // 2. Guard Validation – Stock
            if (med.currentSupply <= 0) {
                return { success: false, error: 'Out of stock' };
            }

            // 3. State Mutation – Taken & Stock (Atomic Update)
            const now = new Date().toISOString();
            await recordDose(id, true, now);

            setMedications(prev => prev.map(m => {
                if (m.id === id) {
                    const newSupply = Math.max(0, m.currentSupply - 1);

                    // 4. Refill Reminder – Event Based Trigger
                    if (globalNotifications && globalRefillReminders && m.refillReminder && newSupply === m.refillAt) {
                        setRefillNotifications(prevNotifs => {
                            if (!prevNotifs.some(n => n.medicationId === id)) {
                                return [...prevNotifs, {
                                    medicationId: id,
                                    medicationName: m.name,
                                    currentSupply: newSupply
                                }];
                            }
                            return prevNotifs;
                        });

                        // Send Push Notification
                        import('@/utils/notification').then(({ scheduleRefillReminder }) => {
                            scheduleRefillReminder({ ...m, currentSupply: newSupply });
                        });
                    }

                    return { ...m, currentSupply: newSupply };
                }
                return m;
            }));

            // Refresh data from storage to ensure persistence consistency
            await refreshMedications();

            return { success: true };
        } catch (error) {
            console.error('Failed to record dose', error);
            return { success: false, error: 'Failed to record dose' };
        }
    };

    const refillMedication = async (id: string, newSupply: number) => {
        try {
            const med = medications.find(m => m.id === id);
            if (!med) return;

            const updatedMed = {
                ...med,
                currentSupply: newSupply,
                refillReminder: true // Reset refill reminder state (enabled kembali)
            };

            await updateMedication(updatedMed);

            // Update local state
            setMedications(prev => prev.map(m => m.id === id ? updatedMed : m));

            // Remove from notifications
            setRefillNotifications(prev => prev.filter(n => n.medicationId !== id));

            await refreshMedications();
        } catch (error) {
            console.error('Failed to refill medication', error);
        }
    };

    const handleRefillLater = async (id: string) => {
        try {
            const med = medications.find(m => m.id === id);
            if (!med) return;

            // Set refillReminder = false (intentional user decision)
            const updatedMed = { ...med, refillReminder: false };
            await updateMedication(updatedMed);

            // Update local state
            setMedications(prev => prev.map(m => m.id === id ? updatedMed : m));

            // Dismiss notification card
            setRefillNotifications(prev => prev.filter(n => n.medicationId !== id));
        } catch (error) {
            console.error('Failed to handle refill later', error);
        }
    };

    const clearAllData = async () => {
        try {
            const { clearAllData: clearStorage } = await import('@/utils/storage');
            await clearStorage();
            await refreshMedications();
        } catch (error) {
            console.error('Failed to clear data', error);
        }
    };

    const getNotifications = useCallback(() => {
        if (!globalNotifications) return [];

        const now = new Date();
        const { toLocalISOString } = require('@/utils/ttype');
        const today = toLocalISOString(now);
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeMinutes = currentHour * 60 + currentMin;

        const notifications: { medication: Medication, time: string }[] = [];

        medications.forEach(med => {
            // Check if active today
            if (med.startDate <= today && (!med.endDate || med.endDate >= today)) {
                const recordedDoses = todayDoses.filter(d => d.medicationId === med.id);
                const recordedCount = recordedDoses.length;

                // For each scheduled dose time (meal time)
                for (let i = recordedCount; i < med.times.length; i++) {
                    const mealTimeStr = med.times[i];
                    const [h, m] = mealTimeStr.split(':').map(Number);
                    const mealTimeMinutes = h * 60 + m;

                    // Calculate tolerance window relative to meal time
                    let minOffset = 0;
                    let maxOffset = 0;

                    if (med.withFood === 'before') {
                        minOffset = -40;
                        maxOffset = -5;
                    } else if (med.withFood === 'with') {
                        minOffset = -5;
                        maxOffset = 15;
                    } else if (med.withFood === 'after') {
                        minOffset = 15;
                        maxOffset = 60;
                    }

                    const windowStart = mealTimeMinutes + minOffset;
                    const windowEnd = mealTimeMinutes + maxOffset;

                    // If current time is within the tolerance window or past it (overdue), it's "due"
                    // We removed the upper bound (windowEnd) so notifications stick until taken/skipped
                    if (currentTimeMinutes >= windowStart) {
                        notifications.push({
                            medication: med,
                            time: mealTimeStr
                        });
                        break;
                    }
                }
            }
        });

        return notifications;
    }, [medications, todayDoses, globalNotifications]);

    const pendingCount = getNotifications().length;

    return (
        <MedicineContext.Provider value={{
            medications,
            todayDoses,
            loading,
            refreshMedications,
            takeMedication,
            refillMedication,
            handleRefillLater,
            getTodayDoseCount,
            getCompletedDosesCount,
            clearAllData,
            getNotifications,
            refillNotifications,
            pendingCount,
            globalNotifications,
            setGlobalNotifications: toggleGlobalNotifications,
            globalRefillReminders,
            setGlobalRefillReminders: async (enabled: boolean) => {
                try {
                    const { setGlobalRefillReminders: saveRefill } = await import('@/utils/storage');
                    await saveRefill(enabled);
                    setGlobalRefillRemindersState(enabled);
                    await refreshMedications(); // Refresh to update notification list immediately
                } catch (error) {
                    console.error('Failed to toggle refill reminders', error);
                }
            },
            voiceNotifications,
            setVoiceNotifications: toggleVoiceNotifications
        }}>
            {children}
        </MedicineContext.Provider>
    );
}

export function useMedication() {
    const context = useContext(MedicineContext);
    if (context === undefined) {
        throw new Error('useMedication must be used within a MedicineProvider');
    }
    return context;
}



