import { Colors } from '@/constants/theme';
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: typeof Colors.light;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    React.useEffect(() => {
        async function loadTheme() {
            try {
                const { getThemeMode } = await import('@/utils/storage');
                const savedMode = await getThemeMode();
                setModeState(savedMode);
            } catch (e) {
                console.error('Failed to load theme mode', e);
            } finally {
                setIsLoaded(true);
            }
        }
        loadTheme();
    }, []);

    const setMode = async (newMode: ThemeMode) => {
        try {
            const { setThemeMode } = await import('@/utils/storage');
            setModeState(newMode);
            await setThemeMode(newMode);
        } catch (e) {
            console.error('Failed to save theme mode', e);
        }
    };

    // If not loaded yet, use system default to avoid flash, or return null if strict
    // Returning children ensures app renders, might flash briefly if saved is different from system
    const effectiveMode = isLoaded ? mode : 'system';

    const isDark = effectiveMode === 'system' ? systemColorScheme === 'dark' : effectiveMode === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;

    return (
        <ThemeContext.Provider value={{ theme, mode: effectiveMode, setMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}