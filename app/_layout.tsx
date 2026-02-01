import ModalNotifications from '@/components/modal-notifications';
import { MedicineProvider } from '@/context/medicine';
import { SnackbarProvider } from '@/context/snackbar';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/theme-context';
import { auth } from '@/utils/firebase';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments();
  const { isDark } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const currentSegments = segments as string[];
    const inAuthGroup = currentSegments[0] === '(auth)';
    const isSplash = currentSegments.length === 0 || currentSegments[0] === 'index';

    if (!user && !inAuthGroup && !isSplash) {
      router.replace('/(auth)/sign-in');
    } else if (user && (inAuthGroup || isSplash)) {
      router.replace('/(tabs)/home');
    }
  }, [user, segments, initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <NavThemeProvider value={isDark ? NavDarkTheme : NavLightTheme}>
      <ModalNotifications />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="medication/add" />
        <Stack.Screen name="medication/edit/index" />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <MedicineProvider>
        <SnackbarProvider>
          <RootLayoutContent />
        </SnackbarProvider>
      </MedicineProvider>
    </CustomThemeProvider>
  );
}



