import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { DOSE_HISTORY_KEY, getDoseHistory, getMedication, MEDICATION_KEY, setStorageUserId } from './storage';

export interface BackupData {
    medications: any[];
    doseHistory: any[];
    lastUpdated: any;
    deviceInfo?: string;
}

/**
 * Backup local data to Firestore for the current user
 */
export async function backupUserData(userId: string): Promise<boolean> {
    try {
        if (!userId) return false;

        // Ensure storage context is set
        setStorageUserId(userId);

        const medications = await getMedication();
        const doseHistory = await getDoseHistory();

        const backupPayload: BackupData = {
            medications,
            doseHistory,
            lastUpdated: Timestamp.now(),
            deviceInfo: 'React Native App'
        };

        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, backupPayload, { merge: true });

        console.log(`[Backup] Data backed up successfully for user: ${userId}`);
        return true;
    } catch (error) {
        console.error('[Backup] Failed to backup data:', error);
        return false;
    }
}

/**
 * Restore data from Firestore to local storage
 * WARNING: This overwrites local data
 */
export async function restoreUserData(userId: string): Promise<boolean> {
    try {
        if (!userId) return false;

        // Ensure storage context is set
        setStorageUserId(userId);

        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as BackupData;

            // Validate data structure lightly
            if (!Array.isArray(data.medications) || !Array.isArray(data.doseHistory)) {
                console.error('[Restore] Invalid data format from cloud');
                return false;
            }

            // We need to manually overwrite AsyncStorage because storage.ts doesn't expose a "setAll" function easily
            // But we can iterate. 
            // Better: Re-use the keys logic by mocking or exporting keys logic. 
            // Since we can't easily access the private "getKey" logic perfectly without hacking,
            // let's rely on standard keys + userId suffix which seems to be the pattern in storage.ts: `${baseKey}_${currentUserId}`

            const medKey = `${MEDICATION_KEY}_${userId}`;
            const historyKey = `${DOSE_HISTORY_KEY}_${userId}`;

            await AsyncStorage.setItem(medKey, JSON.stringify(data.medications));
            await AsyncStorage.setItem(historyKey, JSON.stringify(data.doseHistory));

            console.log(`[Restore] Data restored successfully for user: ${userId}`);
            return true;
        } else {
            console.log('[Restore] No backup found for user');
            return false;
        }
    } catch (error) {
        console.error('[Restore] Failed to restore data:', error);
        return false;
    }
}

/**
 * Delete user backup data from Firestore
 */
export async function deleteBackupData(userId: string): Promise<boolean> {
    try {
        if (!userId) return false;

        const { deleteDoc } = await import('firebase/firestore');
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);

        console.log(`[Backup] Cloud data deleted for user: ${userId}`);
        return true;
    } catch (error) {
        console.error('[Backup] Failed to delete cloud data:', error);
        return false;
    }
}
