import { useMedication } from '@/context/medicine';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';

export default function ModalNotifications() {
    const router = useRouter();
    const { voiceNotifications, medications } = useMedication();
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    const announceMedication = (medName: string) => {
        if (!voiceNotifications) return;

        console.log(`[Voice] Announcing: ${medName}`);
        Speech.stop();
        Speech.speak(`Time to take your ${medName}`, {
            language: 'en',
            pitch: 1.0,
            rate: 1.0,
        });
    };

    useEffect(() => {
        // Handle foreground notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('[Notification] Received in foreground:', notification);
            const data = notification.request.content.data;
            const title = notification.request.content.title;

            if (data?.medicationName) {
                announceMedication(data.medicationName as string);
            } else if (data?.medicationId) {
                const med = medications.find(m => m.id === data.medicationId);
                if (med) announceMedication(med.name);
            } else if (title) {
                const medName = title.includes(':') ? title.split(':').pop()?.trim() || title : title;
                announceMedication(medName);
            }
        });

        // Handle notification clicks
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[Notification] Response received:', response);
            const data = response.notification.request.content.data;

            if (data?.medicationId) {
                router.push('/(tabs)/home');

                // Small delay to ensure speech works after app resume
                setTimeout(() => {
                    if (data?.medicationName) {
                        announceMedication(data.medicationName as string);
                    } else {
                        const med = medications.find(m => m.id === data.medicationId);
                        if (med) announceMedication(med.name);
                    }
                }, 1000);
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [router, voiceNotifications, medications]);

    return null;
}



