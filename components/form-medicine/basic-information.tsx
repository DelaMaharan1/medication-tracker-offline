import { DosageUnit, FormErrors, MedicationFormData, MedicationType } from '@/utils/ttype';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

interface Props {
  medicationForm: MedicationFormData;
  errors: FormErrors;
  updateForm: (update: Partial<MedicationFormData>) => void;
  clearErrors: (field: string) => void;
}

const medicationTypes: MedicationType[] = ['pill', 'syringe', 'injection', 'drops', 'others'];
const dosageUnits: DosageUnit[] = ['mg', 'ml', 'tablet', 'capsule', 'drop', 'puff', 'unit', 'others'];

export default function BasicInformation({
  medicationForm,
  errors,
  updateForm,
  clearErrors,
}: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={false}>
      <View style={styles.formSection}>

        {/* A. Basic Information */}
        <Text style={styles.sectionHeader}>Basic Information</Text>

        {/* Medicine Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Medicine Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter medication name"
            placeholderTextColor={'#999'}
            value={medicationForm.name}
            onChangeText={(text) => {
              updateForm({ name: text });
              clearErrors('name');
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Brand (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Brand (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter brand name"
            placeholderTextColor={'#999'}
            value={medicationForm.brand}
            onChangeText={(text) => updateForm({ brand: text })}
          />
        </View>

        <View style={styles.divider} />

        {/* B. Medication Details */}
        <Text style={styles.sectionHeader}>Medication Details</Text>

        {/* Medication Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Medication Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.pickerContainer, errors.type && styles.inputError]}>
            <Picker
              selectedValue={medicationForm.type}
              style={styles.picker}
              onValueChange={(itemValue) => {
                updateForm({ type: itemValue });
                clearErrors('type');
              }}
            >
              {medicationTypes.map((type) => (
                <Picker.Item
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  value={type}
                />
              ))}
            </Picker>
          </View>
          {medicationForm.type === 'others' && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Specify medication type"
              placeholderTextColor={'#999'}
              value={medicationForm.othersType}
              onChangeText={(text) => updateForm({ othersType: text })}
            />
          )}
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        {/* Dosage Section (Side by Side) */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 4 }]}>
            <Text style={styles.label}>
              Dosage <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.dosage && styles.inputError]}
              placeholder="e.g., 500"
              placeholderTextColor={'#999'}
              value={medicationForm.dosage}
              onChangeText={(text) => {
                updateForm({ dosage: text });
                clearErrors('dosage');
              }}
              keyboardType="numeric"
            />
            {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}
          </View>

          <View style={[styles.inputGroup, { flex: 3, marginLeft: 12 }]}>
            <Text style={styles.label}>
              Unit <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.pickerContainer, errors.dosageUnit && styles.inputError]}>
              <Picker
                selectedValue={medicationForm.dosageUnit}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  updateForm({ dosageUnit: itemValue });
                  clearErrors('dosageUnit');
                }}
              >
                {dosageUnits.map((unit) => (
                  <Picker.Item
                    key={unit}
                    label={unit}
                    value={unit}
                  />
                ))}
              </Picker>
            </View>
            {errors.dosageUnit && <Text style={styles.errorText}>{errors.dosageUnit}</Text>}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  inputGroup: {
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
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
});