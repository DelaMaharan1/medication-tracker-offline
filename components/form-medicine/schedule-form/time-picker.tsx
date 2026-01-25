import { colorsTheme } from '@/constants/theme';
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

export default function TimePicker({ medicationForm, updateForm, errors }: Props) {
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const isCustomFrequency = medicationForm.frequency === 'custom';

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate && editingIndex !== null) {
            const timeString = selectedDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const newTimes = [...medicationForm.times];
            newTimes[editingIndex] = timeString;
            // newTimes.sort(); // Don't sort automatically, user might want specific order or just confusing UI jump

            updateForm({ times: newTimes });
            setEditingIndex(null);
        }
    };

    const addTimeSlot = () => {
        if (!isCustomFrequency) return;
        const newTimes = [...medicationForm.times, '08:00'];
        updateForm({ times: newTimes });
    };

    const removeTimeSlot = (index: number) => {
        if (!isCustomFrequency) return;
        const newTimes = medicationForm.times.filter((_, i) => i !== index);
        updateForm({ times: newTimes });
    };

    const requestEditTime = (index: number) => {
        setEditingIndex(index);
        setShowTimePicker(true);
    };

    const getTimeDate = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Schedule Times <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.tagsContainer}>
                {medicationForm.times.map((time, index) => (
                    <TouchableOpacity
                        key={`${time}-${index}`}
                        style={styles.timeTag}
                        onPress={() => requestEditTime(index)}
                    >
                        <Ionicons name="time-outline" size={16} color={colorsTheme.primary} />
                        <Text style={styles.timeText}>{time}</Text>
                        {isCustomFrequency && medicationForm.times.length > 1 && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeTimeSlot(index)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close-circle" size={16} color="#FF3B30" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                ))}

                {isCustomFrequency && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={addTimeSlot}
                    >
                        <Ionicons name="add" size={20} color="white" />
                        <Text style={styles.addText}>Add time</Text>
                    </TouchableOpacity>
                )}
            </View>

            {errors.times && <Text style={styles.errorText}>{errors.times}</Text>}

            {showTimePicker && (
                <DateTimePicker
                    value={getTimeDate(medicationForm.times[editingIndex ?? 0] || '08:00')}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={handleTimeChange}
                />
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
        marginBottom: 8,
    },
    required: {
        color: '#FF3B30',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E6F4FE',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#B3E0FD',
    },
    timeText: {
        color: colorsTheme.primary,
        fontWeight: '600',
        marginHorizontal: 6,
    },
    removeButton: {
        marginLeft: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colorsTheme.secondary,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    addText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 4,
    },
});
