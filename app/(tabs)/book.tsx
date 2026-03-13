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
import { STATES, getCitiesByState, INDIAN_LOCATIONS, CityInfo } from '../../constants/Locations';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Search, MapPin, Building2, Star, Navigation, X, Heart } from 'lucide-react-native';

export default function BookCourtScreen() {
    const router = useRouter();
    const { metadata, updateUserData } = useAuth();
    const { complexes, courts, loading } = useData();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<CityInfo | null>(null);
    const [suggestions, setSuggestions] = useState<CityInfo[]>([]);

    // Initialize with default location from metadata
    useEffect(() => {
        if (metadata?.defaultCity && metadata?.defaultState && !selectedLocation) {
            const loc = { city: metadata.defaultCity, state: metadata.defaultState };
            setSelectedLocation(loc);
            setSearchQuery(loc.city);
        }
    }, [metadata]);

    // Handle Search Input Change
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (text.length >= 3) {
            const query = text.toLowerCase();
            const filtered = INDIAN_LOCATIONS.filter(loc => 
                loc.city.toLowerCase().includes(query) || 
                loc.state.toLowerCase().includes(query)
            ).slice(0, 5); 
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectLocation = (loc: CityInfo) => {
        setSelectedLocation(loc);
        setSearchQuery(loc.city);
        setSuggestions([]);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSelectedLocation(null);
        setSuggestions([]);
    };

    // Memoized filtered complexes
    const searchedComplexes = useMemo(() => {
        if (!selectedLocation) return [];
        return complexes.filter(c => 
            c.city === selectedLocation.city && 
            c.state === selectedLocation.state
        );
    }, [complexes, selectedLocation]);

    const handleSetDefault = async () => {
        if (!selectedLocation) return;
        try {
            await updateUserData({
                defaultState: selectedLocation.state,
                defaultCity: selectedLocation.city
            });
            Alert.alert(
                'Home City Updated',
                `${selectedLocation.city} is now your default location.`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to save defaults.');
        }
    };

    const isCurrentDefault = metadata?.defaultCity === selectedLocation?.city && metadata?.defaultState === selectedLocation?.state;

    const toggleFavorite = async (complexId: string) => {
        const currentFavorites = metadata?.favorites || [];
        const isFav = currentFavorites.includes(complexId);
        const newFavorites = isFav 
            ? currentFavorites.filter(id => id !== complexId)
            : [...currentFavorites, complexId];
        
        try {
            await updateUserData({ favorites: newFavorites });
        } catch (error) {
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

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
                        <View style={styles.rightHeaderColumn}>
                            <View style={styles.ratingBox}>
                                <Star size={12} color={Colors.accent} fill={Colors.accent} />
                                <Text style={styles.ratingText}>5.0</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => toggleFavorite(complex.id)}
                                style={styles.favoriteButton}
                            >
                                <Heart 
                                    size={20} 
                                    color={metadata?.favorites?.includes(complex.id) ? Colors.error : Colors.muted} 
                                    fill={metadata?.favorites?.includes(complex.id) ? Colors.error : 'transparent'} 
                                />
                            </TouchableOpacity>
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

                    <View style={styles.footerRow}>
                        <View style={styles.addressContainer}>
                            <Text style={styles.addressLabel}>Neighborhood</Text>
                            <Text style={styles.addressText} numberOfLines={1}>{complex.landmark || complex.city}</Text>
                        </View>
                        <Button
                            title="View Hub"
                            onPress={() => router.push({
                                pathname: '/modal/complex-details',
                                params: { complexId: complex.id }
                            })}
                            variant="secondary"
                            style={styles.viewButton}
                        />
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Find Courts</Text>
                    {selectedLocation && (
                        <TouchableOpacity 
                            style={[styles.defaultBadge, isCurrentDefault && styles.defaultBadgeActive]} 
                            onPress={handleSetDefault}
                            disabled={isCurrentDefault}
                        >
                            <MapPin size={12} color={isCurrentDefault ? Colors.success : Colors.primary} />
                            <Text style={[styles.defaultBadgeText, isCurrentDefault && styles.defaultBadgeTextActive]}>
                                {isCurrentDefault ? 'Your Home City' : `Set as Home City`}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.searchBarContainer}>
                    <View style={styles.inputWrapper}>
                        <Input
                            placeholder="Type city or state..."
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            icon={<Search size={20} color={Colors.muted} />}
                            containerStyle={styles.searchInput}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                                <X size={18} color={Colors.muted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {suggestions.length > 0 && (
                        <View style={styles.suggestionsList}>
                            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 250 }}>
                                {suggestions.map((loc, idx) => (
                                    <TouchableOpacity 
                                        key={`${loc.city}-${idx}`} 
                                        style={styles.suggestionItem}
                                        onPress={() => handleSelectLocation(loc)}
                                    >
                                        <MapPin size={16} color={Colors.muted} />
                                        <View style={styles.suggestionTextContainer}>
                                            <Text style={styles.suggestionCity}>{loc.city}</Text>
                                            <Text style={styles.suggestionState}>{loc.state}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            {suggestions.length === 0 && (
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={searchedComplexes}
                    renderItem={renderComplexItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Building2 size={48} color={Colors.border} />
                            <Text style={styles.emptyText}>
                                {!selectedLocation 
                                    ? 'Search and select a city to discover the best courts around you.' 
                                    : `No sports hubs found in ${selectedLocation.city} currently. Try searching another city!`}
                            </Text>
                        </View>
                    }
                />
            )}
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
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.primary + '10',
        borderWidth: 1,
        borderColor: Colors.primary + '20',
    },
    defaultBadgeActive: {
        backgroundColor: Colors.success + '10',
        borderColor: Colors.success + '20',
    },
    defaultBadgeText: {
        fontSize: 12,
        fontWeight: Typography.weight.bold,
        color: Colors.primary,
    },
    defaultBadgeTextActive: {
        color: Colors.success,
    },
    searchBarContainer: {
        marginTop: Spacing.xs,
        position: 'relative',
        zIndex: 10,
    },
    inputWrapper: {
        position: 'relative',
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: 17,
        zIndex: 2,
    },
    suggestionsList: {
        position: 'absolute',
        top: 54,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: Spacing.md,
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionCity: {
        fontSize: 14,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    suggestionState: {
        fontSize: 12,
        color: Colors.muted,
    },
    searchInput: {
        marginBottom: 0,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.md,
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
    rightHeaderColumn: {
        alignItems: 'flex-end',
        gap: Spacing.sm,
    },
    favoriteButton: {
        padding: 4,
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
    addressContainer: {
        flex: 2,
    },
    addressLabel: {
        fontSize: 10,
        color: Colors.muted,
        marginBottom: 2,
    },
    addressText: {
        fontSize: 12,
        fontWeight: Typography.weight.semiBold,
        color: Colors.secondary,
    },
    viewButton: {
        flex: 1,
        minHeight: 44,
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
