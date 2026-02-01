import { FREQUENCY_OPTION } from "@/constants/medicine/frequency-items";
import { colorsTheme } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { FrequencyOption } from "@/utils/ttype";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

interface Props {
  selectedFrequency: string;
  onSelect: (frequencyId: string, times: string[]) => void;
  frequencies: FrequencyOption[]; // We will pass standard list or undefined to use default
  error?: string; // Add error prop
}

export function FrequencyOptions({
  selectedFrequency,
  onSelect,
  frequencies = FREQUENCY_OPTION,
  error
}: Props) {
  const { theme, isDark } = useTheme();

  const handleSelect = (freq: FrequencyOption) => {
    // Calculate times based on frequency
    let newTimes: string[] = [];
    const defaultTimes = ['08:00', '12:00', '18:00', '21:00'];

    if (freq.id === 'custom') {
      newTimes = ['08:00']; // Default 1 for custom
    } else {
      const count = freq.count || 1;
      newTimes = defaultTimes.slice(0, count);
    }

    onSelect(freq.id, newTimes);
  };

  return (
    <View>
      <View style={styles.optionsGrid}>
        {frequencies.map((freq) => (
          <TouchableOpacity
            key={freq.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : 'white',
                borderColor: isDark ? '#333' : '#e0e0e0'
              },
              selectedFrequency === freq.id && styles.selectedOptionCard,
              error ? styles.errorBorder : null
            ]}
            onPress={() => handleSelect(freq)}
          >
            <View
              style={[
                styles.optionIcon,
                { backgroundColor: isDark ? '#2C2C2E' : '#f5f5f5' },
                selectedFrequency === freq.id && styles.selectedOptionIcon,
              ]}
            >
              <Ionicons
                name={freq.icon as any}
                size={24}
                color={selectedFrequency === freq.id ? "white" : (isDark ? theme.icon : "#666")}
              />
            </View>
            <Text
              style={[
                styles.optionLabel,
                { color: theme.text },
                selectedFrequency === freq.id && styles.selectedOptionLabel,
              ]}
            >
              {freq.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  optionCard: {
    width: (width - 100) / 2,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    margin: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionCard: {
    backgroundColor: colorsTheme.primary,
    borderColor: colorsTheme.primary,
  },
  errorBorder: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedOptionIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectedOptionLabel: {
    color: "white",
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 5,
  },
});


