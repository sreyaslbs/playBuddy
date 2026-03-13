import { useRouter } from 'expo-router';
import { Building2, MapPin, Plus, Trash2, Edit2, CalendarRange } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Styles';
import { useData } from '../../context/DataContext';

export default function ManageCourtsScreen() {
    const { complexes, courts, deleteCourt, deleteComplex, loading } = useData();
    const router = useRouter();

    const handleDeleteCourt = (id: string, name: string) => {
        console.log(`[DEBUG] handleDeleteCourt called for: ${name} (id: ${id})`);

        const performDelete = async () => {
            console.log(`[DEBUG] Delete Court confirmed for: ${id}`);
            try {
                await deleteCourt(id);
                console.log(`[DEBUG] deleteCourt result: success`);
                if (Platform.OS === 'web') {
                    window.alert('Court deleted successfully');
                } else {
                    Alert.alert('Success', 'Court deleted successfully');
                }
            } catch (error: any) {
                console.error(`[DEBUG] deleteCourt result: error`, error);
                if (Platform.OS === 'web') {
                    window.alert(error.message || 'Failed to delete court');
                } else {
                    Alert.alert('Error', error.message || 'Failed to delete court');
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete ${name}?`)) {
                performDelete();
            }
        } else {
            Alert.alert(
                'Delete Court',
                `Are you sure you want to delete ${name}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete },
                ]
            );
        }
    };

    const handleDeleteComplex = (id: string, name: string) => {
        console.log(`[DEBUG] handleDeleteComplex called for: ${name} (id: ${id})`);

        const performDelete = async () => {
            console.log(`[DEBUG] Delete Complex confirmed for: ${id}`);
            try {
                await deleteComplex(id);
                console.log(`[DEBUG] deleteComplex result: success`);
                if (Platform.OS === 'web') {
                    window.alert('Complex deleted successfully');
                } else {
                    Alert.alert('Success', 'Complex deleted successfully');
                }
            } catch (error: any) {
                console.error(`[DEBUG] deleteComplex result: error`, error);
                if (Platform.OS === 'web') {
                    window.alert(error.message || 'Failed to delete complex');
                } else {
                    Alert.alert('Error', error.message || 'Failed to delete complex');
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete ${name} and all its settings?`)) {
                performDelete();
            }
        } else {
            Alert.alert(
                'Delete Complex',
                `Are you sure you want to delete ${name} and all its settings?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete },
                ]
            );
        }
    }

    const renderCourtItem = (court: any) => (
        <View key={court.id} style={styles.courtItem}>
            <View style={styles.courtMain}>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtType}>{court.type}</Text>
            </View>
            <View style={styles.courtRight}>
                <Text style={styles.courtPrice}>₹{court.price}/hr</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.reserveBtn}
                        onPress={() => router.push({ pathname: '/modal/booking', params: { courtId: court.id } })}
                    >
                        <CalendarRange size={16} color={Colors.success} />
                        <Text style={styles.reserveBtnText}>Reserve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/modal/add-court', params: { id: court.id } })}>
                        <Edit2 size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCourt(court.id, court.name)}>
                        <Trash2 size={16} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderComplexItem = ({ item: complex }: { item: any }) => {
        const complexCourts = courts.filter(c => c.complexId === complex.id);

        return (
            <Card style={styles.complexCard} variant="outlined">
                <View style={styles.complexHeader}>
                    <View style={styles.complexInfo}>
                        <Building2 size={24} color={Colors.primary} />
                        <View style={{ marginLeft: Spacing.sm }}>
                            <Text style={styles.complexTitle}>{complex.name}</Text>
                            <View style={styles.locationRow}>
                                <MapPin size={12} color={Colors.muted} />
                                <Text style={styles.locationText}>{complex.city}, {complex.state}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.complexActions}>
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/modal/complex', params: { id: complex.id } })}
                            style={{ marginRight: Spacing.md }}
                        >
                            <Edit2 size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteComplex(complex.id, complex.name)}>
                            <Trash2 size={20} color={Colors.muted} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.courtsSection}>
                    <View style={styles.courtsHeader}>
                        <Text style={styles.sectionTitle}>Courts ({complexCourts.length})</Text>
                        <TouchableOpacity
                            style={styles.addCourtSmall}
                            onPress={() => router.push({ pathname: '/modal/add-court', params: { complexId: complex.id } })}
                        >
                            <Plus size={14} color={Colors.primary} />
                            <Text style={styles.addCourtText}>Add Court</Text>
                        </TouchableOpacity>
                    </View>

                    {complexCourts.length > 0 ? (
                        complexCourts.map(renderCourtItem)
                    ) : (
                        <Text style={styles.noCourtsText}>No courts added to this complex yet.</Text>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Your Hubs</Text>
                    <Text style={styles.subtitle}>Manage complexes and courts</Text>
                </View>
                <Button
                    title="Add Complex"
                    onPress={() => router.push('/modal/complex')}
                    variant="primary"
                    style={styles.addButton}
                    icon={<Plus size={18} color={Colors.surface} />}
                />
            </View>

            <FlatList
                data={complexes}
                renderItem={renderComplexItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Building2 size={48} color={Colors.border} />
                            <Text style={styles.emptyText}>No complexes added yet.</Text>
                            <TouchableOpacity onPress={() => router.push('/modal/complex')}>
                                <Text style={styles.emptyLink}>Click here to add your first complex</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
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
    header: {
        padding: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    title: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    subtitle: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
    },
    addButton: {
        minHeight: 40,
        paddingHorizontal: Spacing.md,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
    complexCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: Colors.surface,
    },
    complexHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    complexInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    complexTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: 12,
        color: Colors.muted,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },
    courtsSection: {
        marginTop: Spacing.xs,
    },
    courtsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.size.sm,
        fontWeight: Typography.weight.bold,
        color: Colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addCourtSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    addCourtText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
        marginLeft: 4,
    },
    courtItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    courtMain: {
        flex: 1,
    },
    courtName: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.semiBold,
        color: Colors.secondary,
    },
    courtType: {
        fontSize: 12,
        color: Colors.muted,
        marginTop: 2,
    },
    courtRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    complexActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    courtPrice: {
        fontSize: 14,
        fontWeight: Typography.weight.bold,
        color: Colors.primary,
    },
    reserveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.success + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    reserveBtnText: {
        fontSize: 12,
        color: Colors.success,
        fontWeight: Typography.weight.bold,
    },
    noCourtsText: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        textAlign: 'center',
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: Typography.size.md,
        color: Colors.muted,
        fontWeight: Typography.weight.medium,
    },
    emptyLink: {
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
        fontSize: Typography.size.sm,
    },
});
