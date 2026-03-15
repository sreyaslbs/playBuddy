import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth, useData } from '@playbuddy/shared';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Card, Button } from '@playbuddy/ui';
import { Calendar, Clock, Plus, Users, MapPin, Trophy, Building2, Heart, Navigation, Bell, TrendingUp, CalendarRange } from 'lucide-react-native';

export default function DashboardScreen() {
  const { role, user, metadata } = useAuth();
  const { bookings, courts, complexes } = useData();
  const router = useRouter();
  const isManager = role === 'manager';

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    
    // 1. Filter out past bookings and sort
    const active = bookings.filter(b => {
      const [day, month, year] = b.date.split('/').map(Number);
      const bookingEnd = new Date(year, month - 1, day);
      const endHour = parseInt(b.endTime?.split(':')[0] || '0', 10);
      bookingEnd.setHours(endHour || 0, 0, 0, 0);
      return bookingEnd > now;
    }).sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('') + a.courtId + a.startTime.padStart(5, '0');
        const dateB = b.date.split('/').reverse().join('') + b.courtId + b.startTime.padStart(5, '0');
        return dateA.localeCompare(dateB);
    });

    // 2. Group consecutive bookings
    const grouped: any[] = [];
    active.forEach(booking => {
        if (grouped.length === 0) {
            grouped.push({ ...booking });
            return;
        }

        const last = grouped[grouped.length - 1];
        const isConsecutive = last.date === booking.date && 
                             last.courtId === booking.courtId && 
                             last.endTime === booking.startTime &&
                             last.customerId === booking.customerId;

        if (isConsecutive) {
            last.endTime = booking.endTime;
            last.price = Number(last.price || 0) + Number(booking.price || 0);
            last.isGrouped = true;
            last.id = `${last.id}-${booking.id}`;
        } else {
            grouped.push({ ...booking });
        }
    });

    return grouped;
  }, [bookings]);

  const favoriteComplexes = useMemo(() => {
    if (!metadata?.favorites) return [];
    return complexes.filter(c => metadata.favorites?.includes(c.id));
  }, [complexes, metadata?.favorites]);

  const nextTodayBooking = useMemo(() => {
    const now = new Date();
    
    return upcomingBookings.find(b => {
        // Safer way to check if booking is today than toLocaleDateString
        const [day, month, year] = b.date.split('/').map(Number);
        const isToday = day === now.getDate() && 
                        (month - 1) === now.getMonth() && 
                        year === now.getFullYear();
        
        if (!isToday) return false;
        
        // Find the next one that hasn't started yet
        const startParts = b.startTime?.split(':') || [];
        const startHour = parseInt(startParts[0] || '0', 10);
        
        const bookingStart = new Date(year, month - 1, day);
        bookingStart.setHours(startHour, 0, 0, 0);
        
        return bookingStart > now;
    });
  }, [upcomingBookings]);

  const managerStats = useMemo(() => {
    if (!isManager) return null;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of week (Monday)
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let todayCount = 0;
    let weekCount = 0;
    let weekRevenue = 0;

    bookings.forEach(b => {
      const [d, m, y] = b.date.split('/').map(Number);
      const bookingDate = new Date(y, m - 1, d);
      
      if (bookingDate.getTime() === startOfToday.getTime()) {
        todayCount++;
      }
      
      if (bookingDate >= startOfWeek && bookingDate <= endOfWeek) {
        weekCount++;
        weekRevenue += Number(b.price || 0);
      }
    });

    return { todayCount, weekCount, weekRevenue };
  }, [bookings, isManager]);

  const renderBookingItem = ({ item }: { item: any }) => {
    // Lookup complex if not saved in booking
    let complexName = item.complexName;
    if (!complexName && complexes.length > 0) {
      const court = courts.find(c => c.id === item.courtId);
      const complex = complexes.find(c => c.id === court?.complexId);
      complexName = complex?.name;
    }

    return (
      <Card style={styles.bookingCard} key={item.id} variant="outlined">
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.courtName}>{complexName || 'Sports Hub'}</Text>
            <Text style={styles.customerName}>{item.courtName}</Text>
            {isManager && <Text style={[styles.customerName, { marginTop: 4, fontWeight: '500' }]}>Player: {item.customerName}</Text>}
          </View>
          <View style={[styles.statusBadge, item.status === 'Confirmed' ? styles.statusConfirmed : styles.statusPending]}>
            <Text style={[styles.statusText, item.status === 'Confirmed' ? styles.statusTextConfirmed : styles.statusTextPending]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <View style={styles.infoRow}>
            <Calendar size={14} color={Colors.muted} />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={14} color={Colors.muted} />
            <Text style={styles.infoText}>{item.startTime} - {item.endTime}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, {user?.displayName || 'Buddy'}!</Text>
        <Text style={styles.roleText}>{isManager ? 'Sports Complex Manager' : 'Ready to play today?'}</Text>
      </View>

      {nextTodayBooking && (
        <TouchableOpacity 
            style={styles.todayBanner}
            onPress={() => router.push(isManager ? '/(tabs)/index' : '/modal/past-bookings')}
        >
            <View style={styles.bannerIconBox}>
                <Bell size={20} color={Colors.surface} />
            </View>
            <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>
                  {isManager ? "Next Booking Today" : "Upcoming Today"}
                </Text>
                <Text style={styles.bannerMessage}>
                    {isManager 
                      ? `Next: ${nextTodayBooking.startTime}-${nextTodayBooking.endTime} for ${nextTodayBooking.courtName}`
                      : `You have a booking at ${nextTodayBooking.startTime}-${nextTodayBooking.endTime} for ${nextTodayBooking.courtName}`
                    }
                </Text>
            </View>
            <Clock size={20} color={Colors.surface} opacity={0.5} />
        </TouchableOpacity>
      )}

      {isManager ? (
        <>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Calendar size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{managerStats?.todayCount || 0}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </Card>
            <Card style={styles.statCard}>
              <Users size={24} color={Colors.accent} />
              <Text style={styles.statValue}>{managerStats?.weekCount || 0}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Card>
            <Card style={styles.statCard}>
              <TrendingUp size={24} color={Colors.success} />
              <Text style={styles.statValue}>₹{managerStats?.weekRevenue || 0}</Text>
              <Text style={styles.statLabel}>Revenue (Wk)</Text>
            </Card>
          </View>

          <View style={styles.quickReserveSection}>
            <Button 
                title="Reserve a Slot" 
                onPress={() => router.push('/modal/select-court')}
                variant="primary"
                icon={<CalendarRange size={20} color={Colors.surface} />}
                style={styles.reservePrimaryBtn}
            />
            <Text style={styles.reserveHint}>Book on behalf of a customer or block for maintenance</Text>
          </View>
        </>
      ) : (
        <View style={styles.statsRow}>
          <Card style={styles.statCard} onPress={() => router.push('/(tabs)/book')}>
            <MapPin size={24} color={Colors.primary} />
            <Text style={styles.statValue} numberOfLines={1}>
              {metadata?.defaultCity || 'Set Location'}
            </Text>
            <Text style={styles.statLabel}>Current City</Text>
          </Card>
          <Card style={styles.statCard}>
            <Trophy size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </Card>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isManager ? 'Upcoming Bookings' : 'Your Bookings'}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {upcomingBookings.length > 0 ? upcomingBookings.slice(0, 3).map((item) => (
        <View key={item.id}>
          {renderBookingItem({ item })}
        </View>
      )) : (
        <Text style={styles.emptyText}>No upcoming bookings.</Text>
      )}

      {!isManager && favoriteComplexes.length > 0 && (
        <>
          <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
            <Text style={styles.sectionTitle}>Favorite Hubs</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favComplexesList}>
            {favoriteComplexes.map(complex => (
              <TouchableOpacity 
                key={complex.id} 
                style={styles.favCard}
                onPress={() => router.push({
                    pathname: '/modal/complex-details',
                    params: { complexId: complex.id }
                })}
              >
                <View style={styles.favIconBox}>
                    <Building2 size={20} color={Colors.primary} />
                    <View style={styles.miniHeart}>
                        <Heart size={10} color={Colors.error} fill={Colors.error} />
                    </View>
                </View>
                <Text style={styles.favName} numberOfLines={1}>{complex.name}</Text>
                <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Navigation size={10} color={Colors.muted} />
                    <Text style={[styles.infoText, { fontSize: 10 }]}>{complex.city}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {!isManager && (
        <>
          <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
            <Text style={styles.sectionTitle}>Quick Book</Text>
          </View>
          <TouchableOpacity style={styles.quickBookHero} onPress={() => router.push('/(tabs)/book')}>
            <MapPin size={24} color={Colors.surface} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.quickBookText}>Find Courts Nearby</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  welcomeText: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: Colors.secondary,
  },
  roleText: {
    fontSize: Typography.size.md,
    color: Colors.muted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.secondary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.secondary,
  },
  seeAll: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontWeight: Typography.weight.semiBold,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  courtName: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.secondary,
  },
  customerName: {
    fontSize: Typography.size.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
  },
  statusTextConfirmed: {
    color: Colors.success,
  },
  statusTextPending: {
    color: Colors.warning,
  },
  bookingFooter: {
    flexDirection: 'row',
    gap: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: Typography.size.xs,
    color: Colors.muted,
  },
  quickBookHero: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  quickBookText: {
    color: Colors.surface,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyText: {
    fontSize: Typography.size.sm,
    color: Colors.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  favComplexesList: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 4,
  },
  favCard: {
    width: 140,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  favIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  miniHeart: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.surface,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  favName: {
    fontSize: 14,
    fontWeight: Typography.weight.bold,
    color: Colors.secondary,
  },
  quickReserveSection: {
    marginBottom: Spacing.xl,
  },
  reservePrimaryBtn: {
    height: 56,
  },
  reserveHint: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  todayBanner: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerMessage: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: Typography.weight.semiBold,
    marginTop: 2,
  },
});
