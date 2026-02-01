// constants/medicine/frequency-items.ts
import { FrequencyOption } from '@/utils/ttype';

export const FREQUENCY_OPTION: FrequencyOption[] = [
  {
    id: 'once',
    label: 'Once a Day',
    icon: 'sunny-outline', // Pastikan icon valid untuk Ionicons
    defaultTimes: ['08:00'],
    minHour: 0,
    maxHour: 23,
    count: 1
  },
  {
    id: 'twice',
    label: 'Twice a Day',
    icon: 'partly-sunny-outline',
    defaultTimes: ['08:00', '20:00'],
    minHour: 0,
    maxHour: 23,
    count: 2
  },
  {
    id: 'three',
    label: 'Three Times a Day',
    icon: 'calendar-outline',
    defaultTimes: ['08:00', '13:00', '20:00'],
    minHour: 0,
    maxHour: 23,
    count: 3
  },
  {
    id: 'four', // Perbaiki: dari 'fourth' jadi 'four' sesuai dengan FrequencyType
    label: 'Four Times a Day',
    icon: 'time-outline',
    defaultTimes: ['08:00', '12:00', '18:00', '22:00'],
    minHour: 0,
    maxHour: 23,
    count: 4
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: 'settings-outline',
    defaultTimes: []
  },
];

// Helper functions
export const getFrequencyById = (id: string): FrequencyOption | undefined => {
  return FREQUENCY_OPTION.find(freq => freq.id === id);
};

export const getDefaultTimesByFrequency = (frequencyId: string): string[] => {
  const frequency = getFrequencyById(frequencyId);
  return frequency?.defaultTimes || ['08:00'];
};


