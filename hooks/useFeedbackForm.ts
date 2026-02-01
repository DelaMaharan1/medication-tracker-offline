import { useState } from 'react';
import { Alert, Platform } from 'react-native';

export type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'QUESTION';

export function useFeedbackForm(currentUser: any, onClose: () => void) {
    const [category, setCategory] = useState<FeedbackCategory>('BUG');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSendFeedback = () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        const deviceMetadata = `
-----------------------------
Technical Info (Internal Use):
Device: ${Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'} (${Platform.Version})
App Version: 1.0.0
User ID: ${currentUser?.uid || 'Guest'}
Type: ${category}
-----------------------------`;

        const fullBody = `${message}\n\n${deviceMetadata}`;
        const mailtoUrl = `mailto:delamaharan@gmail.com?subject=[${category}] ${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;

        import('react-native').then(({ Linking }) => {
            Linking.openURL(mailtoUrl).catch(() => {
                Alert.alert("Error", "Could not open email app. Please make sure an email app is installed.");
            });
        });

        // Reset and close
        setSubject('');
        setMessage('');
        setCategory('BUG');
        onClose();
    };

    return {
        category,
        setCategory,
        subject,
        setSubject,
        message,
        setMessage,
        handleSendFeedback
    };
}



