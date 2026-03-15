import { useRouter } from 'expo-router';
import { Building2, Check, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@playbuddy/ui';
import { BorderRadius, Colors, Spacing, Typography } from '@playbuddy/ui';
import { useAuth } from '@playbuddy/shared';

export default function SelectRoleScreen() {
    const { setAccountRole } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'manager' | 'customer' | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        if (!selectedRole) {
            Alert.alert('Selection Required', 'Please select a role to continue.');
            return;
        }

        setLoading(true);
        try {
            await setAccountRole(selectedRole);
            // Redirection will be handled by RootLayout's useEffect
        } catch (error: any) {
            Alert.alert('Error', 'Failed to save role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Tell us about you</Text>
                    <Text style={styles.subtitle}>Choose how you want to use playBuddy. This cannot be changed later.</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.option, selectedRole === 'customer' && styles.selectedOption]}
                        onPress={() => setSelectedRole('customer')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, selectedRole === 'customer' && styles.selectedIconContainer]}>
                            <User size={32} color={selectedRole === 'customer' ? Colors.surface : Colors.primary} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionTitle, selectedRole === 'customer' && styles.selectedText]}>I'm a Player</Text>
                            <Text style={styles.optionDescription}>I want to discover venues and book slots for games.</Text>
                        </View>
                        {selectedRole === 'customer' && (
                            <View style={styles.checkContainer}>
                                <Check size={20} color={Colors.primary} />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.option, selectedRole === 'manager' && styles.selectedOption]}
                        onPress={() => setSelectedRole('manager')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, selectedRole === 'manager' && styles.selectedIconContainer]}>
                            <Building2 size={32} color={selectedRole === 'manager' ? Colors.surface : Colors.primary} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionTitle, selectedRole === 'manager' && styles.selectedText]}>I'm a Manager</Text>
                            <Text style={styles.optionDescription}>I want to list my sports complex and manage bookings.</Text>
                        </View>
                        {selectedRole === 'manager' && (
                            <View style={styles.checkContainer}>
                                <Check size={20} color={Colors.primary} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <Button
                    title={loading ? 'Saving...' : 'Continue'}
                    onPress={handleConfirm}
                    loading={loading}
                    disabled={!selectedRole}
                    style={styles.continueButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.xxl,
    },
    title: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.size.md,
        color: Colors.muted,
        textAlign: 'center',
        marginTop: Spacing.sm,
        lineHeight: 22,
    },
    optionsContainer: {
        gap: Spacing.lg,
        marginBottom: Spacing.xxl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.border,
        position: 'relative',
    },
    selectedOption: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '05',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    selectedIconContainer: {
        backgroundColor: Colors.primary,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    selectedText: {
        color: Colors.primary,
    },
    optionDescription: {
        fontSize: 13,
        color: Colors.muted,
        marginTop: 4,
        lineHeight: 18,
    },
    checkContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    continueButton: {
        marginTop: Spacing.md,
    },
});
