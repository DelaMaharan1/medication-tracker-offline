import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; // Pastikan import konsisten
import MaskedView from '@react-native-masked-view/masked-view';
import * as Font from 'expo-font'; // Tambahkan ini
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const { theme, isDark } = useTheme();
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(MaterialCommunityIcons.font);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 10,
          friction: 5,
          useNativeDriver: true
        }),
      ]).start();

      const timer = setTimeout(() => {
        const { auth } = require('@/utils/firebase');
        if (!auth.currentUser) {
          router.replace('/(auth)/sign-in');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!isReady) return <View style={[styles.container, { backgroundColor: theme.background }]} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.iconsContainer, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>

        {/* Gradient Icon */}
        <View style={styles.iconWrapper}>
          <MaskedView
            style={styles.maskContainer}
            maskElement={
              <View style={styles.centerMask}>
                <MaterialIcons
                  name="medication"
                  size={100}
                  color={isDark ? '#fff' : '#000'}
                />
              </View>
            }>
            <LinearGradient
              colors={[colorsTheme.primary, isDark ? '#5C1D1D' : colorsTheme.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientFill}
            />
          </MaskedView>
        </View>

        {/* Gradient Text */}
        <MaskedView
          style={styles.textMaskContainer}
          maskElement={
            <View style={styles.centerMask}>
              <Animated.Text style={styles.appName}>
                MediTrack
              </Animated.Text>
            </View>
          }>
          <LinearGradient
            colors={[colorsTheme.primary, isDark ? '#5C1D1D' : colorsTheme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
        </MaskedView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  maskContainer: {
    width: 100,
    height: 100,
  },
  textMaskContainer: {
    width: '100%',
    height: 60,
    marginTop: 10,
  },
  centerMask: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  gradientFill: {
    flex: 1,
  }
});


