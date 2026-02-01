import { colorsTheme } from '@/constants/theme';
import { useMedication } from '@/context/medicine';
import { useTheme } from '@/context/theme-context';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Surface, Text, TextInput } from 'react-native-paper';

export default function EditProfileScreen() {
    const auth = getAuth();
    const user = auth.currentUser;
    const router = useRouter();
    const { clearAllData } = useMedication();
    const { theme, isDark } = useTheme();

    const {
        displayName,
        setDisplayName,
        loading,
        handleUpdateProfile,
        handleDeleteAccount
    } = useProfileManagement(user, auth, clearAllData);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? theme.background : '#F8F9FA' }]}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={[colorsTheme.primary, isDark ? '#5C1D1D' : '#FF6B6B']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.customHeader}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>Edit Profile</Text>
                            <Text style={styles.subtitle}>Manage your account information</Text>
                        </View>
                    </View>

                    {/* Form Card */}
                    <Surface style={[styles.card, { backgroundColor: isDark ? theme.card : '#FFF' }]} elevation={1}>
                        <View style={styles.form}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Public Name</Text>
                            <TextInput
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoCapitalize="words"
                                mode="outlined"
                                placeholder="Enter your name"
                                style={[styles.input, { backgroundColor: isDark ? theme.card : 'white' }]}
                                outlineStyle={{ borderRadius: 12 }}
                                outlineColor={isDark ? '#444' : '#E5E7EB'}
                                textColor={theme.text}
                                activeOutlineColor={colorsTheme.primary}
                                left={<TextInput.Icon icon="account" color={colorsTheme.primary} />}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
                            <TextInput
                                value={user?.email || ''}
                                editable={false}
                                mode="outlined"
                                style={[styles.input, styles.disabledInput, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }]}
                                outlineStyle={{ borderRadius: 12 }}
                                outlineColor="transparent"
                                textColor={isDark ? '#666' : '#999'}
                                left={<TextInput.Icon icon="email" color={isDark ? '#444' : '#CCC'} />}
                            />

                            <Button
                                mode="contained"
                                onPress={handleUpdateProfile}
                                loading={loading}
                                disabled={loading}
                                style={styles.saveButton}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                buttonColor={colorsTheme.primary}
                            >
                                Save Changes
                            </Button>
                        </View>
                    </Surface>

                    {/* Danger Zone */}
                    <View style={styles.dangerSection}>
                        <TouchableOpacity
                            style={[styles.dangerCard, { backgroundColor: isDark ? '#2D1A1A' : '#FFF5F5', borderColor: isDark ? '#4A2A2A' : '#FED7D7' }]}
                            onPress={handleDeleteAccount}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dangerIconContainer}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="#EF4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.deleteTitle}>Delete Account</Text>
                                <Text style={styles.deleteSubtitle}>Permanently remove all your data</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === "ios" ? 300 : 280,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    customHeader: {
        marginBottom: 25,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTextContainer: {
        marginTop: 5,
    },
    title: {
        fontWeight: '800',
        fontSize: 34,
        color: '#fff',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    form: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        opacity: 0.7
    },
    input: {
        marginBottom: 16,
        fontSize: 16,
    },
    disabledInput: {
        opacity: 0.8,
    },
    saveButton: {
        marginTop: 10,
        borderRadius: 14,
        elevation: 0,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'none',
    },
    dangerSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EF4444',
        marginBottom: 12,
        marginLeft: 4,
    },
    dangerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    dangerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deleteTitle: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '700',
    },
    deleteSubtitle: {
        color: '#EF4444',
        fontSize: 12,
        opacity: 0.7,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});


