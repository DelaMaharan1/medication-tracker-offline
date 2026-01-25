import { colorsTheme } from '@/constants/theme'
import { Medication } from '@/utils/ttype'
import React, { useEffect, useRef } from 'react'
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const { width } = Dimensions.get("window")
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface CircularProgressProps {
    medicine: Medication[]
    progress: number // 0 to 1
    completedDoses?: number
}

export function CircularProgressSection({
    medicine,
    progress = 0,
    completedDoses = 0
}: CircularProgressProps) {
    const animatedValue = useRef(new Animated.Value(0)).current
    const size = width * 0.45
    const strokeWidth = 15
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: true,
        }).start()
    }, [progress])

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    })

    // Calculate stats
    const totalMeds = medicine.length
    // Assuming each med has 'times' array for daily frequency
    const totalDoses = medicine.reduce((acc, med) => acc + (med.times?.length || 0), 0)

    return (
        <View style={styles.container}>
            <View style={[styles.progressContainer, { width: size, height: size }]}>
                <Svg width={size} height={size}>
                    {/* Background Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#E0E0E0"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colorsTheme.primary}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>

                <View style={styles.statsContainer}>
                    <Text style={styles.percentage}>
                        {Math.round(Math.min(1, progress) * 100)}%
                    </Text>
                    <Text style={styles.label}>Completed</Text>
                </View>
            </View>

            <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoValue}>{Math.max(0, totalDoses)}</Text>
                    <Text style={styles.infoLabel}>Total Doses</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.infoItem}>
                    <Text style={styles.infoValue}>{Math.max(0, completedDoses)}</Text>
                    <Text style={styles.infoLabel}>Taken</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.infoItem}>
                    <Text style={styles.infoValue}>{Math.max(0, totalDoses - completedDoses)}</Text>
                    <Text style={styles.infoLabel}>Pending</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginHorizontal: 4,
    },
    progressContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    statsContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentage: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colorsTheme.primary,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    infoGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'space-around',
    },
    infoItem: {
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    separator: {
        width: 1,
        height: 30,
        backgroundColor: '#E0E0E0',
    },
})