import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
    type: 'switch' | 'arrow' | 'danger';
}

export const SettingRow = ({ icon, title, subtitle, value, onValueChange, onPress, type }: SettingRowProps) => {
    const { theme } = useTheme();

    // Optimistic UI for Switch
    const [localValue, setLocalValue] = useState(value);

    // Sync from props (external source of truth) when they finally update
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <TouchableOpacity
            style={[styles.row, { backgroundColor: theme.background }]}
            onPress={onPress}
            disabled={type === 'switch'}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, type === 'danger' && styles.dangerIconBg]}>
                <Ionicons
                    name={icon}
                    size={22}
                    color={type === 'danger' ? '#FF3B30' : colorsTheme.primary}
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.rowTitle, { color: theme.text }, type === 'danger' && styles.dangerText]}>{title}</Text>
                {subtitle && <Text style={[styles.rowSubtitle, { color: theme.icon }]}>{subtitle}</Text>}
            </View>

            {type === 'switch' && (
                <Switch
                    value={localValue}
                    onValueChange={(newValue) => {
                        setLocalValue(newValue); // Instant local update
                        if (onValueChange) onValueChange(newValue); // Async parent update
                    }}
                    trackColor={{ false: '#767577', true: colorsTheme.primary + '80' }}
                    thumbColor={localValue ? colorsTheme.primary : '#f4f3f4'}
                />
            )}

            {type === 'arrow' && (
                <Ionicons name="chevron-forward" size={20} color={theme.icon} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colorsTheme.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dangerIconBg: {
        backgroundColor: '#FF3B3015',
    },
    textContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    dangerText: {
        color: '#FF3B30',
    },
    rowSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
});



