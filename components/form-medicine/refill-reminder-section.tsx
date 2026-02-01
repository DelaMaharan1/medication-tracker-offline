import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useTheme } from '@/context/theme-context';
import { FormErrors, MedicationFormData } from '@/utils/ttype';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

interface Props {
    form: MedicationFormData;
    updateForm: (update: Partial<MedicationFormData>) => void;
    isAddMode: boolean;
    errors: FormErrors;
}

export default function RefillReminderSection({ form, updateForm, isAddMode, errors }: Props) {
    const { theme, isDark } = useTheme();
    const medicineContext = useMedication();

    // Optimistic UI for switch
    const [localReminderEnabled, setLocalReminderEnabled] = useState(form.reminderEnabled);

    useEffect(() => {
        setLocalReminderEnabled(form.reminderEnabled);
    }, [form.reminderEnabled]);

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Refill & Reminder</Text>
                {/* Global Indicator */}
                {!medicineContext.globalRefillReminders && (
                    <Text style={[styles.warningText, { color: '#FF9500' }]}>
                        ⚠️ Globally Disabled
                    </Text>
                )}
            </View>

            <Text style={[styles.descriptionText, { color: isDark ? theme.icon : '#666', marginBottom: 15 }]}>
                Set your stock levels to get alerted when running low.
            </Text>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={[styles.label, { color: theme.text }]}>
                        Current Supply <Text style={{ color: '#FF3B30' }}>*</Text>
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                                borderColor: isDark ? '#333' : '#e9ecef',
                                color: theme.text
                            },
                            errors.currentSupply && styles.inputError
                        ]}
                        placeholder="0"
                        placeholderTextColor={isDark ? '#444' : '#999'}
                        keyboardType="numeric"
                        value={form.currentSupply?.toString() ?? ''}
                        onChangeText={(text) => {
                            updateForm({
                                currentSupply: text === '' ? undefined : (parseInt(text) || 0),
                                refillReminder: true
                            });
                        }}
                    />
                    {errors.currentSupply && <Text style={styles.errorText}>{errors.currentSupply}</Text>}
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: theme.text }]}>Refill At</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                                borderColor: isDark ? '#333' : '#e9ecef',
                                color: theme.text
                            },
                            errors.refillAt && styles.inputError
                        ]}
                        placeholder="0"
                        placeholderTextColor={isDark ? '#444' : '#999'}
                        keyboardType="numeric"
                        value={form.refillAt?.toString() ?? ''}
                        onChangeText={(text) => updateForm({
                            refillAt: text === '' ? undefined : (parseInt(text) || 0),
                            refillReminder: true
                        })}
                    />
                    {errors.refillAt && <Text style={styles.errorText}>{errors.refillAt}</Text>}
                </View>
            </View>

            {/* Show Reminders Enabled */}
            {!isAddMode && (
                <View style={[
                    styles.switchRow,
                    {
                        marginTop: 20,
                        borderTopWidth: 1,
                        borderTopColor: isDark ? '#333' : '#f0f0f0',
                        paddingTop: 20
                    }
                ]}>
                    <View style={styles.switchLabelContainer}>
                        <Text style={[
                            styles.switchLabel,
                            { color: theme.text },
                            !medicineContext.globalNotifications && { color: isDark ? '#444' : '#8E8E93' }
                        ]}>Dose Notifications</Text>
                        <Text style={[styles.switchSubLabel, { color: isDark ? theme.icon : '#888' }]}>
                            {medicineContext.globalNotifications ? 'Receive notifications for doses' : 'Notifications disabled globally'}
                        </Text>
                    </View>
                    <Switch
                        value={localReminderEnabled}
                        onValueChange={(value) => {
                            setLocalReminderEnabled(value);
                            updateForm({ reminderEnabled: value });
                        }}
                        trackColor={{ false: '#767577', true: colorsTheme.primary }}
                        disabled={!medicineContext.globalNotifications}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    warningText: {
        fontSize: 12,
        fontWeight: '600',
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    switchLabelContainer: {
        flex: 1,
        marginRight: 10,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    switchSubLabel: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        marginBottom: 0,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputError: {
        borderColor: '#FF3B30',
        // backgroundColor removed to keep theme consistent
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginTop: 4,
    },
});
