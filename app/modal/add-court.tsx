import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '../../context/DataContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Trophy, FileText, ChevronDown, Check, Building2, Clock } from 'lucide-react-native';

const COURT_TYPES = ['Turf', 'Multipurpose', 'Badminton', 'Tennis', 'Basketball', 'Football', 'Cricket'];

export default function AddCourtModal() {
    const router = useRouter();
    const { complexId: initialComplexId } = useLocalSearchParams();
    const { complexes, addCourt } = useData();

    const [name, setName] = useState('');
    const [type, setType] = useState(COURT_TYPES[0]);
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [complexId, setComplexId] = useState(initialComplexId as string || '');
    const [loading, setLoading] = useState(false);

    // Get params
    const params = useLocalSearchParams();
    const {
        slots: slotParam,
        name: nameParam,
        type: typeParam,
        price: priceParam,
        description: descriptionParam,
        complexId: complexIdParam
    } = params;

    const selectedSlots = slotParam ? JSON.parse(slotParam as string) : [];

    // Sync state from params (when returning from slots modal)
    useEffect(() => {
        if (nameParam) setName(nameParam as string);
        if (typeParam) setType(typeParam as string);
        if (priceParam) setPrice(priceParam as string);
        if (descriptionParam) setDescription(descriptionParam as string);
        if (complexIdParam) setComplexId(complexIdParam as string);
    }, [nameParam, typeParam, priceParam, descriptionParam, complexIdParam]);

    const [showComplexPicker, setShowComplexPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

    const selectedComplex = complexes.find(c => c.id === (complexId || complexIdParam));

    const handleSubmit = async () => {
        if (!name || !price || !complexId || !type) {
            Alert.alert('Error', 'Please fill in all mandatory fields (Complex, Court Name, Type, Price).');
            return;
        }

        setLoading(true);
        try {
            await addCourt({
                complexId,
                name,
                type,
                price: parseFloat(price),
                description,
                slots: selectedSlots, // Save slots
            });
            router.replace('/(tabs)/courts');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to add court. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const SelectionModal = ({ visible, onClose, data, onSelect, title, current, labelKey = '' }: any) => (
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
                        keyExtractor={(item, index) => labelKey ? item.id : item}
                        renderItem={({ item }) => {
                            const label = labelKey ? item[labelKey] : item;
                            const value = labelKey ? item.id : item;
                            const isActive = current === value;
                            return (
                                <TouchableOpacity
                                    style={[styles.optionItem, isActive && styles.activeOption]}
                                    onPress={() => {
                                        onSelect(value);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.optionText, isActive && styles.activeOptionText]}>{label}</Text>
                                    {isActive && <Check size={18} color={Colors.primary} />}
                                </TouchableOpacity>
                            );
                        }}
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
                    <Text style={styles.title}>Add New Court</Text>
                    <Text style={styles.subtitle}>Define a court within your sports complex.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Select Complex *</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowComplexPicker(true)}
                    >
                        <View style={styles.pickerLeft}>
                            <Building2 size={18} color={Colors.muted} style={{ marginRight: Spacing.sm }} />
                            <Text style={[styles.pickerText, !complexId && styles.placeholderText]}>
                                {selectedComplex?.name || 'Choose Complex'}
                            </Text>
                        </View>
                        <ChevronDown size={18} color={Colors.muted} />
                    </TouchableOpacity>

                    <Input
                        label="Court Name *"
                        placeholder="e.g. Main Court A"
                        value={name}
                        onChangeText={setName}
                        icon={<Trophy size={18} color={Colors.muted} />}
                    />

                    <Text style={styles.inputLabel}>Court Type *</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowTypePicker(true)}
                    >
                        <View style={styles.pickerLeft}>
                            <Text style={[styles.pickerText, !type && styles.placeholderText]}>
                                {type || 'Select Type'}
                            </Text>
                        </View>
                        <ChevronDown size={18} color={Colors.muted} />
                    </TouchableOpacity>

                    <Input
                        label="Price per Hour (₹) *"
                        placeholder="500"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        icon={<Text style={{ fontSize: 18, color: Colors.muted, fontWeight: 'bold' }}>₹</Text>}
                    />

                    <TouchableOpacity
                        style={styles.slotLink}
                        onPress={() => router.push({
                            pathname: '/modal/slots',
                            params: { complexId, name, type, price, description, slots: slotParam }
                        })}
                    >
                        <Clock size={20} color={Colors.primary} />
                        <Text style={styles.slotLinkText}>
                            {selectedSlots.length > 0 ? `Defining ${selectedSlots.length} Slots` : 'Define Open Timings / Slots'}
                        </Text>
                    </TouchableOpacity>

                    <Input
                        label="Description (Optional)"
                        placeholder="e.g. Synthetic surface, floodlights..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        icon={<FileText size={18} color={Colors.muted} />}
                    />

                    <Button
                        title={loading ? "Creating..." : "Add Court"}
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
                visible={showComplexPicker}
                onClose={() => setShowComplexPicker(false)}
                data={complexes}
                onSelect={setComplexId}
                title="Select Complex"
                current={complexId}
                labelKey="name"
            />

            <SelectionModal
                visible={showTypePicker}
                onClose={() => setShowTypePicker(false)}
                data={COURT_TYPES}
                onSelect={setType}
                title="Select Court Type"
                current={type}
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
        marginBottom: -4,
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
        marginBottom: Spacing.sm,
    },
    pickerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: Typography.size.sm,
        color: Colors.secondary,
    },
    placeholderText: {
        color: Colors.muted,
    },
    slotLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '10',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
        marginTop: Spacing.sm,
    },
    slotLinkText: {
        marginLeft: Spacing.sm,
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
        fontSize: Typography.size.sm,
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
