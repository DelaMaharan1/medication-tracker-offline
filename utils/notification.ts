import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication } from './ttype';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Register push token 
export async function registerForPushNotificationAsync(): Promise<string | null> {
    let token: string | null = null;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    try {
        const response = await Notifications.getExpoPushTokenAsync();
        token = response.data;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }
        return token;
    } catch (error) {
        console.error("Error registering push notification:", error);
        return null;
    }
}

// Helper function untuk menghitung endDate berdasarkan duration
export function calculateEndDate(startDate: Date, duration: string, durations: any[]): Date | undefined {
    if (!duration || duration === "ongoing") return undefined;

    if (duration.startsWith("Until ")) {
        const dateStr = duration.replace("Until ", "");
        return new Date(dateStr);
    }

    const durationItem = durations.find(d => d.label === duration);
    if (!durationItem || !durationItem.value) return undefined;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationItem.value);
    return endDate;
}

export async function scheduleMedicationReminder(
    medication: Medication,
    durations: any[]
): Promise<string[]> {
    if (!medication.reminderEnabled || medication.times.length === 0) {
        return [];
    }

    const notificationIds: string[] = [];

    try {
        for (const timeStr of medication.times) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) continue;

            // Strict daily trigger at the exact user-defined time
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Medication Reminder',
                    body: `Time to take ${medication.dosage} ${medication.dosageUnit} of ${medication.name}`,
                    data: {
                        medicationId: medication.id,
                        medicationName: medication.name,
                        type: 'medication',
                        doseTime: timeStr
                    },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: hours,
                    minute: minutes,
                },
            });

            notificationIds.push(identifier);
        }
        return notificationIds;
    } catch (error) {
        console.error("Error scheduling medication reminder:", error);
        return [];
    }
}

// Refill reminders: Triggered when stock falls below refillAt
export async function scheduleRefillReminder(
    medication: Medication
): Promise<string | undefined> {
    if (!medication.refillReminder || medication.currentSupply > medication.refillAt) {
        return undefined;
    }

    try {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Low Stock Alert',
                body: `You are running low on ${medication.name}. Only ${medication.currentSupply} ${medication.dosageUnit} left.`,
                data: {
                    medicationId: medication.id,
                    type: 'refill',
                    medicationName: medication.name,
                    currentSupply: medication.currentSupply
                },
                sound: true,
            },
            trigger: null, // Send immediately
        });

        return identifier;
    } catch (error) {
        console.error("Error scheduling refill reminder:", error);
        return undefined;
    }
}

// Cancel medication Reminder 
export async function cancelMedicationReminders(
    medicationId: string
): Promise<void> {
    try {
        const scheduleNotifications = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduleNotifications) {
            const data = notification.content.data as { medicationId?: string } | null;
            if (data?.medicationId === medicationId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
    } catch (error) {
        console.error("Error canceling medication reminders:", error);
    }
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error("Error canceling all notifications:", error);
    }
}

// Sync all medication reminders based on global state and medication list
export async function syncAllMedicationReminders(
    medications: Medication[],
    globalEnabled: boolean,
    durations: any[]
): Promise<void> {
    try {
        await cancelAllScheduledNotifications();
        if (!globalEnabled) return;

        for (const medication of medications) {
            if (medication.isActive && medication.reminderEnabled) {
                await scheduleMedicationReminder(medication, durations);
            }
        }
    } catch (error) {
        console.error("Error syncing medication reminders:", error);
    }
}

// Update single medication reminders
export async function updateMedicationReminders(
    medication: Medication,
    durations: any[]
): Promise<void> {
    try {
        await cancelMedicationReminders(medication.id);
        if (medication.reminderEnabled) {
            await scheduleMedicationReminder(medication, durations);
        }
    } catch (error) {
        console.error("Error updating medication reminders:", error);
    }
}