import { FormErrors, FrequencyOption, MedicationFormData, WithFoodType } from "@/utils/ttype";

export function validateMedicationForm(
    form: MedicationFormData,
    FrequencyOption: FrequencyOption[],
    WithFoodOption: WithFoodType[],
    userProfile?: { wakeTime: string; sleepTime: string, dailyCycle: boolean }
) {
    const errors: FormErrors = {};
    if (!form.name.trim()) {
        errors.name = 'Medication name is required';
    }

    if (!form.type?.at(0)) {
        errors.type = 'Medication type is required';
    } else if (form.type === 'others' && !form.othersType?.trim()) {
        errors.othersType = 'Please specify the medication type';
    }

    if (!form.dosage?.trim()) {
        errors.dosage = 'Medication dosage is required';
    } else if (isNaN(Number(form.dosage)) || Number(form.dosage) <= 0) {
        errors.dosage = 'Dosage must be a positive number';
    }

    if (!form.dosageUnit) {
        errors.dosageUnit = 'Medication dosage unit is required';
    }

    if (!form.frequency) {
        errors.frequency = 'Medication frequency is required';
    } else {
        const validFrequencies: string[] = ['once', 'twice', 'three', 'four', 'custom'];
        if (!validFrequencies.includes(form.frequency)) {
            errors.frequency = 'Invalid frequency selected';
        }

        if (form.frequency !== 'custom' && (!form.times || form.times.length === 0)) {
            errors.times = 'Please set medication times';
        } else if (form.frequency === 'custom' && (!form.times || form.times.length < 1)) {
            errors.times = 'Please set at least one time for custom frequency';
        }
    }

    if (userProfile && !userProfile.dailyCycle === false) {
        if (userProfile && form.times && form.times.length > 0) {
            const { wakeTime, sleepTime } = userProfile;
            const [wakeH, wakeM] = wakeTime.split(':').map(Number);
            const [sleepH, sleepM] = sleepTime.split(':').map(Number);
            const wakeMins = wakeH * 60 + wakeM;
            const sleepMins = sleepH * 60 + sleepM;

            const isOvernight = sleepMins < wakeMins;

            for (const time of form.times) {
                const [h, m] = time.split(':').map(Number);
                const tMins = h * 60 + m;

                let inRange = false;
                if (isOvernight) {
                    // Awake is [Wake, 24h) OR [0, Sleep)
                    inRange = (tMins >= wakeMins) || (tMins < sleepMins);
                } else {
                    // Awake is [Wake, Sleep)
                    inRange = (tMins >= wakeMins) && (tMins < sleepMins);
                }

                if (!inRange) {
                    errors.times = `Time ${time} is during your sleeping hours (${userProfile.sleepTime} - ${userProfile.wakeTime}). Please adjust or change your cycle in Settings.`;
                    break;
                }
            }
        }
    }

    if (!form.withFood) {
        errors.withFood = 'Please specify if medication should be taken with food';
    } else if (!WithFoodOption.includes(form.withFood)) {
        errors.withFood = 'Invalid food timing selected';
    }

    if (!form.startDate) {
        errors.startDate = 'Start date is required';
    }

    const frequencyCounts: Record<string, number> = {
        'once': 1,
        'twice': 2,
        'three': 3,
        'four': 4,
    };

    if (form.frequency && form.frequency !== 'custom') {
        const expectedCount = frequencyCounts[form.frequency];
        if (!errors.times && form.times.length !== expectedCount) {
            errors.times = `Frequency "${form.frequency}" requires exactly ${expectedCount} time(s)`;
        }
    }

    if (!form.duration) {
        errors.duration = 'Duration is required';
    } else if (form.duration === 'custom' && !form.customDuration?.trim()) {
        errors.customDuration = 'Please specify custom duration';
    }

    if (form.endDate) {
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);

        if (endDate <= startDate) {
            errors.endDate = 'End date must be after start date';
        }
    }

    if (form.currentSupply === undefined || form.currentSupply === null) {
        errors.currentSupply = 'Current supply is required';
    } else if (form.currentSupply < 0) {
        errors.currentSupply = 'Current supply cannot be negative';
    }

    if (form.refillReminder) {
        if (form.refillAt === undefined || form.refillAt === null) {
            errors.refillAt = 'Refill threshold is required when refill reminder is enabled';
        } else if (form.refillAt <= 0) {
            errors.refillAt = 'Refill threshold must be positive';
        } else if (form.currentSupply !== undefined && form.refillAt >= form.currentSupply) {
            errors.refillAt = 'Refill threshold must be less than current supply';
        }
    }

    return errors;
}

export function isMedicationFormValid(errors: FormErrors): boolean {
    return Object.keys(errors).length === 0;
}


