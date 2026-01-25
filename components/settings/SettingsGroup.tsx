import { useTheme } from '@/context/theme-context';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SettingsGroupProps {
    title: string;
    children: React.ReactNode;
}

export const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: theme.icon }]}>{title}</Text>
            <View style={[styles.group, { backgroundColor: theme.background }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    group: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
});
