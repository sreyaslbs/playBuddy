import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/Styles';
import { Button } from '../../components/Button';
import { Clock, CheckCircle2 } from 'lucide-react-native';

export default function SlotsModal() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse initial slots if they exist
    const initialSlots = params.slots ? JSON.parse(params.slots as string) : [];
    const [selectedHours, setSelectedHours] = useState<number[]>(
        initialSlots.length > 0 ? initialSlots.map((s: any) => s.hour) : [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21, 22]
    );

    const toggleHour = (hour: number) => {
        setSelectedHours(prev =>
            prev.includes(hour)
                ? prev.filter(h => h !== hour)
                : [...prev, hour].sort((a, b) => a - b)
        );
    };

    const formatHour = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        return `${displayHour}:00 ${period}`;
    };

    const handleApply = () => {
        const slots = selectedHours.map(hour => ({
            hour,
            isAvailable: true
        }));

        // We navigate back and pass the data (Serialized)
        // In a real app, you might use a shared state or store
        router.push({
            pathname: '/modal/add-court',
            params: { ...params, slots: JSON.stringify(slots) }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Define Slots</Text>
                <Text style={styles.subtitle}>Select the hours when this court is open for booking.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {Array.from({ length: 24 }).map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.slotButton,
                                selectedHours.includes(i) && styles.activeSlot
                            ]}
                            onPress={() => toggleHour(i)}
                        >
                            <Text style={[
                                styles.slotText,
                                selectedHours.includes(i) && styles.activeSlotText
                            ]}>
                                {formatHour(i)}
                            </Text>
                            {selectedHours.includes(i) && (
                                <CheckCircle2 size={16} color={Colors.surface} style={styles.checkIcon} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.summaryText}>
                    {selectedHours.length} slots selected
                </Text>
                <Button
                    title="Apply Slots"
                    onPress={handleApply}
                    style={styles.applyButton}
                />
                <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
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
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    subtitle: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginTop: 4,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    slotButton: {
        width: '48%',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activeSlot: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    slotText: {
        fontSize: Typography.size.sm,
        color: Colors.secondary,
        fontWeight: Typography.weight.medium,
    },
    activeSlotText: {
        color: Colors.surface,
        fontWeight: Typography.weight.bold,
    },
    checkIcon: {
        marginLeft: 4,
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    summaryText: {
        textAlign: 'center',
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginBottom: Spacing.md,
    },
    applyButton: {
        width: '100%',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    cancelText: {
        color: Colors.muted,
        fontWeight: Typography.weight.medium,
    },
});
