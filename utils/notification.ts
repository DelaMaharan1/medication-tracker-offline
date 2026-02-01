import { Medication } from '@/utils/ttype';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

    try {
        const schedulingPromises = medication.times.flatMap(timeStr => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return [];

            // Base meal time
            const baseTime = new Date();
            baseTime.setHours(hours, minutes, 0, 0);

            // Calculate notification offsets based on meal relation
            const offsets = [];
            if (medication.withFood === 'before') {
                offsets.push(-30); // Main reminder
                offsets.push(-5);  // Final reminder
            } else if (medication.withFood === 'with') {
                offsets.push(0);
            } else if (medication.withFood === 'after') {
                offsets.push(30);
            }

            return offsets.map(async (offset) => {
                const triggerTime = new Date(baseTime.getTime() + offset * 60000);
                const h = triggerTime.getHours();
                const m = triggerTime.getMinutes();

                const identifier = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: medication.withFood === 'before' && offset === -5 ? 'Final Reminder' : 'Medication Reminder',
                        body: `Time to take ${medication.dosage} ${medication.dosageUnit} of ${medication.name} (${medication.withFood} meal)`,
                        data: {
                            medicationId: medication.id,
                            medicationName: medication.name,
                            type: 'medication',
                            doseTime: timeStr, // Track against the base meal time
                            offset: offset
                        },
                        sound: true,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DAILY,
                        hour: h,
                        minute: m,
                    },
                });
                return identifier;
            });
        });

        // Resolve all scheduling promises in parallel
        const notificationIds = await Promise.all(schedulingPromises);
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

        // Process all medications in parallel
        await Promise.all(medications.map(async (medication) => {
            if (medication.isActive && medication.reminderEnabled) {
                await scheduleMedicationReminder(medication, durations);
            }
        }));
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



