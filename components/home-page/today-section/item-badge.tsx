import { takenStatus } from '@/utils/ttype'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface ItemBadgeProps {
    status?: takenStatus
}

export function ItemBadge({ status = 'take' }: ItemBadgeProps) {
    const getBadgeStyle = () => {
        switch (status) {
            case 'taken':
                return {
                    container: styles.takenContainer,
                    text: styles.takenText,
                    icon: 'checkmark-circle' as const,
                    label: 'Taken'
                }
            case 'missed':
                return {
                    container: styles.missedContainer,
                    text: styles.missedText,
                    icon: 'alert-circle' as const,
                    label: 'Missed'
                }
            case 'take':
            default:
                return {
                    container: styles.takeContainer,
                    text: styles.takeText,
                    icon: 'time' as const,
                    label: 'Take'
                }
        }
    }

    const style = getBadgeStyle()

    return (
        <View style={[styles.container, style.container]}>
            <Ionicons name={style.icon} size={16} color={style.text.color} />
            <Text style={[styles.text, style.text]}>{style.label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4
    },
    text: {
        fontSize: 12,
        fontWeight: '600'
    },
    takenContainer: {
        backgroundColor: '#E8F5E9'
    },
    takenText: {
        color: '#2E7D32'
    },
    missedContainer: {
        backgroundColor: '#FFEBEE'
    },
    missedText: {
        color: '#C62828'
    },
    takeContainer: {
        backgroundColor: '#E3F2FD'
    },
    takeText: {
        color: '#1565C0'
    }
})