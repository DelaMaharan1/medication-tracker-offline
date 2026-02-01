import { useTheme } from '@/context/theme-context';
import { FormErrors, MedicationFormData } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
    medicationForm: MedicationFormData;
    updateForm: (update: Partial<MedicationFormData>) => void;
    errors: FormErrors;
}

export default function DatePicker({ medicationForm, updateForm, errors }: Props) {
    const { theme, isDark } = useTheme();
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }

        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];

            if (showPicker === 'start') {
                updateForm({ startDate: dateString });
            } else if (showPicker === 'end') {
                updateForm({ endDate: dateString });
            }
        }
    };

    const getDateObject = (dateString?: string) => {
        if (!dateString) return new Date();
        return new Date(dateString);
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
                    <TouchableOpacity
                        style={[
                            styles.dateButton,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                                borderColor: isDark ? '#333' : '#e9ecef'
                            },
                            errors.startDate && styles.btnError
                        ]}
                        onPress={() => setShowPicker('start')}
                    >
                        <Ionicons name="calendar" size={20} color={isDark ? theme.icon : "#666"} />
                        <Text style={[styles.dateText, { color: theme.text }]}>{medicationForm.startDate}</Text>
                    </TouchableOpacity>
                    {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
                </View>

                {(medicationForm.duration !== 'ongoing' && !medicationForm.medicineAlwaysOn) && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>End Date (calc.)</Text>
                        <View style={[
                            styles.dateButton,
                            {
                                backgroundColor: isDark ? '#0A0A0A' : '#f0f0f0',
                                borderColor: 'transparent'
                            },
                            errors.endDate && styles.btnError
                        ]}>
                            <Ionicons name="calendar-outline" size={20} color={isDark ? '#444' : "#999"} />
                            <Text style={[styles.dateText, { color: isDark ? '#444' : '#999' }]}>
                                {medicationForm.endDate || 'Calculated automatically'}
                            </Text>
                        </View>
                        {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
                    </View>
                )}
            </View>

            {showPicker && (
                <DateTimePicker
                    value={getDateObject(showPicker === 'start' ? medicationForm.startDate : medicationForm.endDate)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={showPicker === 'end' ? getDateObject(medicationForm.startDate) : undefined}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        padding: 12,
        gap: 8,
    },
    btnError: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginTop: 4,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
});



