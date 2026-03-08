import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Card } from '../../components/Card';
import { Calendar, Clock, Plus, Users, MapPin, Trophy, Building2 } from 'lucide-react-native';

export default function DashboardScreen() {
  const { role, user, metadata } = useAuth();
  const { bookings, courts, complexes } = useData();
  const router = useRouter();
  const isManager = role === 'manager';

  const renderBookingItem = ({ item }: { item: any }) => (
    <Card style={styles.bookingCard} key={item.id} variant="outlined">
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.courtName}>{item.courtName}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
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
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, {user?.displayName || 'Buddy'}!</Text>
        <Text style={styles.roleText}>{isManager ? 'Sports Complex Manager' : 'Ready to play today?'}</Text>
      </View>

      {isManager ? (
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Building2 size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{complexes.length}</Text>
            <Text style={styles.statLabel}>Complexes</Text>
          </Card>
          <Card style={styles.statCard}>
            <Trophy size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{courts.length}</Text>
            <Text style={styles.statLabel}>Courts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Users size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </Card>
        </View>
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

      {bookings.length > 0 ? bookings.slice(0, 3).map((item) => (
        <View key={item.id}>
          {renderBookingItem({ item })}
        </View>
      )) : (
        <Text style={styles.emptyText}>No upcoming bookings.</Text>
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

      {isManager && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/modal/complex')}>
          <Plus color={Colors.surface} size={32} />
        </TouchableOpacity>
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
});
