import { getTodayDoses, recordDose, updateMedication } from '@/utils/storage';
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
    voiceNotifications: boolean;
    setVoiceNotifications: (enabled: boolean) => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

export function MedicineProvider({ children }: { children: React.ReactNode }) {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [todayDoses, setTodayDoses] = useState<DoseHistory[]>([]);
    const [refillNotifications, setRefillNotifications] = useState<RefillNotification[]>([]);
    const [globalNotifications, setGlobalNotificationsState] = useState(true);
    const [voiceNotifications, setVoiceNotificationsState] = useState(true);
    const [loading, setLoading] = useState(true);
    const appState = useRef(AppState.currentState);

    const refreshMedications = useCallback(async () => {
        try {
            const { getGlobalNotifications, getVoiceNotifications, getMedication, getTodayDoses } = await import('@/utils/storage');

            const [medData, doseData, globalEnabled, voiceEnabled] = await Promise.all([
                getMedication(),
                getTodayDoses(),
                getGlobalNotifications(),
                getVoiceNotifications()
            ]);

            setMedications(medData);
            setTodayDoses(doseData);
            setGlobalNotificationsState(globalEnabled);
            setVoiceNotificationsState(voiceEnabled);

            const lowStockMeds = medData.filter(med =>
                med.refillReminder &&
                med.currentSupply <= med.refillAt
            ).map(med => ({
                medicationId: med.id,
                medicationName: med.name,
                currentSupply: med.currentSupply
            }));
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
    useEffect(() => {
        const sync = async () => {
            try {
                const { syncAllMedicationReminders } = await import('@/utils/notification');
                const { DURATION_OPTIONS } = await import('@/constants/medicine/duration');
                await syncAllMedicationReminders(medications, globalNotifications, DURATION_OPTIONS);
            } catch (error) {
                console.error("Sync Engine Error:", error);
            }
        };

        if (!loading) {
            sync();
        }
    }, [medications, globalNotifications, loading]);

    const toggleGlobalNotifications = async (enabled: boolean) => {
        try {
            const { setGlobalNotifications: saveGlobal, getMedication } = await import('@/utils/storage');
            const { syncAllMedicationReminders } = await import('@/utils/notification');
            const { DURATION_OPTIONS } = await import('@/constants/medicine/duration');

            await saveGlobal(enabled);
            setGlobalNotificationsState(enabled);

            const meds = await getMedication();
            await syncAllMedicationReminders(meds, enabled, DURATION_OPTIONS);
        } catch (error) {
            console.error('Failed to toggle notifications', error);
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
        // Only count doses for medications that still exist
        const existingMedicationIds = new Set(medications.map(med => med.id));
        return todayDoses.filter(dose =>
            dose.taken === 1 && existingMedicationIds.has(dose.medicationId)
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

            // Note: recordDose already updates storage, but we should update local state atomically
            // to ensure UI consistency before re-fetching
            setMedications(prev => prev.map(m => {
                if (m.id === id) {
                    const newSupply = Math.max(0, m.currentSupply - 1);

                    // 4. Refill Reminder – Event Based Trigger
                    if (m.refillReminder && newSupply === m.refillAt) {
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

            // Refresh doses from storage to sync
            const doses = await getTodayDoses();
            setTodayDoses(doses);

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
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeMinutes = currentHour * 60 + currentMin;

        const notifications: { medication: Medication, time: string }[] = [];

        medications.forEach(med => {
            // Check if active today
            if (med.startDate <= today && (!med.endDate || med.endDate >= today)) {
                const recordedDoses = todayDoses.filter(d => d.medicationId === med.id);
                const recordedCount = recordedDoses.length;

                // Only consider untaken doses
                for (let i = recordedCount; i < med.times.length; i++) {
                    const timeStr = med.times[i];
                    const [h, m] = timeStr.split(':').map(Number);
                    const scheduledMinutes = h * 60 + m;

                    // STRICT RULE: Only include in "active notifications" if it is the EXACT scheduled time
                    // This drives the Modal and the Badge Count for current reminders
                    if (currentTimeMinutes === scheduledMinutes) {
                        notifications.push({
                            medication: med,
                            time: timeStr
                        });
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
