import { colorsTheme } from '@/constants/theme'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export function MedicineEmptySection() {
    const router = useRouter();

    return (
        <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
                <Ionicons name="medical-outline" size={40} color={colorsTheme.primary} />
            </View>

            <Text style={styles.emptyStateText}>You're all set for now!</Text>
            <Text style={styles.emptyStateSubtext}>No medications scheduled for this moment.</Text>

            <TouchableOpacity style={styles.addMedicationButton}
                onPress={() => router.push('/medication/add')}
            >
                <Ionicons name="add" size={20} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.addMedicationButtonText}>Add Medication</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        paddingHorizontal: 24,
        backgroundColor: "white",
        borderRadius: 24,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colorsTheme.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateText: {
        fontSize: 18,
        color: "#1a1a1a",
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#8E8E93",
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
    },
    addMedicationButton: {
        backgroundColor: colorsTheme.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colorsTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addMedicationButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 15,
    },
});