import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useData } from '@playbuddy/shared';
import { Colors, Spacing, Typography, BorderRadius, Card } from '@playbuddy/ui';
import { Building2, ChevronRight, MapPin, CalendarRange } from 'lucide-react-native';

export default function SelectCourtModal() {
    const router = useRouter();
    const { complexes, courts } = useData();
    const [selectedComplexId, setSelectedComplexId] = useState<string | null>(complexes.length === 1 ? complexes[0].id : null);

    const handleSelectCourt = (courtId: string) => {
        router.push({
            pathname: '/modal/booking',
            params: { courtId }
        });
    };

    const renderComplexItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.itemCard, selectedComplexId === item.id && styles.selectedItem]}
            onPress={() => setSelectedComplexId(item.id)}
        >
            <Building2 size={24} color={selectedComplexId === item.id ? Colors.primary : Colors.muted} />
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, selectedComplexId === item.id && styles.selectedText]}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.city}</Text>
            </View>
            <ChevronRight size={16} color={Colors.border} />
        </TouchableOpacity>
    );

    const renderCourtItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.courtCard}
            onPress={() => handleSelectCourt(item.id)}
        >
            <View style={styles.courtIcon}>
                <CalendarRange size={20} color={Colors.surface} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.type}</Text>
            </View>
            <Text style={styles.courtPrice}>₹{item.price}</Text>
        </TouchableOpacity>
    );

    const filteredCourts = courts.filter(c => c.complexId === selectedComplexId);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Select Court' }} />
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Select Complex</Text>
                <FlatList
                    data={complexes}
                    renderItem={renderComplexItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: 200 }}
                />
            </View>

            {selectedComplexId && (
                <View style={[styles.section, { flex: 1 }]}>
                    <Text style={styles.sectionTitle}>2. Choose Court</Text>
                    <FlatList
                        data={filteredCourts}
                        renderItem={renderCourtItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No courts found in this complex.</Text>
                        }
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.muted,
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
        letterSpacing: 1,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    selectedItem: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '05',
    },
    itemInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    itemTitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.semiBold,
        color: Colors.secondary,
    },
    selectedText: {
        color: Colors.primary,
    },
    itemSubtitle: {
        fontSize: Typography.size.xs,
        color: Colors.muted,
        marginTop: 2,
    },
    courtCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
    },
    courtIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    courtPrice: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.primary,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.muted,
        marginTop: Spacing.xl,
        fontStyle: 'italic',
    }
});
