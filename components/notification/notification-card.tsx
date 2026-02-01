import { colorsTheme } from '@/constants/theme';
import { Medication } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationCardProps {
    medication: Medication;
    time: string;
    onTake: () => void;
    onSkip: () => void;
}

export default function NotificationCard({ medication, time, onTake, onSkip }: NotificationCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: medication.color + '15' || colorsTheme.primary + '15' }]}>
                    <Ionicons
                        name="medical"
                        size={22}
                        color={medication.color || colorsTheme.primary}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{medication.name}</Text>
                    <Text style={styles.details}>{medication.dosage} • {time}</Text>
                </View>
                <View style={styles.timeTag}>
                    <Text style={styles.timeTagText}>Due Now</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.skipButton]}
                    onPress={onSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.takeButton]}
                    onPress={onTake}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[colorsTheme.primary, colorsTheme.secondary]}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.takeButtonText}>Take</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Fixed import for LinearGradient since it's from expo-linear-gradient
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    details: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    timeTag: {
        backgroundColor: '#FF3B3015',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    timeTagText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FF3B30',
        textTransform: 'uppercase',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    skipButton: {
        backgroundColor: '#F2F2F7',
    },
    skipButtonText: {
        color: '#8E8E93',
        fontWeight: '700',
        fontSize: 15,
    },
    takeButton: {
        // LinearGradient handles the background
    },
    gradient: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    takeButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});


