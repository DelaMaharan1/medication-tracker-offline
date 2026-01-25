import { colorsTheme } from '@/constants/theme';
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
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Update Stock</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Medication</Text>
                            <Text style={styles.value}>{medicationName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Dosage</Text>
                            <Text style={styles.value}>{dosage}</Text>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>New Supply Amount</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder="0"
                            autoFocus
                        />
                        <Text style={styles.unitText}>units</Text>
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
        backgroundColor: 'rgba(239, 234, 234, 0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: '#fff',
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
        color: '#1C1C1E',
    },
    closeBtn: {
        padding: 4,
    },
    infoBox: {
        backgroundColor: '#F2F2F7',
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
        color: '#8E8E93',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#1C1C1E',
        fontWeight: '700',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colorsTheme.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 54,
        marginBottom: 24,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    unitText: {
        fontSize: 16,
        color: '#8E8E93',
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
