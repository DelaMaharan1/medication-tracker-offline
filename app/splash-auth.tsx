import { colorsTheme } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MaterialIcons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function SplashAuthScreen() {
    const { isDark, theme } = useTheme();
    const router = useRouter()
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.contentContainer}>
                {/* Gradient Icon */}
                <View style={styles.iconWrapper}>
                    <MaskedView
                        style={styles.maskContainer}
                        maskElement={
                            <View style={styles.centerMask}>
                                <MaterialIcons
                                    name="medication"
                                    size={100}
                                    color={isDark ? '#fff' : '#000'}
                                />
                            </View>
                        }>
                        <LinearGradient
                            colors={[colorsTheme.primary, isDark ? '#A03030' : colorsTheme.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientFill}
                        />
                    </MaskedView>
                </View>

                {/* Gradient Text */}
                <MaskedView
                    style={styles.textMaskContainer}
                    maskElement={
                        <View style={styles.centerMask}>
                            <Text style={styles.appName}>
                                MediTrack
                            </Text>
                        </View>
                    }>
                    <LinearGradient
                        colors={[colorsTheme.primary, isDark ? '#A03030' : colorsTheme.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientFill}
                    />
                </MaskedView>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.primaryText}
                    onPress={() => router.push('/(auth)/sign-in')}
                >
                    Sign In
                </Button>

                <Button
                    mode="outlined"
                    style={styles.secondaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.secondaryText}
                    onPress={async () => {
                        try {
                            const { setGuestMode } = await import('@/utils/storage');
                            await setGuestMode(true);
                            router.push('/(tabs)/home');
                        } catch (e) {
                            console.error(e);
                            router.push('/(tabs)/home');
                        }
                    }}
                >
                    Enter as Guest
                </Button>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: -40, // Visual centering adjustment
    },
    maskContainer: {
        width: 100,
        height: 100,
    },
    textMaskContainer: {
        width: '100%',
        height: 60,
        marginTop: 16,
    },
    centerMask: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    iconWrapper: {
        width: 100,
        height: 100,
        marginBottom: 10,
        elevation: 5,
        shadowColor: colorsTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    appName: {
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.8,
    },
    gradientFill: {
        flex: 1,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    buttonContent: {
        height: 56,
    },
    primaryButton: {
        borderRadius: 16,
        backgroundColor: colorsTheme.primary,
        elevation: 4,
        shadowColor: colorsTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryText: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: '#fff',
    },
    secondaryButton: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colorsTheme.primary,
        backgroundColor: 'transparent',
    },
    secondaryText: {
        fontSize: 18,
        fontWeight: '700',
        color: colorsTheme.primary,
    },
})