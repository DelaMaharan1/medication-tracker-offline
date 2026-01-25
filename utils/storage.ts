import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoseHistory, Medication } from './ttype';

export const MEDICATION_KEY = '@medication';
export const DOSE_HISTORY_KEY = '@dose_history';
export const GLOBAL_NOTIFICATIONS_KEY = '@global_notifications';
export const VOICE_NOTIFICATIONS_KEY = '@voice_notifications';

// --- User Context for Storage ---
let currentUserId: string | null = null;

export function setStorageUserId(uid: string | null) {
    currentUserId = uid;
    console.log(`[Storage] Switched context to User: ${uid || 'Guest'}`);
}

function getKey(baseKey: string): string {
    if (currentUserId) {
        return `${baseKey}_${currentUserId}`;
    }
    return baseKey; // Fallback to legacy key (Guest mode or migration pending)
}

// --- Medication Storage Functions ---

export async function getMedication(): Promise<Medication[]> {
    try {
        const key = getKey(MEDICATION_KEY);
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.log('Error fetching medication:', error);
        return [];
    }
}

export async function addMedication(medication: Medication): Promise<void> {
    try {
        const medications = await getMedication();
        medications.push(medication);
        const key = getKey(MEDICATION_KEY);
        await AsyncStorage.setItem(key, JSON.stringify(medications));
    } catch (error) {
        console.log('Error adding medication:', error);
        throw error;
    }
}

export async function updateMedication(updatedMedication: Medication): Promise<void> {
    try {
        const medications = await getMedication();
        const index = medications.findIndex((medication) => medication.id === updatedMedication.id);
        if (index !== -1) {
            medications[index] = updatedMedication;
            const key = getKey(MEDICATION_KEY);
            await AsyncStorage.setItem(key, JSON.stringify(medications));
        }
    } catch (error) {
        console.log('Error updating medication:', error);
        throw error;
    }
}

export async function deletedMedication(id: string): Promise<void> {
    try {
        const medications = await getMedication();
        const updatedMedications = medications.filter((medication) => medication.id !== id);
        const key = getKey(MEDICATION_KEY);
        await AsyncStorage.setItem(key, JSON.stringify(updatedMedications));

        // Also delete dose history for this medication
        await clearOneData(id);
    } catch (error) {
        console.log('Error deleting medication:', error);
        throw error;
    }
}

// --- Dose History Storage Functions ---

export async function getDoseHistory(): Promise<DoseHistory[]> {
    try {
        const key = getKey(DOSE_HISTORY_KEY);
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.log('Error getting dose history:', error);
        throw error;
    }
}

export async function getTodayDoses(): Promise<DoseHistory[]> {
    try {
        const doseHistory = await getDoseHistory();
        const today = new Date().toDateString();

        return doseHistory.filter(
            (dose) => new Date(dose.timeStamp).toDateString() === today
        );
    } catch (error) {
        console.log('Error getting today doses:', error);
        throw error;
    }
}

export async function recordDose(
    medicationId: string,
    taken: boolean,
    timeStamp: string
): Promise<void> {
    try {
        const history = await getDoseHistory();
        const newDose: DoseHistory = {
            id: `${medicationId}-${timeStamp}`,
            medicationId,
            timeStamp,
            taken: taken ? 1 : 0,
        };

        history.push(newDose);
        const key = getKey(DOSE_HISTORY_KEY);
        await AsyncStorage.setItem(key, JSON.stringify(history));

        if (taken) {
            const medications = await getMedication();
            const medication = medications.find((med) => med.id === medicationId);

            if (medication && medication.currentSupply > 0) {
                medication.currentSupply = Math.max(0, medication.currentSupply - 1);
                await updateMedication(medication);
            }
        }
    } catch (error) {
        console.log('Error recording dose:', error);
        throw error;
    }
}

export async function clearOneData(medicationId: string) {
    try {
        const history = await getDoseHistory();
        const filteredHistory = history.filter(
            (dose) => dose.medicationId !== medicationId
        );
        const key = getKey(DOSE_HISTORY_KEY);
        await AsyncStorage.setItem(key, JSON.stringify(filteredHistory));
    } catch (error) {
        console.log('Error clearing one data:', error);
        throw error;
    }
}

export async function clearAllData() {
    try {
        const medKey = getKey(MEDICATION_KEY);
        const histKey = getKey(DOSE_HISTORY_KEY);
        // Note: global notifications key usually is per device settings, but if users share device, maybe it should be scoped too?
        // User said: "disable reminder logic globally". Usually per-user pref.
        // Let's scope it too.
        // But GLOBAL_NOTIFICATIONS_KEY needs to also be scoped.
        const notifKey = getKey(GLOBAL_NOTIFICATIONS_KEY);

        await AsyncStorage.multiRemove([histKey, medKey, notifKey]);
    } catch (error) {
        console.log('Error clearing all data:', error);
        throw error;
    }
}
// --- Global Settings Functions ---

export async function getGlobalNotifications(): Promise<boolean> {
    try {
        const key = getKey(GLOBAL_NOTIFICATIONS_KEY);
        const value = await AsyncStorage.getItem(key);
        return value === null ? true : value === 'true'; // Default to true
    } catch (error) {
        console.log('Error getting global notifications:', error);
        return true;
    }
}

export async function setGlobalNotifications(enabled: boolean): Promise<void> {
    try {
        const key = getKey(GLOBAL_NOTIFICATIONS_KEY);
        await AsyncStorage.setItem(key, String(enabled));
    } catch (error) {
        console.log('Error setting global notifications:', error);
        throw error;
    }
}

export async function getVoiceNotifications(): Promise<boolean> {
    try {
        const key = getKey(VOICE_NOTIFICATIONS_KEY);
        const value = await AsyncStorage.getItem(key);
        return value === null ? true : value === 'true'; // Default to true
    } catch (error) {
        console.log('Error getting voice notifications:', error);
        return true;
    }
}

export async function setVoiceNotifications(enabled: boolean): Promise<void> {
    try {
        const key = getKey(VOICE_NOTIFICATIONS_KEY);
        await AsyncStorage.setItem(key, String(enabled));
    } catch (error) {
        console.log('Error setting voice notifications:', error);
        throw error;
    }
}
