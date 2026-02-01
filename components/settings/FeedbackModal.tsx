import { colorsTheme } from '@/constants/theme';
import { useFeedbackForm } from '@/hooks/useFeedbackForm';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text as PaperText, TextInput } from 'react-native-paper';

interface FeedbackModalProps {
    visible: boolean;
    onClose: () => void;
    theme: any;
    isDark: boolean;
    currentUser: any;
}

type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'QUESTION';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose, theme, isDark, currentUser }) => {
    const {
        category,
        setCategory,
        subject,
        setSubject,
        message,
        setMessage,
        handleSendFeedback
    } = useFeedbackForm(currentUser, onClose);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.feedbackCard, { backgroundColor: theme.card }]}>
                    <View style={styles.modalHeader}>
                        <PaperText style={[styles.modalTitle, { color: theme.text }]}>Send Feedback</PaperText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <PaperText style={[styles.inputLabel, { color: theme.text, marginTop: 0 }]}>Report Category</PaperText>
                    <View style={styles.categoryContainer}>
                        {(['BUG', 'SUGGESTION', 'QUESTION'] as const).map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    category === cat && { backgroundColor: colorsTheme.primary, borderColor: colorsTheme.primary }
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <PaperText style={[
                                    styles.categoryText,
                                    category === cat && { color: '#FFF' }
                                ]}>
                                    {cat}
                                </PaperText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <PaperText style={[styles.inputLabel, { color: theme.text }]}>Subject</PaperText>
                    <TextInput
                        value={subject}
                        onChangeText={setSubject}
                        mode="outlined"
                        placeholder="Brief summary"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                        textColor={theme.text}
                        style={styles.modalInput}
                        outlineStyle={{ borderRadius: 12 }}
                        outlineColor={isDark ? '#333' : '#E5E7EB'}
                        activeOutlineColor={colorsTheme.primary}
                    />

                    <PaperText style={[styles.inputLabel, { color: isDark ? '#FFF' : '#000' }]}>How can we help?</PaperText>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        placeholder="Describe your issue or suggestion..."
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                        textColor={theme.text}
                        style={[styles.modalInput, { height: 120 }]}
                        outlineStyle={{ borderRadius: 12 }}
                        outlineColor={isDark ? '#333' : '#E5E7EB'}
                        activeOutlineColor={colorsTheme.primary}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSendFeedback}
                        style={styles.sendBtn}
                        contentStyle={{ height: 50 }}
                        buttonColor={colorsTheme.primary}
                    >
                        Send via Email
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    feedbackCard: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalInput: {
        marginBottom: 16,
        backgroundColor: 'transparent',
        fontSize: 15,
    },
    sendBtn: {
        marginTop: 8,
        borderRadius: 14,
        elevation: 0,
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    categoryChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
});



