import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Card } from '../../components/Card';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Info } from 'lucide-react-native';
import { Button } from '../../components/Button';

const { width } = Dimensions.get('window');

export default function BookingModal() {
    const router = useRouter();
    const { courtId } = useLocalSearchParams();
    const { user } = useAuth();
    const { courts, availabilityBookings, addBooking, loading } = useData();

    const court = useMemo(() => courts.find(c => c.id === courtId), [courts, courtId]);

    // Generate next 7 days for selection
    const dates = useMemo(() => {
        const d = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            d.push({
                full: date.toLocaleDateString('en-GB'), // DD/MM/YYYY
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                month: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return d;
    }, []);

    const [selectedDate, setSelectedDate] = useState(dates[0].full);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    // Filter slots based on manager definition AND existing bookings
    // Filter slots based on manager definition AND existing bookings
    const availableSlots = useMemo(() => {
        if (!court) return [];

        // 1. Get slots defined by manager for this court
        // NO FALLBACK - only show what manager defined
        const managerSlots = court.slots || [];

        if (managerSlots.length === 0) {
            console.log("Booking: No slots defined by manager for this court", court.id);
            return [];
        }

        // 2. Get existing bookings for this court on the selected date
        const existingBookings = availabilityBookings.filter(b =>
            b.courtId === courtId &&
            b.date === selectedDate &&
            (b.status === 'Confirmed' || b.status === 'Pending')
        );

        console.log(`Booking: Checked ${selectedDate}, found ${existingBookings.length} confirmed/pending bookings`);

        // 3. Mark slots as occupied if they exist in bookings
        return managerSlots.map(slot => {
            const isBooked = existingBookings.some(b => {
                const bookingTime = b.startTime;
                const slotTime1 = `${slot.hour}:00`;
                const slotTime2 = `${slot.hour.toString().padStart(2, '0')}:00`;
                return bookingTime === slotTime1 || bookingTime === slotTime2;
            });
            return {
                ...slot,
                isBooked
            };
        }).sort((a, b) => a.hour - b.hour);
    }, [court, selectedDate, availabilityBookings, courtId]);

    const handleConfirmBooking = async () => {
        if (!user || !court || selectedSlot === null) return;

        try {
            const slotHour = selectedSlot;
            const startTime = `${slotHour}:00`;
            const endTime = `${slotHour + 1}:00`;

            await addBooking({
                courtId: court.id,
                courtName: court.name,
                customerId: user.uid,
                customerName: user.displayName || 'Guest',
                managerId: court.managerId,
                startTime,
                endTime,
                date: selectedDate,
                price: court.price,
            } as any);

            Alert.alert(
                'Success!',
                `Your booking for ${court.name} at ${startTime} on ${selectedDate} is confirmed.`,
                [{ text: 'Great!', onPress: () => router.push('/(tabs)') }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        }
    };

    if (!court) return null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Select Date & Time', headerShown: true }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Date Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Choose Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                        {dates.map((item) => (
                            <TouchableOpacity
                                key={item.full}
                                style={[styles.dateCard, selectedDate === item.full && styles.selectedDateCard]}
                                onPress={() => {
                                    setSelectedDate(item.full);
                                    setSelectedSlot(null);
                                }}
                            >
                                <Text style={[styles.dateDay, selectedDate === item.full && styles.selectedDateText]}>{item.day}</Text>
                                <Text style={[styles.dateNumber, selectedDate === item.full && styles.selectedDateText]}>{item.date}</Text>
                                <Text style={[styles.dateMonth, selectedDate === item.full && styles.selectedDateTextSmall]}>{item.month}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 2. Slot Selector */}
                <View style={styles.section}>
                    <View style={styles.titleRow}>
                        <Text style={styles.sectionTitle}>2. Select Available Slot</Text>
                        <View style={styles.legend}>
                            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                            <Text style={styles.legendText}>Selected</Text>
                        </View>
                    </View>

                    {availableSlots.length > 0 ? (
                        <View style={styles.slotGrid}>
                            {availableSlots.map((slot) => {
                                const isSelected = selectedSlot === slot.hour;
                                const isOccupied = slot.isBooked;

                                return (
                                    <TouchableOpacity
                                        key={slot.hour}
                                        disabled={isOccupied}
                                        style={[
                                            styles.slotButton,
                                            isSelected && styles.selectedSlotButton,
                                            isOccupied && styles.occupiedSlotButton
                                        ]}
                                        onPress={() => setSelectedSlot(slot.hour)}
                                    >
                                        <Text style={[
                                            styles.slotText,
                                            isSelected && styles.selectedSlotText,
                                            isOccupied && styles.occupiedSlotText
                                        ]}>
                                            {slot.hour.toString().padStart(2, '0')}:00
                                        </Text>
                                        {isOccupied && <Text style={styles.occupiedLabel}>Booked</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <Card style={styles.noSlotsCard} variant="outlined">
                            <Info size={24} color={Colors.warning} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.noSlotsTitle}>No slots available for this date.</Text>
                                <Text style={styles.noSlotsText}>
                                    The manager hasn't defined any open timings for this court yet.
                                    (Hint: Add a new court and use the "Define Slots" option).
                                </Text>
                            </View>
                        </Card>
                    )}
                </View>

                {/* 3. Summary */}
                {selectedSlot !== null && (
                    <Card style={styles.summaryCard} variant="elevated">
                        <View style={styles.summaryHeader}>
                            <CheckCircle2 size={24} color={Colors.success} />
                            <Text style={styles.summaryTitle}>Booking Summary</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Court:</Text>
                            <Text style={styles.summaryValue}>{court.name}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Date:</Text>
                            <Text style={styles.summaryValue}>{selectedDate}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Time:</Text>
                            <Text style={styles.summaryValue}>{selectedSlot}:00 - {selectedSlot + 1}:00</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Price</Text>
                            <Text style={styles.totalValue}>₹{court.price}</Text>
                        </View>

                        <Button
                            title="Confirm & Book"
                            onPress={handleConfirmBooking}
                            style={styles.confirmButton}
                        />
                    </Card>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: Spacing.md,
    },
    dateList: {
        paddingRight: Spacing.lg,
    },
    dateCard: {
        width: 70,
        height: 90,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    selectedDateCard: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dateDay: {
        fontSize: 10,
        color: Colors.muted,
        textTransform: 'uppercase',
        fontWeight: Typography.weight.bold,
    },
    dateNumber: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginVertical: 2,
    },
    dateMonth: {
        fontSize: 10,
        color: Colors.muted,
        fontWeight: Typography.weight.medium,
    },
    selectedDateText: {
        color: Colors.surface,
    },
    selectedDateTextSmall: {
        color: Colors.surface + 'CC',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 10,
        color: Colors.muted,
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    slotButton: {
        width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
        height: 50,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedSlotButton: {
        backgroundColor: Colors.primary + '15',
        borderColor: Colors.primary,
    },
    occupiedSlotButton: {
        backgroundColor: Colors.secondary + '05',
        borderColor: Colors.border,
        opacity: 0.6,
    },
    slotText: {
        fontSize: 14,
        fontWeight: Typography.weight.semiBold,
        color: Colors.secondary,
    },
    selectedSlotText: {
        color: Colors.primary,
    },
    occupiedSlotText: {
        color: Colors.muted,
        textDecorationLine: 'line-through',
    },
    occupiedLabel: {
        fontSize: 8,
        color: Colors.danger,
        fontWeight: Typography.weight.bold,
        marginTop: 2,
    },
    noSlotsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
    },
    noSlotsTitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: 4,
    },
    noSlotsText: {
        fontSize: Typography.size.xs,
        color: Colors.muted,
        lineHeight: 18,
    },
    summaryCard: {
        margin: Spacing.lg,
        padding: Spacing.xl,
        marginTop: 0,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    summaryTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        color: Colors.muted,
        fontSize: 14,
    },
    summaryValue: {
        color: Colors.secondary,
        fontWeight: Typography.weight.semiBold,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.lg,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    totalLabel: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    totalValue: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.primary,
    },
    confirmButton: {
        width: '100%',
    }
});
