import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { FormErrors, MedicationFormData } from '@/utils/ttype';
import { StyleSheet, Switch, Text, View } from 'react-native';
import DatePicker from './schedule-form/date-picker';
import Duration from './schedule-form/duration';
import { FrequencyOptions } from './schedule-form/frequency-section';
import TimePicker from './schedule-form/time-picker';

interface Props {
    form: MedicationFormData;
    updateForm: (update: Partial<MedicationFormData>) => void;
    errors: FormErrors;
    isAddMode: boolean; // Added prop
}

export default function ScheduleSection({ form, updateForm, errors, isAddMode }: Props) {
    const { theme, isDark } = useTheme();

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequency & Schedule</Text>

            <Text style={[styles.label, { color: theme.text }]}>Frequency</Text>
            <FrequencyOptions
                selectedFrequency={form.frequency}
                onSelect={(freqId, newTimes) => updateForm({ frequency: freqId as any, times: newTimes })}
                frequencies={undefined as any}
                error={errors.frequency}
            />

            <View style={{ height: 20 }} />

            <TimePicker
                medicationForm={form}
                updateForm={updateForm as any}
                errors={errors}
            />

            <Duration
                medicationForm={form}
                updateForm={updateForm as any}
                errors={errors}
            />

            <DatePicker
                medicationForm={form}
                updateForm={updateForm as any}
                errors={errors}
            />

            {/* Hide Medicine Always On in Add Mode */}
            {!isAddMode && (
                <View style={[styles.switchRow, { borderTopWidth: isDark ? 1 : 0, borderTopColor: '#333', paddingTop: isDark ? 10 : 0 }]}>
                    <View style={styles.switchLabelContainer}>
                        <Text style={[styles.switchLabel, { color: theme.text }]}>Medicine Always On</Text>
                        <Text style={[styles.switchSubLabel, { color: isDark ? theme.icon : '#888' }]}>Keep this medication active indefinitely</Text>
                    </View>
                    <Switch
                        value={form.medicineAlwaysOn}
                        onValueChange={(value) => {
                            updateForm({
                                medicineAlwaysOn: value,
                                duration: value ? 'ongoing' : form.duration,
                                endDate: value ? undefined : form.endDate
                            });
                        }}
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
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginTop: 4,
        marginLeft: 4,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10, // Added margin top for spacing if DatePicker is above
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
});



