/**
 * Medication Management Types
 * @module MedicationTypes
 */

/** Physical form of medication */
export type MedicationType = 'pill' | 'syringe' | 'injection' | 'drops' | 'others';

/** Dosage measurement unit */
export type DosageUnit = 'mg' | 'ml' | 'tablet' | 'capsule' | 'drop' | 'puff' | 'unit' | 'others';

/** Daily frequency */
export type FrequencyType = 'once' | 'twice' | 'three' | 'four' | 'custom';

/** Meal timing relation */
export type WithFoodType = 'before' | 'with' | 'after';

/**
 * Core medication entity
 */
export interface Medication {
    id: string;

    name: string;
    brand?: string;
    color?: string;
    type: MedicationType;
    othersType?: string;
    notes?: string;

    dosage: string;
    dosageUnit: DosageUnit;
    frequency: FrequencyType;
    times: string[];

    withFood: WithFoodType;
    mealOffsetMinutes: number;
    instruction?: string;

    startDate: string;
    duration: 'ongoing' | '7' | '14' | '30' | '90' | 'custom';
    customDuration?: string;
    endDate?: string;

    refillReminder: boolean;
    currentSupply: number;
    refillAt: number;

    reminderEnabled: boolean;
    notificationId?: string[];

    isActive: boolean;
    medicineAlwaysOn: boolean;

    createdAt: string;
    updatedAt: string;
}

/** Dose tracking status */
export type takenStatus = 'taken' | 'take' | 'missed';

/**
 * Record of individual doses
 * @example
 * const dose: DoseHistory = {
 *   id: 'dose-123',
 *   medicationId: 'med-123',
 *   timeStamp: '2023-10-15T10:00:00Z',
 *   taken: 1,
 *   takenStatus: 'taken'
 * }
 */

export interface DoseHistory {
    id: string;
    medicationId: string;
    timeStamp: string;
    taken: number;
    takenStatus?: takenStatus;
}

/**
 * Record of individual frequency options
 * @example
 * const freq: FrequencyOption = {
 *   id: ['once', 'twice'],
 *   label: 'Once or Twice',
 *   icon: 'icon-repeat',
 *   defaultTimes: ['08:00', '12:00'],
 *   minHour: 0,
 *   maxHour: 23
 * }
 */
export interface FrequencyOption {
    id: string
    label: string;
    icon: string;
    defaultTimes: string[];
    minHour?: number;
    maxHour?: number;
    description?: string;
    count?: number;
}

/**
 * Record of individual time slots
 * @example
 * const slot: TimeSlot = {
 *   id: 'slot-123',
 *   time: '08:00',
 *   enabled: true
 * }
 */
export interface TimeSlot {
    id: string;
    time: string;
    enabled: boolean;
}

/**
 * Statistics summary of medications
 * @example
 * const stats: MedicationStats = {
 *   totalMedications: 10,
 *   activeMedications: 5,
 *   takenToday: 3,
 *   missedToday: 1,
 *   pendingToday: 1,
 *   lowStockCount: 2
 * }
 */
export interface MedicationStats {
    totalMedications: number;
    activeMedications: number;
    takenToday: number;
    missedToday: number;
    pendingToday: number;
    lowStockCount: number;
}

/** Sorting options for medication lists */
export type SortByType = 'name' | 'nextDose' | 'supply';

/** Filter options for medication lists */
export type FilterType = 'all' | 'active' | 'lowStock' | 'inactive';

/**
 * Form data structure for creating/editing medications
 * @example
 * const formData: MedicineFormData = {
 *   name: 'Amoxicillin',
 *   brand: 'GlaxoSmithKline',
 *   type: 'pill',
 *   dosage: '500',
 *   dosageUnit: 'mg',
 *   frequency: 'twice',
 *   times: ['08:00', '12:00'],
 *   withFood: 'before',
 *   instruction: 'Take with food',
 *   startDate: '2023-10-15',
 *   duration: 'ongoing',
 *   refillReminder: true,
 *   currentSupply: 100,
 *   refillAt: 50,
 *   reminderEnabled: true,
 *   notificationId: ['notif-123'],
 *   isActive: true
 * }
 */
export interface MedicationFormData {
    name: string;
    brand?: string;
    type: MedicationType;
    othersType?: string;

    notes?: string;
    dosage: string;
    dosageUnit: DosageUnit;
    frequency: FrequencyType;
    times: string[]; //array waktu

    withFood: WithFoodType;
    mealOffsetMinutes: number;
    instruction?: string;
    startDate: string;

    duration: 'ongoing' | '7' | '14' | '30' | '90' | 'custom';
    customDuration?: string;
    endDate?: string;

    refillReminder: boolean;
    currentSupply?: number;
    refillAt?: number;
    reminderEnabled: boolean;
    notificationId?: string[];
    isActive: boolean;
    medicineAlwaysOn: boolean;
}

export interface FormErrors {
    [Key: string]: string;
}

export interface User {
    username: string;
    wakeTime?: string;
    sleepTime?: string;
    dailyCycle: boolean;
}

/**
 * Returns YYYY-MM-DD string based on local time, avoiding UTC shifts.
 */
export function toLocalISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}