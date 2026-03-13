import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Card } from '../../components/Card';
import { Calendar, Clock, MapPin, ChevronRight, History } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function PastBookingsModal() {
    const { bookings, complexes, courts } = useData();
    const { user } = useAuth();

    const pastBookings = useMemo(() => {
        const now = new Date();
        // Filter to only show bookings that have already ended
        return bookings.filter(b => {
             const [day, month, year] = b.date.split('/').map(Number);
             const bookingEnd = new Date(year, month - 1, day);
             
             // Extract hour from endTime (e.g., "14:00")
             const endHour = parseInt(b.endTime?.split(':')[0] || '0', 10);
             bookingEnd.setHours(endHour || 0, 0, 0, 0);
             
             return bookingEnd <= now;
        }).sort((a, b) => {
            const dateA = a.date.split('/').reverse().join('') + a.startTime;
            const dateB = b.date.split('/').reverse().join('') + b.startTime;
            return dateB.localeCompare(dateA);
        });
    }, [bookings]);

    const renderBookingItem = ({ item }: { item: any }) => {
        let complexName = item.complexName;
        if (!complexName) {
            const court = courts.find(c => c.id === item.courtId);
            const complex = complexes.find(c => c.id === court?.complexId);
            complexName = complex?.name;
        }

        return (
            <Card style={styles.bookingCard} variant="outlined">
                <View style={styles.headerRow}>
                    <View style={styles.iconBox}>
                        <History size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.titleInfo}>
                        <Text style={styles.hubName}>{complexName || 'Sports Hub'}</Text>
                        <Text style={styles.courtName}>{item.courtName}</Text>
                    </View>
                    <View style={[styles.statusBadge, 
                        item.status === 'Completed' ? styles.statusCompleted : 
                        item.status === 'Cancelled' ? styles.statusCancelled : 
                        styles.statusConfirmed
                    ]}>
                        <Text style={[styles.statusText, 
                            item.status === 'Completed' ? styles.statusTextCompleted : 
                            item.status === 'Cancelled' ? styles.statusTextCancelled : 
                            styles.statusTextConfirmed
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Calendar size={14} color={Colors.muted} />
                        <Text style={styles.detailText}>{item.date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Clock size={14} color={Colors.muted} />
                        <Text style={styles.detailText}>{item.startTime}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.priceText}>₹{item.price}</Text>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Booking History' }} />
            <FlatList
                data={pastBookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <History size={64} color={Colors.border} />
                        <Text style={styles.emptyTitle}>No Past Bookings</Text>
                        <Text style={styles.emptySubtitle}>Your completed games and past sessions will appear here.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        padding: Spacing.lg,
    },
    bookingCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleInfo: {
        flex: 1,
    },
    hubName: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    courtName: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusConfirmed: {
        backgroundColor: '#DCFCE7',
    },
    statusCompleted: {
        backgroundColor: Colors.border,
    },
    statusCancelled: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: Typography.weight.bold,
        textTransform: 'uppercase',
    },
    statusTextConfirmed: {
        color: Colors.success,
    },
    statusTextCompleted: {
        color: Colors.secondary,
    },
    statusTextCancelled: {
        color: Colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
    },
    priceText: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: Spacing.xxl,
    },
    emptyTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginTop: Spacing.lg,
    },
    emptySubtitle: {
        fontSize: Typography.size.md,
        color: Colors.muted,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});
