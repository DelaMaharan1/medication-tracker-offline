import { DoseHistory, Medication } from '@/utils/ttype';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

/**
 * Internal Storage Service to handle raw AsyncStorage operations
 * Provides centralized error handling and logging.
 */
const StorageService = {
    getKey(baseKey: string): string {
        return currentUserId ? `${baseKey}_${currentUserId}` : baseKey;
    },

    async getItem<T>(baseKey: string, defaultValue: T): Promise<T> {
        try {
            const key = this.getKey(baseKey);
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`[StorageService] Error fetching ${baseKey}:`, error);
            return defaultValue;
        }
    },

    async setItem<T>(baseKey: string, value: T): Promise<void> {
        try {
            const key = this.getKey(baseKey);
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`[StorageService] Error saving ${baseKey}:`, error);
            throw error;
        }
    },

    async multiRemove(baseKeys: string[]): Promise<void> {
        try {
            const fullKeys = baseKeys.map(k => this.getKey(k));
            await AsyncStorage.multiRemove(fullKeys);
        } catch (error) {
            console.error(`[StorageService] Error removing keys ${baseKeys}:`, error);
            throw error;
        }
    }
};

// --- Exported Functions (Maintained for Compatibility) ---

export async function getMedication(): Promise<Medication[]> {
    return StorageService.getItem<Medication[]>(MEDICATION_KEY, []);
}

export async function addMedication(medication: Medication): Promise<void> {
    const medications = await getMedication();
    medications.push(medication);
    await StorageService.setItem(MEDICATION_KEY, medications);
}

export async function updateMedication(updatedMedication: Medication): Promise<void> {
    const medications = await getMedication();
    const index = medications.findIndex((med) => med.id === updatedMedication.id);
    if (index !== -1) {
        medications[index] = updatedMedication;
        await StorageService.setItem(MEDICATION_KEY, medications);
    }
}

export async function deletedMedication(id: string): Promise<void> {
    const medications = await getMedication();
    const filtered = medications.filter((med) => med.id !== id);
    await StorageService.setItem(MEDICATION_KEY, filtered);
    await clearOneData(id);
}

export async function getDoseHistory(): Promise<DoseHistory[]> {
    return StorageService.getItem<DoseHistory[]>(DOSE_HISTORY_KEY, []);
}

export async function getTodayDoses(): Promise<DoseHistory[]> {
    const { toLocalISOString } = require('@/utils/ttype');
    const history = await getDoseHistory();
    const today = toLocalISOString(new Date());
    return history.filter(dose => dose.timeStamp.split('T')[0] === today);
}

export async function recordDose(medicationId: string, taken: boolean, timeStamp: string): Promise<void> {
    const history = await getDoseHistory();
    const newDose: DoseHistory = {
        id: `${medicationId}-${timeStamp}`,
        medicationId,
        timeStamp,
        taken: taken ? 1 : 0,
    };

    history.push(newDose);
    await StorageService.setItem(DOSE_HISTORY_KEY, history);

    if (taken) {
        const medications = await getMedication();
        const medication = medications.find((med) => med.id === medicationId);
        if (medication && medication.currentSupply > 0) {
            medication.currentSupply = Math.max(0, medication.currentSupply - 1);
            await updateMedication(medication);
        }
    }
}

export async function clearOneData(medicationId: string) {
    const history = await getDoseHistory();
    const filtered = history.filter(dose => dose.medicationId !== medicationId);
    await StorageService.setItem(DOSE_HISTORY_KEY, filtered);
}

export async function clearAllData() {
    await StorageService.multiRemove([
        DOSE_HISTORY_KEY,
        MEDICATION_KEY,
        GLOBAL_NOTIFICATIONS_KEY,
        VOICE_NOTIFICATIONS_KEY
    ]);
}

export async function getGlobalNotifications(): Promise<boolean> {
    return StorageService.getItem<boolean>(GLOBAL_NOTIFICATIONS_KEY, true);
}

export async function setGlobalNotifications(enabled: boolean): Promise<void> {
    await StorageService.setItem(GLOBAL_NOTIFICATIONS_KEY, enabled);
}

export async function getVoiceNotifications(): Promise<boolean> {
    return StorageService.getItem<boolean>(VOICE_NOTIFICATIONS_KEY, true);
}

export const THEME_MODE_KEY = '@theme_mode';

// ... (existing keys)

// ... (existing functions)

export async function setVoiceNotifications(enabled: boolean): Promise<void> {
    await StorageService.setItem(VOICE_NOTIFICATIONS_KEY, enabled);
}

export async function getThemeMode(): Promise<'light' | 'dark' | 'system'> {
    return StorageService.getItem<'light' | 'dark' | 'system'>(THEME_MODE_KEY, 'system');
}

export async function setThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    await StorageService.setItem(THEME_MODE_KEY, mode);
}

export const GLOBAL_REFILL_REMINDERS_KEY = '@global_refill_reminders';
export async function getGlobalRefillReminders(): Promise<boolean> {
    return StorageService.getItem<boolean>(GLOBAL_REFILL_REMINDERS_KEY, true);
}

export async function setGlobalRefillReminders(enabled: boolean): Promise<void> {
    await StorageService.setItem(GLOBAL_REFILL_REMINDERS_KEY, enabled);
}
