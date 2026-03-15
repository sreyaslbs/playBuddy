import React, { useState, useEffect, useMemo } from 'react';
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
import { useData, COURT_TYPES } from '@playbuddy/shared';
import { Input, Button, BorderRadius, Colors, Spacing, Typography } from '@playbuddy/ui';
import { Trophy, FileText, ChevronDown, Check, Building2, Clock } from 'lucide-react-native';

export default function AddCourtModal() {
    const router = useRouter();
    const { complexId: initialComplexId, id } = useLocalSearchParams();
    const { complexes, courts, addCourt, updateCourt } = useData();

    const isEditing = !!id;
    const existingCourt = useMemo(() => {
        return isEditing ? courts.find(c => c.id === id) : null;
    }, [id, courts]);

    const [name, setName] = useState(existingCourt?.name || '');
    const [type, setType] = useState(existingCourt?.type || COURT_TYPES[0]);
    const [price, setPrice] = useState(existingCourt?.price?.toString() || '');
    const [description, setDescription] = useState(existingCourt?.description || '');
    const [complexId, setComplexId] = useState(existingCourt?.complexId || initialComplexId as string || '');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const params = useLocalSearchParams();
    const {
        slots: slotParam,
        name: nameParam,
        type: typeParam,
        price: priceParam,
        description: descriptionParam,
        complexId: complexIdParam
    } = params;

    const [selectedSlots, setSelectedSlots] = useState<any[]>([]);

    // Sync slots from params or existing court
    useEffect(() => {
        if (slotParam) {
            try {
                setSelectedSlots(JSON.parse(slotParam as string));
            } catch (e) {
                console.error("Error parsing slots param", e);
            }
        } else if (existingCourt?.slots) {
            setSelectedSlots(existingCourt.slots);
        }
    }, [slotParam, existingCourt]);

    // 1. Sync state when editing an existing court (important if data loads after initial mount)
    useEffect(() => {
        if (existingCourt) {
            setName(existingCourt.name);
            setType(existingCourt.type);
            setPrice(existingCourt.price.toString());
            setDescription(existingCourt.description || '');
            setComplexId(existingCourt.complexId);
        }
    }, [existingCourt]);

    // 2. Sync state from params (when returning from slots modal or first mount)
    useEffect(() => {
        if (nameParam) setName(nameParam as string);
        if (typeParam) setType(typeParam as string);
        if (priceParam) setPrice(priceParam as string);
        if (descriptionParam) setDescription(descriptionParam as string);
        if (complexIdParam) setComplexId(complexIdParam as string);
        else if (initialComplexId) setComplexId(initialComplexId as string);
    }, [nameParam, typeParam, priceParam, descriptionParam, complexIdParam, initialComplexId]);

    const [showComplexPicker, setShowComplexPicker] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);

    const selectedComplex = useMemo(() => {
        return complexes.find(c => c.id === complexId);
    }, [complexes, complexId]);

    const handleSubmit = async () => {
        console.log('[DEBUG] AddCourtModal: handleSubmit called');
        
        const newErrors: Record<string, string> = {};
        if (!name) newErrors.name = 'Court name is required';
        if (!price) newErrors.price = 'Price is required';
        if (!complexId) newErrors.complexId = 'Complex is required';
        if (!type) newErrors.type = 'Type is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            console.log('[DEBUG] Validation failed:', newErrors);
            Alert.alert('Missing Info', 'Please fill in all mandatory fields highlighted in red.');
            return;
        }

        setLoading(true);
        try {
            if (isEditing && id) {
                console.log('[DEBUG] Calling updateCourt for ID:', id);
                await updateCourt(id as string, {
                    complexId,
                    name,
                    type,
                    price: parseFloat(price),
                    description,
                    slots: selectedSlots,
                });
            } else {
                console.log('[DEBUG] Calling addCourt');
                await addCourt({
                    complexId,
                    name,
                    type,
                    price: parseFloat(price),
                    description,
                    slots: selectedSlots, // Save slots
                });
            }
            console.log('[DEBUG] Success, navigating to courts tab');
            // Use replace to ensure we don't 'go back' into the modal stack
            router.replace('/(tabs)/courts');
        } catch (error: any) {
            console.error('[DEBUG] Error in handleSubmit:', error);
            Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} court: ${error?.message || 'Unknown error'}`);
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
                    <Text style={styles.title}>{isEditing ? 'Edit' : 'Add New'} Court</Text>
                    <Text style={styles.subtitle}>{isEditing ? 'Update the details of your court.' : 'Define a court within your sports complex.'}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Select Complex *</Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, errors.complexId && styles.pickerError]}
                        onPress={() => setShowComplexPicker(true)}
                    >
                        <View style={styles.pickerLeft}>
                            <Building2 size={18} color={errors.complexId ? Colors.error : Colors.muted} style={{ marginRight: Spacing.sm }} />
                            <Text style={[styles.pickerText, !complexId && styles.placeholderText]}>
                                {selectedComplex?.name || 'Choose Complex'}
                            </Text>
                        </View>
                        <ChevronDown size={18} color={errors.complexId ? Colors.error : Colors.muted} />
                    </TouchableOpacity>
                    {errors.complexId && <Text style={styles.errorTextSmall}>{errors.complexId}</Text>}

                    <Input
                        label="Court Name *"
                        placeholder="e.g. Main Court A"
                        value={name}
                        onChangeText={(val) => {
                            setName(val);
                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                        }}
                        error={errors.name}
                        icon={<Trophy size={18} color={errors.name ? Colors.error : Colors.muted} />}
                    />

                    <Text style={styles.inputLabel}>Court Type *</Text>
                    <TouchableOpacity
                        style={[styles.pickerButton, errors.type && styles.pickerError]}
                        onPress={() => setShowTypePicker(true)}
                    >
                        <View style={styles.pickerLeft}>
                            <Text style={[styles.pickerText, !type && styles.placeholderText]}>
                                {type || 'Select Type'}
                            </Text>
                        </View>
                        <ChevronDown size={18} color={errors.type ? Colors.error : Colors.muted} />
                    </TouchableOpacity>
                    {errors.type && <Text style={styles.errorTextSmall}>{errors.type}</Text>}

                    <Input
                        label="Price per Hour (₹) *"
                        placeholder="500"
                        value={price}
                        onChangeText={(val) => {
                            setPrice(val);
                            if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                        }}
                        error={errors.price}
                        keyboardType="numeric"
                        icon={<Text style={{ fontSize: 18, color: errors.price ? Colors.error : Colors.muted, fontWeight: 'bold' }}>₹</Text>}
                    />

                    <TouchableOpacity
                        style={styles.slotLink}
                        onPress={() => router.push({
                            pathname: '/modal/slots',
                            params: { id, complexId, name, type, price, description, slots: slotParam || JSON.stringify(selectedSlots) }
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
                        title={loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Court" : "Add Court")}
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
                onSelect={(val: string) => {
                    setComplexId(val);
                    if (errors.complexId) setErrors(prev => ({ ...prev, complexId: '' }));
                }}
                title="Select Complex"
                current={complexId}
                labelKey="name"
            />

            <SelectionModal
                visible={showTypePicker}
                onClose={() => setShowTypePicker(false)}
                data={COURT_TYPES}
                onSelect={(val: string) => {
                    setType(val);
                    if (errors.type) setErrors(prev => ({ ...prev, type: '' }));
                }}
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
    },
    pickerError: {
        borderColor: Colors.error,
    },
    errorTextSmall: {
        fontSize: 10,
        color: Colors.error,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.xs,
        marginLeft: 4,
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
