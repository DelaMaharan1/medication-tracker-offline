import { colorsTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    isAddMode: boolean;
    handleSubmit: () => void;
    handleDelete?: () => void;
    onCancel: () => void;
}

export default function FormActions({ isAddMode, handleSubmit, handleDelete, onCancel }: Props) {
    return (
        <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colorsTheme.primary, colorsTheme.secondary]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.submitText}>
                        {isAddMode ? 'Add Medicine' : 'Save Changes'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            {!isAddMode && handleDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <Text style={styles.deleteText}>Delete Medicine</Text>
                </TouchableOpacity>
            )}

            {isAddMode && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.7}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomButtonsContainer: {
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    submitButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: colorsTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
        backgroundColor: '#FFF5F5',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    deleteText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
});
