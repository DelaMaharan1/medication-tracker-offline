import { colorsTheme } from '@/constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/sign-in')
    }, 2000)
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconsContainer, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>

        {/* Gradient Icon */}
        <MaskedView
          maskElement={
            <MaterialCommunityIcons
              name="medication"
              size={80}
              color="black"
              style={styles.icon}
            />
          }>
          <LinearGradient
            colors={[colorsTheme.primary, colorsTheme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        </MaskedView>

        {/* Gradient Text ONLY (tanpa icon) */}
        <MaskedView
          maskElement={
            <View style={styles.textMask}>
              <Animated.Text style={styles.appName}>
                MediTrack
              </Animated.Text>
            </View>
          }>
          <LinearGradient
            colors={[colorsTheme.primary, colorsTheme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientText}
          />
        </MaskedView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  iconsContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
  },
  gradient: {
    width: 80,
    height: 80,
  },
  textMask: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: 20,
    letterSpacing: 1,
    backgroundColor: 'transparent'
  },
  gradientText: {
    width: 200,
    height: 50, // Sesuaikan tinggi dengan teks saja
    marginTop: 20, // Tambah margin untuk pemisah dari icon
  }
})