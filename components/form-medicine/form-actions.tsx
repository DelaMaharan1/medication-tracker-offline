import { colorsTheme } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    isAddMode: boolean;
    handleSubmit: () => void;
    handleDelete?: () => void;
    onCancel: () => void;
}

// Static styles yang tidak bergantung pada theme
const staticStyles = StyleSheet.create({
    bottomButtonsContainer: {
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },
    submitButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    deleteButton: {
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
    },
    deleteText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default function FormActions({ isAddMode, handleSubmit, handleDelete, onCancel }: Props) {
    const { theme, isDark } = useTheme();

    return (
        <View style={[
            staticStyles.bottomButtonsContainer,
            {
                backgroundColor: theme.card,
                borderTopColor: isDark ? '#2D1A1A' : '#f0f0f0'
            }
        ]}>
            <TouchableOpacity
                style={[
                    staticStyles.submitButton,
                    {
                        shadowColor: colorsTheme.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isDark ? 0.5 : 0.3,
                        shadowRadius: isDark ? 10 : 8,
                        elevation: isDark ? 8 : 5,
                    }
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colorsTheme.primary, isDark ? '#822F2F' : colorsTheme.secondary]}
                    style={staticStyles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={staticStyles.submitText}>
                        {isAddMode ? 'Add Medicine' : 'Save Changes'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            {!isAddMode && handleDelete && (
                <TouchableOpacity
                    style={[
                        staticStyles.deleteButton,
                        {
                            backgroundColor: isDark ? '#2D1A1A' : '#FFF5F5',
                            borderColor: isDark ? colorsTheme.primary + '40' : '#FFE5E5'
                        }
                    ]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        staticStyles.deleteText,
                        { color: isDark ? colorsTheme.primary : '#FF3B30' }
                    ]}>
                        Delete Medicine
                    </Text>
                </TouchableOpacity>
            )}

            {isAddMode && (
                <TouchableOpacity
                    style={staticStyles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        staticStyles.cancelText,
                        { color: isDark ? '#999' : '#666' }
                    ]}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}


