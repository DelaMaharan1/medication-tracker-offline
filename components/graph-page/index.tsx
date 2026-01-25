import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GraphContent } from './graph-content';
import { HeaderSection } from './header-section';
import { useGraphData } from './hooks/use-graph-data';

/**
 * Main Graph Page Container
 * Displays medication adherence statistics and visualizations
 */
export function GraphPage() {
    const { period, setPeriod, graphData, stats, historyData, loading, dateRange } = useGraphData();
    const { theme, isDark } = useTheme();

    return (
        <View style={[styles.mainContainer, { backgroundColor: isDark ? theme.background : '#F2F2F7' }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header with gradient background */}
                <View style={[styles.headerWrapper, { backgroundColor: isDark ? theme.background : '#fff' }]}>
                    <LinearGradient
                        colors={[colorsTheme.primary, isDark ? '#822F2F' : colorsTheme.secondary]}
                        style={styles.gradient}
                    >
                        <HeaderSection period={period} onPeriodChange={setPeriod} />
                    </LinearGradient>
                </View>

                {/* Main content */}
                <GraphContent
                    graphData={graphData}
                    stats={stats}
                    historyData={historyData}
                    period={period}
                    loading={loading}
                    dateRange={dateRange}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerWrapper: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginBottom: 0,
        elevation: 4,
        zIndex: 10,
    },
    gradient: {
        width: '100%',
    },
});
