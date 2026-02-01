import { DURATION_OPTIONS } from '@/constants/medicine/duration';
import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { FormErrors, MedicationFormData } from '@/utils/ttype';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
    medicationForm: MedicationFormData;
    updateForm: (update: Partial<MedicationFormData>) => void;
    errors: FormErrors;
}

export default function Duration({ medicationForm, updateForm, errors }: Props) {
    const { theme, isDark } = useTheme();

    const handleDurationChange = (value: string) => {
        const updates: Partial<MedicationFormData> = { duration: value as any };

        if (value === 'ongoing') {
            updates.endDate = undefined;
            updates.customDuration = '';
        } else if (value !== 'custom') {
            // Calculate end date for preset days
            const days = parseInt(value);
            if (!isNaN(days) && medicationForm.startDate) {
                const start = new Date(medicationForm.startDate);
                const end = new Date(start);
                end.setDate(start.getDate() + days - 1);
                updates.endDate = end.toISOString().split('T')[0];
            }
        }

        updateForm(updates);
    };

    const handleCustomDurationChange = (text: string) => {
        const days = parseInt(text);
        const updates: Partial<MedicationFormData> = { customDuration: text };

        if (!isNaN(days) && days > 0 && medicationForm.startDate) {
            const start = new Date(medicationForm.startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + days - 1);
            updates.endDate = end.toISOString().split('T')[0];
        } else {
            updates.endDate = undefined; // Or keep previous? Better to clear if invalid.
        }
        updateForm(updates);
    }

    // Auto-update EndDate when StartDate changes
    React.useEffect(() => {
        if (!medicationForm.startDate) return;

        const start = new Date(medicationForm.startDate);
        let newEndDate: string | undefined;

        if (medicationForm.duration === 'custom' && medicationForm.customDuration) {
            const days = parseInt(medicationForm.customDuration);
            if (!isNaN(days) && days > 0) {
                const end = new Date(start);
                end.setDate(start.getDate() + days - 1);
                newEndDate = end.toISOString().split('T')[0];
            }
        } else if (medicationForm.duration !== 'ongoing' && medicationForm.duration !== 'custom') {
            const days = parseInt(medicationForm.duration);
            if (!isNaN(days)) {
                const end = new Date(start);
                end.setDate(start.getDate() + days - 1);
                newEndDate = end.toISOString().split('T')[0];
            }
        }

        // Only update if changed to avoid loops
        if (newEndDate !== medicationForm.endDate) {
            if (medicationForm.duration !== 'ongoing') {
                updateForm({ endDate: newEndDate });
            }
        }
    }, [medicationForm.startDate, medicationForm.duration, medicationForm.customDuration]);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.text }]}>Duration</Text>

            <View style={styles.verticalOptions}>
                {DURATION_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.optionRow,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                                borderColor: isDark ? '#333' : '#e9ecef'
                            },
                            medicationForm.duration === option.value && {
                                backgroundColor: isDark ? '#2D1A1A' : '#E6F4FE',
                                borderColor: colorsTheme.primary
                            },
                            errors.duration && styles.errorBorder
                        ]}
                        onPress={() => handleDurationChange(option.value)}
                    >
                        <View style={[
                            styles.radioCircle,
                            { borderColor: isDark ? '#636366' : '#bdc3c7' },
                            medicationForm.duration === option.value && { borderColor: colorsTheme.primary }
                        ]}>
                            {medicationForm.duration === option.value && (
                                <View style={[styles.radioDot, { backgroundColor: colorsTheme.primary }]} />
                            )}
                        </View>
                        <Text style={[
                            styles.optionText,
                            { color: theme.text },
                            medicationForm.duration === option.value && { color: colorsTheme.primary, fontWeight: '600' }
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}

            {medicationForm.duration === 'custom' && (
                <View>
                    <View style={[
                        styles.customInputContainer,
                        {
                            backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                            borderColor: isDark ? '#333' : '#e9ecef'
                        },
                        errors.customDuration && styles.errorBorder
                    ]}>
                        <Text style={[styles.customLabel, { color: isDark ? theme.icon : '#666' }]}>Number of days:</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="e.g. 10"
                            placeholderTextColor={isDark ? '#636366' : '#999'}
                            keyboardType="numeric"
                            value={medicationForm.customDuration}
                            onChangeText={handleCustomDurationChange}
                        />
                        <Text style={[styles.daysText, { color: isDark ? theme.icon : '#666' }]}>Days</Text>
                    </View>
                    {errors.customDuration && <Text style={styles.errorText}>{errors.customDuration}</Text>}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    verticalOptions: {
        flexDirection: 'column',
        gap: 8,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    selectedOptionRow: {
        backgroundColor: '#E6F4FE',
        borderColor: '#2196F3',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#bdc3c7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    selectedRadioCircle: {
        borderColor: '#2196F3',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2196F3',
    },
    optionText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#2196F3',
        fontWeight: '600',
    },
    customInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginTop: 12,
        paddingHorizontal: 16,
    },
    customLabel: {
        fontSize: 15,
        color: '#666',
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    daysText: {
        fontSize: 15,
        color: '#666',
        marginLeft: 10,
    },
    errorBorder: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginTop: 4,
        marginLeft: 5,
    },
});



