import { FREQUENCY_OPTION } from '@/constants/medicine/frequency-items';
import { WITH_FOOD_OPTIONS } from '@/constants/medicine/with-food-option';
import { useMedication } from '@/context/medicine';
import { useSnackbar } from '@/context/snackbar';
import { addMedication, deletedMedication, getMedication, getUser, updateMedication } from '@/utils/storage';
import { FormErrors, Medication, MedicationFormData, WithFoodType, toLocalISOString } from '@/utils/ttype';
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

    type FormState = MedicationFormData & {
        id: string;
        createdAt: string;
        updatedAt: string;
    };

    const [form, setForm] = useState<FormState>({
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
        currentSupply: undefined,
        refillAt: undefined,
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

    const [userProfile, setUserProfile] = useState<{ wakeTime: string; sleepTime: string } | null>(null);

    useEffect(() => {
        async function loadUser() {
            const user = await getUser();
            if (user && user.wakeTime && user.sleepTime) {
                setUserProfile({ wakeTime: user.wakeTime, sleepTime: user.sleepTime });
            }
        }
        loadUser();
    }, []);

    const generateTimes = (frequency: string, wakeTime: string, sleepTime: string) => {
        const countMap: Record<string, number> = { once: 1, twice: 2, three: 3, four: 4 };
        const count = countMap[frequency];
        if (!count) return ['08:00'];

        const [wakeH, wakeM] = wakeTime.split(':').map(Number);
        const [sleepH, sleepM] = sleepTime.split(':').map(Number);

        const wakeDate = new Date();
        wakeDate.setHours(wakeH, wakeM, 0, 0);

        const sleepDate = new Date();
        sleepDate.setHours(sleepH, sleepM, 0, 0);

        if (sleepDate <= wakeDate) {
            sleepDate.setDate(sleepDate.getDate() + 1);
        }

        const totalDuration = sleepDate.getTime() - wakeDate.getTime();
        const times = [];

        if (count === 1) {
            // For once a day, suggest 1 hour after wake up (approx breakfast)
            const suggestion = new Date(wakeDate.getTime() + 60 * 60 * 1000);
            // Ensure it's not past sleep time
            if (suggestion > sleepDate) return [wakeTime];
            times.push(suggestion);
        } else {
            const interval = totalDuration / (count - 1);
            for (let i = 0; i < count; i++) {
                const time = new Date(wakeDate.getTime() + i * interval);
                times.push(time);
            }
        }

        return times.map(d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    };

    const updateForm = useCallback((update: Partial<Medication>) => {
        setForm(prev => {
            const next = { ...prev, ...update };

            // Smart Suggestion Logic
            if (update.frequency && update.frequency !== prev.frequency) {
                if (userProfile && ['once', 'twice', 'three', 'four'].includes(update.frequency)) {
                    next.times = generateTimes(update.frequency, userProfile.wakeTime, userProfile.sleepTime);
                } else if (!userProfile) {
                    const staticOption = FREQUENCY_OPTION.find(f => f.id === update.frequency);
                    if (staticOption && staticOption.defaultTimes) {
                        next.times = [...staticOption.defaultTimes];
                    }
                }
            }
            return next;
        });
    }, [userProfile]);

    const clearError = useCallback((field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);


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

    const { dailyCycle } = useMedication();

    const handleSubmit = async () => {
        try {
            const validationProfile = userProfile ? { ...userProfile, dailyCycle } : undefined;

            const validationError = validateMedicationForm(
                form,
                FREQUENCY_OPTION,
                WITH_FOOD_OPTIONS.map(opt => opt.value) as WithFoodType[],
                validationProfile
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

            // Add timestamp to force Sync Engine to detect changes
            const payload = {
                ...(form as Medication),
                updatedAt: new Date().toISOString()
            };

            if (isAddMode) {
                await addMedication(payload);
            } else {
                await updateMedication(payload);
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
        router
    };
}



