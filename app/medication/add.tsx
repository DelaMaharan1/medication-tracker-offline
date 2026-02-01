import AdditionalSettings from '@/components/form-medicine/additional-settings';
import BasicInformation from '@/components/form-medicine/basic-information';
import FormActions from '@/components/form-medicine/form-actions';
import { HeaderSection } from '@/components/form-medicine/header';
import RefillReminderSection from '@/components/form-medicine/refill-reminder-section';
import ScheduleSection from '@/components/form-medicine/schedule-section';
import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useMedicationForm } from '@/hooks/useMedicationForm';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function AddMedicineScreen() {
  const { theme, isDark } = useTheme();
  const { form, errors, isAddMode, updateForm, clearError, handleDelete, handleSubmit, router } = useMedicationForm();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[colorsTheme.primary, isDark ? '#822F2F' : colorsTheme.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerContainer}>
          <HeaderSection text={isAddMode ? 'Add' : 'Edit'} />
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <BasicInformation
              medicationForm={form}
              errors={errors}
              updateForm={updateForm}
              clearErrors={clearError}
            />

            <ScheduleSection
              form={form}
              updateForm={updateForm}
              errors={errors}
              isAddMode={isAddMode}
            />

            <RefillReminderSection
              form={form}
              updateForm={updateForm}
              isAddMode={isAddMode}
              errors={errors}
            />

            <AdditionalSettings
              form={form}
              updateForm={updateForm}
              errors={errors}
            />

          </View>
        </ScrollView>

        <FormActions
          isAddMode={isAddMode}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
          onCancel={() => router.back()}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    marginTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 20,
  },
});


