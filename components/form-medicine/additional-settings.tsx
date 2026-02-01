import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { FormErrors, Medication, WithFoodType } from '@/utils/ttype';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
    form: Medication;
    updateForm: (update: Partial<Medication>) => void;
    errors: FormErrors;
}

export default function AdditionalSettings({ form, updateForm, errors }: Props) {
    const { theme, isDark } = useTheme();

    const mealInstructions: { value: WithFoodType; label: string }[] = [
        { value: 'before', label: 'Before' },
        { value: 'with', label: 'With' },
        { value: 'after', label: 'After' },
    ];

    const offsetOptions = [
        { value: -30, label: '-30m' },
        { value: 0, label: '0m' },
        { value: 30, label: '+30m' },
    ];

    const toleranceWindow = {
        before: { min: -40, max: -5, desc: 'Take 30m or 5m before meal' },
        with: { min: -5, max: 15, desc: 'Take during meal' },
        after: { min: 15, max: 60, desc: 'Take 30m after meal' }
    };

    const currentTolerance = toleranceWindow[form.withFood as keyof typeof toleranceWindow];

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Settings</Text>

            <Text style={[styles.label, { color: theme.text }]}>Take with Food?</Text>
            <View style={styles.row}>
                {mealInstructions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.foodOption,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                                borderColor: isDark ? '#333' : '#e9ecef'
                            },
                            form.withFood === option.value && {
                                backgroundColor: isDark ? '#2D1A1A' : '#E6F4FE',
                                borderColor: colorsTheme.primary
                            },
                        ]}
                        onPress={() => {
                            // Automatically set default offset Based on choice if needed, 
                            // but user wants choice. Let's keep offset separate.
                            updateForm({ withFood: option.value });
                        }}
                    >
                        <Text style={[
                            styles.foodOptionText,
                            { color: isDark ? theme.icon : '#666' },
                            form.withFood === option.value && { color: colorsTheme.primary, fontWeight: '600' }
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 20 }} />

            <Text style={[styles.label, { color: theme.text }]}>Meal Offset</Text>
            <View style={styles.row}>
                {offsetOptions.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[
                            styles.foodOption,
                            {
                                backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                                borderColor: isDark ? '#333' : '#e9ecef'
                            },
                            form.mealOffsetMinutes === opt.value && {
                                backgroundColor: isDark ? '#2D1A1A' : '#E6F4FE',
                                borderColor: colorsTheme.primary
                            },
                        ]}
                        onPress={() => updateForm({ mealOffsetMinutes: opt.value })}
                    >
                        <Text style={[
                            styles.foodOptionText,
                            { color: isDark ? theme.icon : '#666' },
                            form.mealOffsetMinutes === opt.value && { color: colorsTheme.primary, fontWeight: '600' }
                        ]}>
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Simple Explanation */}
            <View style={[
                styles.explanationContainer,
                { backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB' }
            ]}>
                <Text style={[styles.explanationText, { color: theme.text }]}>
                    {currentTolerance.desc}
                </Text>
                <Text style={[styles.toleranceText, { color: isDark ? theme.icon : '#666' }]}>
                    Tolerance Window: {currentTolerance.min} to {currentTolerance.max > 0 ? `+${currentTolerance.max}` : currentTolerance.max} minutes
                </Text>
            </View>

            <View style={{ height: 20 }} />

            <Text style={[styles.label, { color: theme.text }]}>Notes (Optional)</Text>
            <TextInput
                style={[
                    styles.input,
                    styles.textArea,
                    {
                        backgroundColor: isDark ? '#1C1C1E' : '#f8f9fa',
                        borderColor: isDark ? '#333' : '#e9ecef',
                        color: theme.text
                    }
                ]}
                placeholder="Add instruction or notes..."
                placeholderTextColor={isDark ? '#636366' : '#999'}
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
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
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
        borderWidth: 1,
        marginHorizontal: 4,
    },
    foodOptionText: {
        fontSize: 14,
    },
    explanationContainer: {
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent', // Added to maintain layout
    },
    explanationText: {
        fontSize: 14,
        marginBottom: 4,
    },
    toleranceText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
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



