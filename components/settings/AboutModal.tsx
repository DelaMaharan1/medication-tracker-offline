import { colorsTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Text as PaperText } from 'react-native-paper';

interface AboutModalProps {
    visible: boolean;
    onClose: () => void;
    theme: any;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose, theme }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.aboutCard, { backgroundColor: theme.card }]}>
                    <View style={styles.aboutIconContainer}>
                        <Ionicons name="medkit" size={60} color={colorsTheme.primary} />
                    </View>
                    <PaperText style={[styles.aboutTitle, { color: theme.text }]}>MediTrack</PaperText>
                    <PaperText style={styles.aboutVersion}>Version 1.0.0</PaperText>
                    <View style={styles.aboutDivider} />
                    <PaperText style={[styles.aboutDescription, { color: theme.text }]}>
                        A simple and smart medication reminder to help you stay on track with your health.
                    </PaperText>
                    <PaperText style={styles.copyright}>© 2026 @mediTrack. All rights reserved.</PaperText>
                    <Button
                        mode="contained"
                        onPress={onClose}
                        style={styles.closeBtn}
                        buttonColor={colorsTheme.primary}
                    >
                        Close
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
    aboutCard: {
        width: '90%',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
    },
    aboutIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    aboutTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    aboutVersion: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 20,
    },
    aboutDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E5EA',
        marginBottom: 20,
    },
    aboutDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 25,
    },
    copyright: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 30,
    },
    closeBtn: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 4,
    },
});



