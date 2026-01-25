import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useSnackbar } from '@/context/snackbar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { takeMedication } = useMedication();
  const { showSnackbar } = useSnackbar();

  const { title, body, medicationId, doseTime } = params;

  const handleTake = async () => {
    if (!medicationId) {
      router.back();
      return;
    }

    try {
      const now = new Date();
      const timeForRecord = (doseTime as string) || `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const result = await takeMedication(medicationId as string, timeForRecord);

      if (result.success) {
        showSnackbar('Medication marked as taken', 'success');
        router.back();
      } else {
        Alert.alert('Error', result.error || 'Failed to record dose');
        router.back();
      }
    } catch (error) {
      console.error('Modal Take Error:', error);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <View style={styles.card}>
        <Text style={styles.title}>{title || 'Medication Reminder'}</Text>
        <Text style={styles.body}>{body || 'It is time to take your medication.'}</Text>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleTake}
        >
          <Text style={styles.buttonText}>I have taken it</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.dismissText}>Remind me later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colorsTheme.primary,
  },
  body: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colorsTheme.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  }
});
