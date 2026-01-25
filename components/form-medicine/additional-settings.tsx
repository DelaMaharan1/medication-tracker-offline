import { colorsTheme } from '@/constants/theme';
import { FormErrors, Medication, WithFoodType } from '@/utils/ttype';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
    form: Medication;
    updateForm: (update: Partial<Medication>) => void;
    errors: FormErrors;
}

export default function AdditionalSettings({ form, updateForm, errors }: Props) {
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Additional Settings</Text>

            <Text style={styles.label}>Take with Food?</Text>
            <View style={styles.row}>
                {(['before', 'after', 'custom'] as WithFoodType[]).map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.foodOption,
                            form.withFood === option && styles.selectedFoodOption,
                            errors.withFood && styles.errorBorder
                        ]}
                        onPress={() => updateForm({ withFood: option })}
                    >
                        <Text style={[
                            styles.foodOptionText,
                            form.withFood === option && styles.selectedFoodOptionText
                        ]}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errors.withFood && <Text style={styles.errorText}>{errors.withFood}</Text>}

            <View style={{ height: 20 }} />

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add instruction or notes..."
                value={form.notes}
                onChangeText={(text) => updateForm({ notes: text })}
                multiline
                numberOfLines={3}
            />
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    foodOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginHorizontal: 4,
    },
    selectedFoodOption: {
        backgroundColor: '#E6F4FE',
        borderColor: colorsTheme.primary,
    },
    foodOptionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedFoodOptionText: {
        color: colorsTheme.primary,
        fontWeight: '600',
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorBorder: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginTop: 4,
        marginLeft: 4,
    },
});
