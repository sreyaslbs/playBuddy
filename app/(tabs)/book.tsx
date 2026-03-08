import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Card } from '../../components/Card';
import { Search, MapPin, Building2, ChevronDown, Check, Star, Navigation, Map } from 'lucide-react-native';
import { STATES, getCitiesByState } from '../../constants/Locations';
import { Button } from '../../components/Button';

export default function BookCourtScreen() {
    const router = useRouter();
    const { metadata, updateUserData } = useAuth();
    const { complexes, courts, loading } = useData();

    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    // Initialize with default location from metadata
    useEffect(() => {
        if (metadata?.defaultState) setSelectedState(metadata.defaultState);
        if (metadata?.defaultCity) {
            setSelectedCity(metadata.defaultCity);
            setHasSearched(true); // Auto-show results for default city
        }
    }, [metadata]);

    const availableCities = useMemo(() => {
        return selectedState ? getCitiesByState(selectedState) : [];
    }, [selectedState]);

    // Memoized filtered complexes
    const searchedComplexes = useMemo(() => {
        if (!hasSearched || !selectedCity) return [];
        return complexes.filter(c => c.city === selectedCity);
    }, [complexes, selectedCity, hasSearched]);

    const handleSearch = () => {
        if (!selectedCity) return;
        setHasSearched(true);
    };

    const handleSetDefault = async () => {
        if (!selectedState || !selectedCity) {
            Alert.alert('Error', 'Please select both State and City first.');
            return;
        }
        try {
            await updateUserData({
                defaultState: selectedState,
                defaultCity: selectedCity
            });
            Alert.alert('Success', 'Default location updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save defaults.');
        }
    };

    const SelectionModal = ({ visible, onClose, data, onSelect, title, current }: any) => (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.optionItem, current === item && styles.activeOption]}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={[styles.optionText, current === item && styles.activeOptionText]}>{item}</Text>
                                {current === item && <Check size={18} color={Colors.primary} />}
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            </View>
        </Modal>
    );

    const renderComplexItem = ({ item: complex }: { item: any }) => {
        const types = Array.from(new Set(courts.filter(c => c.complexId === complex.id).map(c => c.type)));

        return (
            <Card style={styles.complexCard} variant="elevated">
                <View style={styles.complexInfo}>
                    <View style={styles.complexHeader}>
                        <View style={styles.iconBox}>
                            <Building2 size={24} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: Spacing.md }}>
                            <Text style={styles.complexName}>{complex.name}</Text>
                            <View style={styles.locationRow}>
                                <Navigation size={12} color={Colors.muted} />
                                <Text style={styles.locationDetails}>{complex.address}</Text>
                            </View>
                            <View style={styles.locationRow}>
                                <MapPin size={12} color={Colors.muted} />
                                <Text style={styles.locationDetails}>{complex.landmark}, {complex.city}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingBox}>
                            <Star size={12} color={Colors.accent} fill={Colors.accent} />
                            <Text style={styles.ratingText}>5.0</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.typesContainer}>
                        <Text style={styles.typesLabel}>Available Sports:</Text>
                        <View style={styles.tagGroup}>
                            {types.length > 0 ? types.map(type => (
                                <View key={type} style={styles.tag}>
                                    <Text style={styles.tagText}>{type}</Text>
                                </View>
                            )) : (
                                <Text style={styles.noSportsText}>No courts added yet</Text>
                            )}
                        </View>
                    </View>

                    <Button
                        title="View Courts"
                        onPress={() => router.push({
                            pathname: '/modal/complex-details',
                            params: { complexId: complex.id }
                        })}
                        variant="secondary"
                        style={styles.viewButton}
                    />
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Find Courts</Text>

                <View style={styles.filterSection}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>State</Text>
                            <TouchableOpacity
                                style={styles.pickerButton}
                                onPress={() => setShowStatePicker(true)}
                            >
                                <Text style={[styles.pickerText, !selectedState && styles.placeholderText]}>
                                    {selectedState || 'Select State'}
                                </Text>
                                <ChevronDown size={18} color={Colors.muted} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>City</Text>
                            <TouchableOpacity
                                style={[styles.pickerButton, !selectedState && styles.disabledPicker]}
                                onPress={() => selectedState && setShowCityPicker(true)}
                            >
                                <Text style={[styles.pickerText, !selectedCity && styles.placeholderText]}>
                                    {selectedCity || 'Select City'}
                                </Text>
                                <ChevronDown size={18} color={Colors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.defaultLink} onPress={handleSetDefault}>
                            <MapPin size={14} color={Colors.primary} />
                            <Text style={styles.defaultLinkText}>Set as Default Location</Text>
                        </TouchableOpacity>

                        <Button
                            title="Search"
                            onPress={() => handleSearch()}
                            style={styles.searchButton}
                            disabled={!selectedCity}
                        />
                    </View>
                </View>
            </View>

            <FlatList
                data={searchedComplexes}
                renderItem={renderComplexItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading && hasSearched && (
                        <View style={styles.emptyContainer}>
                            <Building2 size={48} color={Colors.border} />
                            <Text style={styles.emptyText}>
                                {selectedCity ? `No complexes found in ${selectedCity}` : 'Search by city to find sports hubs'}
                            </Text>
                        </View>
                    )
                }
            />

            <SelectionModal
                visible={showStatePicker}
                onClose={() => setShowStatePicker(false)}
                data={STATES}
                onSelect={(state: string) => {
                    setSelectedState(state);
                    setSelectedCity('');
                }}
                title="Select State"
                current={selectedState}
            />

            <SelectionModal
                visible={showCityPicker}
                onClose={() => setShowCityPicker(false)}
                data={availableCities}
                onSelect={setSelectedCity}
                title="Select City"
                current={selectedCity}
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
        paddingTop: Spacing.xl,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: Spacing.lg,
    },
    filterSection: {
        gap: Spacing.md,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: Typography.weight.bold,
        color: Colors.muted,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    pickerButton: {
        height: 44,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    disabledPicker: {
        opacity: 0.5,
    },
    pickerText: {
        fontSize: 14,
        color: Colors.secondary,
    },
    placeholderText: {
        color: Colors.muted,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    defaultLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    defaultLinkText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
    },
    searchButton: {
        minHeight: 40,
        paddingHorizontal: Spacing.xl,
    },
    listContent: {
        padding: Spacing.lg,
    },
    complexCard: {
        padding: 0,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
    },
    complexInfo: {
        padding: Spacing.lg,
    },
    complexHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    complexName: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    locationDetails: {
        fontSize: 12,
        color: Colors.muted,
        flex: 1,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.lg,
    },
    typesContainer: {
        marginBottom: Spacing.lg,
    },
    typesLabel: {
        fontSize: 12,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: Spacing.sm,
    },
    tagGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: Colors.secondary + '08',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.secondary + '15',
    },
    tagText: {
        fontSize: 12,
        color: Colors.secondary,
        fontWeight: Typography.weight.medium,
    },
    noSportsText: {
        fontSize: 12,
        color: Colors.muted,
        fontStyle: 'italic',
    },
    viewButton: {
        width: '100%',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: Typography.size.md,
        color: Colors.muted,
        textAlign: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    closeText: {
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
    },
    listContent: {
        paddingBottom: Spacing.xl,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    activeOption: {
        backgroundColor: Colors.primary + '10',
    },
    optionText: {
        fontSize: Typography.size.md,
        color: Colors.secondary,
    },
    activeOptionText: {
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
    },
});
