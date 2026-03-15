import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth, useData } from '@playbuddy/shared';
import { Colors, Spacing, Typography, BorderRadius, Card, Button } from '@playbuddy/ui';
import { Building2, MapPin, Navigation, Star, Trophy, Clock, CheckCircle2 } from 'lucide-react-native';

export default function ComplexDetailsModal() {
    const router = useRouter();
    const { complexId } = useLocalSearchParams();
    const { user } = useAuth();
    const { complexes, courts, addBooking } = useData();

    const complex = useMemo(() => complexes.find(c => c.id === complexId), [complexes, complexId]);
    const complexCourts = useMemo(() => courts.filter(c => c.complexId === complexId), [courts, complexId]);

    const handleBook = async (court: any) => {
        if (!user) {
            Alert.alert('Login Required', 'Please log in to book a court.');
            return;
        }

        router.push({
            pathname: '/modal/booking',
            params: { courtId: court.id }
        });
    };

    if (!complex) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Complex not found...</Text>
            </View>
        );
    }

    const renderCourtItem = ({ item }: { item: any }) => (
        <Card style={styles.courtCard} variant="elevated">
            <View style={styles.courtHeader}>
                <View style={styles.courtIcon}>
                    <Trophy size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.courtName}>{item.name}</Text>
                    <Text style={styles.courtType}>{item.type}</Text>
                </View>
                <Text style={styles.priceText}>₹{item.price}<Text style={styles.perHour}>/hr</Text></Text>
            </View>

            {item.description ? (
                <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
            ) : null}

            <View style={styles.featureRow}>
                <View style={styles.featureTag}>
                    <Clock size={12} color={Colors.muted} />
                    <Text style={styles.featureText}>Available Today</Text>
                </View>
                <View style={styles.featureTag}>
                    <CheckCircle2 size={12} color={Colors.success} />
                    <Text style={styles.featureText}>Verified Hub</Text>
                </View>
            </View>

            <Button
                title="Book Now"
                onPress={() => handleBook(item)}
                style={styles.bookButton}
            />
        </Card>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: complex.name, headerShown: true }} />

            <View style={styles.headerCard}>
                <Text style={styles.complexTitle}>{complex.name}</Text>
                <View style={styles.locationContainer}>
                    <MapPin size={14} color={Colors.muted} />
                    <Text style={styles.locationText}>{complex.address}</Text>
                </View>
                <View style={styles.locationContainer}>
                    <Navigation size={14} color={Colors.muted} />
                    <Text style={styles.locationText}>{complex.landmark}, {complex.city}</Text>
                </View>
            </View>

            <FlatList
                data={complexCourts}
                renderItem={renderCourtItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={<Text style={styles.sectionTitle}>Available Courts ({complexCourts.length})</Text>}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Trophy size={48} color={Colors.border} />
                        <Text style={styles.emptyText}>No courts listed for this complex yet.</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    complexTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: Spacing.sm,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    locationText: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
    },
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: Spacing.md,
    },
    courtCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
    },
    courtHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    courtIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courtName: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    courtType: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: Typography.weight.medium,
        marginTop: 2,
    },
    priceText: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    perHour: {
        fontSize: 10,
        color: Colors.muted,
        fontWeight: Typography.weight.medium,
    },
    descriptionText: {
        fontSize: 12,
        color: Colors.muted,
        marginTop: Spacing.md,
        lineHeight: 18,
    },
    featureRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    featureTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    featureText: {
        fontSize: 10,
        color: Colors.muted,
        fontWeight: Typography.weight.medium,
    },
    bookButton: {
        width: '100%',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        textAlign: 'center',
    },
});
