import { colorsTheme } from '@/constants/theme';
import { FormErrors, Medication } from '@/utils/ttype';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

interface Props {
    form: Medication;
    updateForm: (update: Partial<Medication>) => void;
    isAddMode: boolean;
    errors: FormErrors;
}

export default function RefillReminderSection({ form, updateForm, isAddMode, errors }: Props) {
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Refill & Reminder</Text>

            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Refill Reminder</Text>
                <Switch
                    value={form.refillReminder}
                    onValueChange={(value) => updateForm({ refillReminder: value })}
                    trackColor={{ false: '#767577', true: colorsTheme.primary }}
                />
            </View>

            {form.refillReminder && (
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Current Supply</Text>
                        <TextInput
                            style={[styles.input, errors.currentSupply && styles.inputError]}
                            placeholder="0"
                            keyboardType="numeric"
                            value={form.currentSupply?.toString()}
                            onChangeText={(text) => updateForm({ currentSupply: parseInt(text) || 0 })}
                        />
                        {errors.currentSupply && <Text style={styles.errorText}>{errors.currentSupply}</Text>}
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Refill At</Text>
                        <TextInput
                            style={[styles.input, errors.refillAt && styles.inputError]}
                            placeholder="0"
                            keyboardType="numeric"
                            value={form.refillAt?.toString()}
                            onChangeText={(text) => updateForm({ refillAt: parseInt(text) || 0 })}
                        />
                        {errors.refillAt && <Text style={styles.errorText}>{errors.refillAt}</Text>}
                    </View>
                </View>
            )}

            {/* Show Reminders Enabled ONLY in Edit Mode (as per user request: "Bagian di edit, nanti baru ditambahkan, 'reminders enabled'") */}
            {!isAddMode && (
                <View style={[styles.switchRow, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20 }]}>
                    <View style={styles.switchLabelContainer}>
                        <Text style={styles.switchLabel}>Reminders Enabled</Text>
                        <Text style={styles.switchSubLabel}>Receive notifications for doses</Text>
                    </View>
                    <Switch
                        value={form.reminderEnabled}
                        onValueChange={(value) => updateForm({ reminderEnabled: value })}
                        trackColor={{ false: '#767577', true: colorsTheme.primary }}
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
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
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginTop: 4,
    },
});
