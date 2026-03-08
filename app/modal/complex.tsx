import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../context/DataContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Trophy, Navigation, Landmark as LandmarkIcon, ChevronDown, Check, Building2 } from 'lucide-react-native';
import { STATES, getCitiesByState } from '../../constants/Locations';

export default function AddComplexModal() {
    const router = useRouter();
    const { addComplex } = useData();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState(false);

    const [showStatePicker, setShowStatePicker] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    const availableCities = useMemo(() => {
        return selectedState ? getCitiesByState(selectedState) : [];
    }, [selectedState]);

    const handleSubmit = async () => {
        if (!name || !address || !landmark || !selectedState || !selectedCity) {
            Alert.alert('Error', 'Please fill in all mandatory fields (Name, Address, Landmark, State, City).');
            return;
        }

        setLoading(true);
        try {
            await addComplex({
                name,
                address,
                landmark,
                state: selectedState,
                city: selectedCity,
            });
            router.back();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to add complex. Please try again.');
        } finally {
            setLoading(false);
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add Sports Complex</Text>
                    <Text style={styles.subtitle}>Define the location where your courts are located.</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Complex Name *"
                        placeholder="e.g. Downtown Sports Hub"
                        value={name}
                        onChangeText={setName}
                        icon={<Building2 size={18} color={Colors.muted} />}
                    />

                    <Input
                        label="Address *"
                        placeholder="Street address or Area"
                        value={address}
                        onChangeText={setAddress}
                        icon={<Navigation size={18} color={Colors.muted} />}
                    />

                    <Input
                        label="Landmark *"
                        placeholder="e.g. Near City Center Mall"
                        value={landmark}
                        onChangeText={setLandmark}
                        icon={<LandmarkIcon size={18} color={Colors.muted} />}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>State *</Text>
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
                            <Text style={styles.inputLabel}>City *</Text>
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

                    <Button
                        title={loading ? "Creating..." : "Save Complex"}
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    subtitle: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginTop: 4,
    },
    form: {
        gap: Spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: Typography.weight.semiBold,
        color: Colors.secondary,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    pickerButton: {
        height: 48,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    disabledPicker: {
        backgroundColor: '#F8FAFC',
        opacity: 0.6,
    },
    pickerText: {
        fontSize: Typography.size.sm,
        color: Colors.secondary,
    },
    placeholderText: {
        color: Colors.muted,
    },
    submitButton: {
        marginTop: Spacing.lg,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    cancelText: {
        color: Colors.muted,
        fontWeight: Typography.weight.medium,
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
