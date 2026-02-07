import { colorsTheme } from '@/constants/theme';
import React, { createContext, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarContextType {
    showSnackbar: (message: string, type?: SnackbarType, action?: { label: string, onPress?: () => void }) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<SnackbarType>('info');
    const [action, setAction] = useState<{ label: string, onPress?: () => void } | undefined>(undefined);

    const showSnackbar = (msg: string, snackType: SnackbarType = 'info', snackAction?: { label: string, onPress?: () => void }) => {
        setMessage(msg);
        setType(snackType);
        setAction(snackAction);
        setVisible(true);
    };

    const onDismiss = () => setVisible(false);

    const getBackgroundColor = () => {
        return colorsTheme.primary;
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <View style={styles.snackbarWrapper}>
                <Snackbar
                    visible={visible}
                    onDismiss={onDismiss}
                    duration={3000}
                    style={{ backgroundColor: getBackgroundColor(), borderRadius: 8, margin: 16 }}
                    action={{
                        label: action?.label || 'Close',
                        onPress: () => {
                            if (action?.onPress) action.onPress();
                            setVisible(false);
                        },
                        textColor: 'white'
                    }}
                >
                    {message}
                </Snackbar>
            </View>
        </SnackbarContext.Provider>
    );
}

const styles = StyleSheet.create({
    snackbarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    }
});



