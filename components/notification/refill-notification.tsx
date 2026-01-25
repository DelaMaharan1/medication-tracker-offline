import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RefillNotificationCardProps {
    medicationName: string;
    currentSupply: number;
    onRefill: () => void;
    onLater: () => void;
}

export default function RefillNotificationCard({
    medicationName,
    currentSupply,
    onRefill,
    onLater
}: RefillNotificationCardProps) {
    const colors = {
        primary: '#EA7B7B',
        secondary: '#FFC7A7',
    };

    return (
        <View style={[styles.card, { borderColor: colors.primary }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="alert-circle" size={24} color={colors.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.primary }]}>Refill Needed</Text>
                    <Text style={styles.message}>
                        <Text style={styles.medName}>{medicationName}</Text> is running low.
                        Remaining: <Text style={[styles.stockCount, { color: colors.primary }]}>{currentSupply}</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.laterButton, { borderColor: `${colors.primary}40` }]}
                    onPress={onLater}
                >
                    <Text style={[styles.laterText, { color: colors.primary }]}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.refillButton, { backgroundColor: colors.primary }]}
                    onPress={onRefill}
                >
                    <Text style={styles.refillText}>Refill Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF9F2',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#EA7B7B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    message: {
        fontSize: 15,
        color: '#48484A',
        lineHeight: 20,
    },
    medName: {
        fontWeight: '700',
        color: '#1C1C1E',
    },
    stockCount: {
        fontWeight: '800',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    laterButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    laterText: {
        fontWeight: '700',
        fontSize: 14,
    },
    refillButton: {},
    refillText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});