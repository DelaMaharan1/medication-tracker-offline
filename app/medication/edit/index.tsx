import { HeaderSection } from '@/components/form-medicine/header';
import { colorsTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';


export default function EditMedicineScreen() {
  const [isAddMode, setIsAddMode] = useState(false);

  return (
    <View style={styles.container}>
        <LinearGradient
            colors={[colorsTheme.primary, colorsTheme.secondary]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        />

        <View style={styles.content}>
          <HeaderSection text={isAddMode ? 'Add' : 'Edit'} />
        </View>
    </View>
  )
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
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
})