import { FREQUENCY_OPTION } from '@/constants/medicine/frequency-items';
import { WITH_FOOD_OPTIONS } from '@/constants/medicine/with-food-option';
import { useSnackbar } from '@/context/snackbar';
import { addMedication, deletedMedication, getMedication, updateMedication } from '@/utils/storage';
import { FormErrors, Medication, WithFoodType, toLocalISOString } from '@/utils/ttype';
import { isMedicationFormValid, validateMedicationForm } from '@/utils/validation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useMedicationForm() {
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const params = useLocalSearchParams();
    const [isAddMode, setIsAddMode] = useState<boolean>(!params.id);
    const [errors, setErrors] = useState<FormErrors>({});

    const [form, setForm] = useState<Medication>({
        id: (params.id as string) || Math.random().toString(36).substr(2, 9),
        name: '',
        brand: '',
        type: 'pill',
        othersType: '',
        notes: '',
        dosage: '',
        dosageUnit: 'mg',
        frequency: 'once',
        times: ['08:00'],
        withFood: 'before',
        mealOffsetMinutes: -30,
        instruction: '',
        startDate: toLocalISOString(new Date()),
        duration: 'ongoing',
        customDuration: '',
        endDate: '',
        refillReminder: false,
        currentSupply: 0,
        refillAt: 0,
        reminderEnabled: true,
        notificationId: [],
        isActive: true,
        medicineAlwaysOn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    useEffect(() => {
        async function loadData() {
            if (params.id) {
                const meds = await getMedication();
                const med = meds.find(m => m.id === params.id);
                if (med) {
                    setForm(med);
                    setIsAddMode(false);
                }
            }
        }
        loadData();
    }, [params.id]);

    const updateForm = useCallback((update: Partial<Medication>) => {
        setForm(prev => ({ ...prev, ...update }));
    }, []);

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);



    // ... existing useState ...

    const handleDelete = async () => {
        Alert.alert(
            'Delete Medicine',
            'Are you sure you want to delete this medicine?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletedMedication(form.id);

                            showSnackbar('Medicine deleted successfully', 'success');
                            router.back();
                        } catch (error) {
                            showSnackbar('Failed to delete medicine', 'error');
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        try {
            const validationError = validateMedicationForm(
                form,
                FREQUENCY_OPTION,
                WITH_FOOD_OPTIONS.map(opt => opt.value) as WithFoodType[]
            );
            setErrors(validationError);

            if (!isMedicationFormValid(validationError)) {
                const firstErrorKey = Object.keys(validationError)[0];
                const firstErrorMessage = validationError[firstErrorKey];

                Alert.alert(
                    'Validation Error',
                    firstErrorMessage,
                    [{ text: 'OK', style: 'cancel' }],
                    { cancelable: true }
                );
                return;
            }

            if (isAddMode) {
                await addMedication(form);
            } else {
                await updateMedication(form);
            }

            showSnackbar(
                isAddMode ? 'Medicine added successfully!' : 'Medicine updated successfully!',
                'success'
            );
            router.back();

        } catch (error) {
            showSnackbar('Failed to save medication. Please try again.', 'error');
            console.error(error);
        }
    };

    return {
        form,
        errors,
        isAddMode,
        updateForm,
        clearError,
        handleDelete,
        handleSubmit,
        router // exposing router just in case, though mostly handled internally
    };
}



