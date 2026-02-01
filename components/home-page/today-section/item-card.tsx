import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
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
    showInactiveOverlay?: boolean;
}

export function ItemSection({ medicine, doseHistory, onEdit, onTakeMedication, showInactiveOverlay }: ItemSectionProps) {
    const { theme, isDark } = useTheme();

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
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: isDark ? '#333' : '#f0f0f0'
                    }
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                {showInactiveOverlay && <View style={styles.overlay} />}

                <View style={styles.cardContent}>

                    {/* Left Side: Icon & Info */}
                    <View style={styles.mainInfo}>
                        <View style={[
                            styles.iconContainer,
                            { backgroundColor: isDark ? '#2D1A1A' : '#FFF0F0' },
                            isEnded && { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                        ]}>
                            <Ionicons
                                name="medkit"
                                size={24}
                                color={isEnded ? (isDark ? '#636366' : '#8E8E93') : colorsTheme.primary}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text
                                style={[
                                    styles.medName,
                                    { color: theme.text },
                                    isEnded && { color: isDark ? '#636366' : '#8E8E93' }
                                ]}
                                numberOfLines={1}
                            >
                                {medicine.name}
                            </Text>
                            <Text style={[styles.dosage, { color: isDark ? theme.icon : '#8E8E93' }]}>
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
        // This container ensures consistent spacing
        // marginBottom removed to let parent handle spacing
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
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Thin overlay as requested
        zIndex: 10,
        pointerEvents: 'none' // Allow touches to pass through if needed, or remove if blocking is desired
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
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