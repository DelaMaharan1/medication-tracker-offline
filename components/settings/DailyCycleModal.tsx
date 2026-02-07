import { colorsTheme } from '@/constants/theme';
import { getUser, saveUser } from '@/utils/storage';
import { User as AppUser } from '@/utils/ttype';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';

interface Props {
    visible: boolean;
    onClose: () => void;
    theme: any;
    isDark: boolean;
}

export const DailyCycleModal = ({ visible, onClose, theme, isDark }: Props) => {
    const [wakeTime, setWakeTime] = useState('07:00');
    const [sleepTime, setSleepTime] = useState('22:00');
    const [loading, setLoading] = useState(false);
    const [showWakePicker, setShowWakePicker] = useState(false);
    const [showSleepPicker, setShowSleepPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        setLoading(true);
        const user = await getUser();
        if (user) {
            if (user.wakeTime) setWakeTime(user.wakeTime);
            if (user.sleepTime) setSleepTime(user.sleepTime);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const currentUser = await getUser();
            const updatedUser: AppUser = {
                ...(currentUser || { username: 'Guest' }),
                wakeTime,
                sleepTime,
                dailyCycle: true,
            };
            await saveUser(updatedUser);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const stringToDate = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours || 7);
        date.setMinutes(minutes || 0);
        return date;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const onWakeChange = (event: any, selectedDate?: Date) => {
        setShowWakePicker(false);
        if (selectedDate) setWakeTime(formatTime(selectedDate));
    };

    const onSleepChange = (event: any, selectedDate?: Date) => {
        setShowSleepPicker(false);
        if (selectedDate) setSleepTime(formatTime(selectedDate));
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: theme.card }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Daily Cycle</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.description, { color: isDark ? '#AAA' : '#666' }]}>
                        Set your typical wake and sleep times to improve medication scheduling suggestions.
                    </Text>

                    {/* Wake Time */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Wake Up Time</Text>
                        <TouchableOpacity
                            style={[
                                styles.inputBox,
                                {
                                    backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA',
                                    borderColor: isDark ? '#333' : '#E9ECEF'
                                }
                            ]}
                            onPress={() => setShowWakePicker(true)}
                        >
                            <Ionicons name="sunny-outline" size={20} color={colorsTheme.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.inputText, { color: theme.text }]}>{wakeTime}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sleep Time */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Bed Time</Text>
                        <TouchableOpacity
                            style={[
                                styles.inputBox,
                                {
                                    backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA',
                                    borderColor: isDark ? '#333' : '#E9ECEF'
                                }
                            ]}
                            onPress={() => setShowSleepPicker(true)}
                        >
                            <Ionicons name="moon-outline" size={20} color={colorsTheme.primary} style={{ marginRight: 10 }} />
                            <Text style={[styles.inputText, { color: theme.text }]}>{sleepTime}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Picker Logic */}
                    {showWakePicker && (
                        <DateTimePicker
                            value={stringToDate(wakeTime)}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onWakeChange}
                        />
                    )}
                    {showSleepPicker && (
                        <DateTimePicker
                            value={stringToDate(sleepTime)}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onSleepChange}
                        />
                    )}

                    {/* Footer */}
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                        buttonColor={colorsTheme.primary}
                        labelStyle={{ fontWeight: 'bold' }}
                    >
                        Save Settings
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(246, 241, 241, 0.2)',
        padding: 20
    },
    modalView: {
        width: '100%',
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5
    },
    description: {
        fontSize: 14,
        marginBottom: 25,
        lineHeight: 20
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
    },
    inputText: {
        fontSize: 16,
        fontWeight: '500'
    },
    saveButton: {
        marginTop: 10,
        borderRadius: 12,
        paddingVertical: 6
    }
});
