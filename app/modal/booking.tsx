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
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Info, Wrench, User as UserIcon, Plus } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const { width } = Dimensions.get('window');

export default function BookingModal() {
    const router = useRouter();
    const { courtId } = useLocalSearchParams();
    const { user, role } = useAuth();
    const isManager = role === 'manager';
    const { courts, complexes, availabilityBookings, addBooking, loading } = useData();

    const court = useMemo(() => courts.find(c => c.id === courtId), [courts, courtId]);
    const complex = useMemo(() => complexes.find(c => c.id === court?.complexId), [complexes, court]);

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
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [bookingType, setBookingType] = useState<'customer' | 'manager_behalf' | 'maintenance'>(isManager ? 'manager_behalf' : 'customer');
    const [guestName, setGuestName] = useState('');

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

        // 3. Mark slots as occupied or past
        const now = new Date();
        const currentHour = now.getHours();
        
        const [todayDay, todayMonth, todayYear] = [now.getDate(), now.getMonth(), now.getFullYear()];
        const [selDay, selMonth, selYear] = selectedDate.split('/').map(Number);
        
        const isSelectedDateToday = selDay === todayDay && 
                                  (selMonth - 1) === todayMonth && 
                                  selYear === todayYear;

        return managerSlots.map(slot => {
            const isBooked = existingBookings.some(b => {
                const bookingTime = b.startTime;
                const slotTime1 = `${slot.hour}:00`;
                const slotTime2 = `${slot.hour.toString().padStart(2, '0')}:00`;
                return bookingTime === slotTime1 || bookingTime === slotTime2;
            });

            // Slot is in past if date is today and hour is <= current hour
            const isPast = isSelectedDateToday && slot.hour <= currentHour;

            return {
                ...slot,
                isBooked,
                isPast
            };
        }).sort((a, b) => a.hour - b.hour);
    }, [court, selectedDate, availabilityBookings, courtId]);

    const handleConfirmBooking = async () => {
        if (!user || !court || selectedSlots.length === 0) return;

        // Final safety check: ensure none of the selected slots are already booked
        const alreadyBooked = selectedSlots.some(hour => 
            availableSlots.find(s => s.hour === hour)?.isBooked
        );
        
        if (alreadyBooked) {
            Alert.alert('Error', 'One or more selected slots are already booked. Please refresh and try again.');
            return;
        }

        try {
            // Book each selected slot
            for (const slotHour of selectedSlots) {
                const startTime = `${slotHour}:00`;
                const endTime = `${slotHour + 1}:00`;

                await addBooking({
                    courtId: court.id,
                    courtName: court.name,
                    complexId: complex?.id,
                    complexName: complex?.name,
                    customerId: bookingType === 'maintenance' ? 'maintenance' : user.uid,
                    customerName: bookingType === 'customer' 
                        ? (user.displayName || 'Guest')
                        : (guestName || (bookingType === 'maintenance' ? 'Maintenance Block' : 'Walk-in Customer')),
                    managerId: court.managerId,
                    startTime,
                    endTime,
                    date: selectedDate,
                    price: bookingType === 'maintenance' ? 0 : court.price,
                    status: 'Confirmed',
                    bookingType: bookingType
                } as any);
            }

            Alert.alert(
                'Success!',
                bookingType === 'maintenance' 
                    ? `Court ${court.name} is now blocked for the selected slots.`
                    : `${selectedSlots.length} booking(s) confirmed for ${court.name} on ${selectedDate}.`,
                [{ text: 'Great!', onPress: () => router.push('/(tabs)') }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        }
    };

    const toggleSlot = (hour: number) => {
        setSelectedSlots(prev => 
            prev.includes(hour) 
                ? prev.filter(h => h !== hour) 
                : [...prev, hour].sort((a, b) => a - b)
        );
    };

    if (!court) return null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Select Date & Time', headerShown: true }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Manager Options */}
                {isManager && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manager Controls</Text>
                        <View style={styles.optionsRow}>
                            <TouchableOpacity 
                                style={[styles.optionBtn, bookingType === 'manager_behalf' && styles.activeOptionBtn]}
                                onPress={() => setBookingType('manager_behalf')}
                            >
                                <Plus size={18} color={bookingType === 'manager_behalf' ? Colors.surface : Colors.muted} />
                                <Text style={[styles.optionBtnText, bookingType === 'manager_behalf' && styles.activeOptionBtnText]}>On Behalf</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.optionBtn, bookingType === 'maintenance' && styles.activeOptionBtn]}
                                onPress={() => setBookingType('maintenance')}
                            >
                                <Wrench size={18} color={bookingType === 'maintenance' ? Colors.surface : Colors.muted} />
                                <Text style={[styles.optionBtnText, bookingType === 'maintenance' && styles.activeOptionBtnText]}>Maintenance</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.optionBtn, bookingType === 'customer' && styles.activeOptionBtn]}
                                onPress={() => setBookingType('customer')}
                            >
                                <UserIcon size={18} color={bookingType === 'customer' ? Colors.surface : Colors.muted} />
                                <Text style={[styles.optionBtnText, bookingType === 'customer' && styles.activeOptionBtnText]}>Own Booking</Text>
                            </TouchableOpacity>
                        </View>

                        {bookingType === 'manager_behalf' && (
                            <View style={{ marginTop: Spacing.md }}>
                                <Input 
                                    label="Customer Name"
                                    placeholder="Enter client name"
                                    value={guestName}
                                    onChangeText={setGuestName}
                                />
                            </View>
                        )}
                        
                        {bookingType === 'maintenance' && (
                            <View style={{ marginTop: Spacing.md }}>
                                <Input 
                                    label="Reason / Details"
                                    placeholder="e.g., Cleaning, Repairing light"
                                    value={guestName}
                                    onChangeText={setGuestName}
                                />
                            </View>
                        )}
                        
                        {bookingType === 'maintenance' && !guestName && (
                            <Text style={styles.maintenanceInfo}>
                                This will block the slot for players and set the price to ₹0.
                            </Text>
                        )}
                    </View>
                )}

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
                                    setSelectedSlots([]);
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
                            <View style={[styles.dot, { backgroundColor: Colors.error, marginLeft: 8 }]} />
                            <Text style={styles.legendText}>Occupied</Text>
                        </View>
                    </View>

                    {availableSlots.length > 0 ? (
                        <View style={styles.slotGrid}>
                            {availableSlots.map((slot) => {
                                const isSelected = selectedSlots.includes(slot.hour);
                                const isOccupied = slot.isBooked;
                                const isPast = slot.isPast;
                                const isDisabled = isOccupied || isPast;

                                return (
                                    <TouchableOpacity
                                        key={slot.hour}
                                        disabled={isDisabled}
                                        style={[
                                            styles.slotButton,
                                            isSelected && styles.selectedSlotButton,
                                            isOccupied && styles.occupiedSlotButton,
                                            isPast && !isOccupied && styles.pastSlotButton
                                        ]}
                                        onPress={() => toggleSlot(slot.hour)}
                                    >
                                        <Text style={[
                                            styles.slotText,
                                            isSelected && styles.selectedSlotText,
                                            isOccupied && styles.occupiedSlotText,
                                            isPast && !isOccupied && styles.pastSlotText
                                        ]}>
                                            {slot.hour.toString().padStart(2, '0')}:00
                                        </Text>
                                        {isOccupied && <Text style={styles.occupiedLabel}>Booked</Text>}
                                        {isPast && !isOccupied && <Text style={styles.pastLabel}>Past</Text>}
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
                {selectedSlots.length > 0 && (
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
                            <Text style={styles.summaryLabel}>Slots:</Text>
                            <Text style={styles.summaryValue}>
                                {selectedSlots.length} slot(s) selected
                            </Text>
                        </View>
                        <View style={styles.selectedSlotsContainer}>
                            {selectedSlots.map(s => (
                                <View key={s} style={styles.slotBadge}>
                                    <Text style={styles.slotBadgeText}>{s}:00</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Price</Text>
                            <Text style={styles.totalValue}>₹{bookingType === 'maintenance' ? 0 : (court.price * selectedSlots.length)}</Text>
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
        backgroundColor: Colors.error + '10',
        borderColor: Colors.error,
        opacity: 0.9,
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
        color: Colors.error,
        textDecorationLine: 'none',
    },
    occupiedLabel: {
        fontSize: 8,
        color: Colors.error,
        fontWeight: Typography.weight.bold,
        marginTop: 2,
    },
    pastSlotButton: {
        backgroundColor: Colors.background,
        borderColor: Colors.border,
        opacity: 0.5,
    },
    pastSlotText: {
        color: Colors.muted,
    },
    pastLabel: {
        fontSize: 8,
        color: Colors.muted,
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
    },
    optionsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    optionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    activeOptionBtn: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    optionBtnText: {
        fontSize: 12,
        fontWeight: Typography.weight.bold,
        color: Colors.muted,
    },
    activeOptionBtnText: {
        color: Colors.surface,
    },
    maintenanceInfo: {
        fontSize: 12,
        color: Colors.warning,
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
    selectedSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
    },
    slotBadge: {
        backgroundColor: Colors.secondary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    slotBadgeText: {
        fontSize: 10,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    }
});
