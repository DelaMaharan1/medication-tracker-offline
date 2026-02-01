import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context'; // Use the context
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface RefillModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => void;
    medicationName: string;
    dosage: string;
    currentSupply: number;
}

export default function RefillModal({
    visible,
    onClose,
    onSubmit,
    medicationName,
    dosage,
    currentSupply
}: RefillModalProps) {
    const [amount, setAmount] = useState(currentSupply.toString());
    const { theme, isDark } = useTheme(); // Get dark mode from context

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#1C1C1E' }]}>Update Stock</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#1C1C1E'} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>Medication</Text>
                            <Text style={[styles.value, { color: isDark ? '#fff' : '#1C1C1E' }]}>{medicationName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>Dosage</Text>
                            <Text style={[styles.value, { color: isDark ? '#fff' : '#1C1C1E' }]}>{dosage}</Text>
                        </View>
                    </View>

                    <Text style={[styles.inputLabel, { color: isDark ? '#fff' : '#1C1C1E' }]}>New Supply Amount</Text>
                    <View style={[styles.inputContainer, {
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                        borderColor: colorsTheme.primary
                    }]}>
                        <TextInput
                            style={[styles.input, { color: isDark ? '#fff' : '#1C1C1E' }]}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
                            autoFocus
                        />
                        <Text style={[styles.unitText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>units</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={() => {
                            const num = parseInt(amount);
                            if (!isNaN(num)) onSubmit(num);
                        }}
                    >
                        <Text style={styles.submitText}>Confirm Refill</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker overlay for better contrast
        justifyContent: 'center',
        padding: 24,
    },
    container: {
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    infoBox: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 54,
        marginBottom: 24,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
    },
    unitText: {
        fontSize: 16,
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: colorsTheme.primary,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colorsTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});