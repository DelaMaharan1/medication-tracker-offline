// todays-section/item-card.tsx
import { colorsTheme } from '@/constants/theme';
import { DoseHistory, Medication } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ItemBadge } from './item-badge';

interface ItemSectionProps {
    medicine: Medication;
    doseHistory: DoseHistory;
    onEdit: () => void;
    onTakeMedication: () => void;
}

export function ItemSection({ medicine, doseHistory, onEdit, onTakeMedication }: ItemSectionProps) {
    // Check if the medication duration has ended
    // endDate is YYYY-MM-DD. If today > endDate, it is ended.
    const isEnded = React.useMemo(() => {
        if (!medicine.endDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return today > medicine.endDate;
    }, [medicine.endDate]);

    const handlePress = () => {
        if (isEnded) {
            Alert.alert(
                "Inactive Medication",
                "This medication schedule has ended. Do you want to edit it to extend the duration?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Edit", onPress: onEdit }
                ]
            );
        } else {
            onEdit();
        }
    };

    return (
        <View style={[styles.cardContainer, isEnded && { opacity: 0.6 }]}>
            <TouchableOpacity
                style={styles.card}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>

                    {/* Left Side: Icon & Info */}
                    <View style={styles.mainInfo}>
                        <View style={[styles.iconContainer, isEnded && { backgroundColor: '#F2F2F7' }]}>
                            <Ionicons
                                name="medkit"
                                size={24}
                                color={isEnded ? '#8E8E93' : colorsTheme.primary}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.medName, isEnded && { color: '#8E8E93' }]} numberOfLines={1}>
                                {medicine.name}
                            </Text>
                            <Text style={styles.dosage}>
                                {medicine.dosage} {medicine.dosageUnit} • {medicine.times?.length}x Daily
                                {isEnded && ' (Ended)'}
                            </Text>
                        </View>
                    </View>

                    {/* Right Side: Action/Status */}
                    {!isEnded && (
                        <TouchableOpacity
                            style={styles.actionContainer}
                            onPress={(e) => {
                                e.stopPropagation();
                                onTakeMedication();
                            }}
                        >
                            <ItemBadge status={doseHistory?.takenStatus || 'take'} />
                        </TouchableOpacity>
                    )}

                    {isEnded && (
                        <View style={styles.actionContainer}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#8E8E93" />
                        </View>
                    )}

                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 12,
        // This container ensures consistent spacing
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        // Remove margin from here
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16, // Consistent padding
    },
    mainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    iconContainer: {
        width: 48, // Slightly larger for better touch area
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFF0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    medName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    dosage: {
        fontSize: 13,
        fontWeight: '500',
        color: '#8E8E93',
        lineHeight: 18,
    },
    actionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    }
});