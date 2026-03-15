import { useAuth } from '@playbuddy/shared';
import { Button, Card, Colors, Input, Spacing, Typography } from '@playbuddy/ui';
import { Stack, useRouter } from 'expo-router';
import { Globe, Mail, MapPin, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PersonalInfoModal() {
    const { user, metadata, updateUserData, loading } = useAuth();
    const router = useRouter();

    const [displayName, setDisplayName] = useState(metadata?.displayName || user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [city, setCity] = useState(metadata?.defaultCity || '');
    const [state, setState] = useState(metadata?.defaultState || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            setIsSaving(true);
            await updateUserData({
                displayName: displayName.trim(),
                defaultCity: city.trim(),
                defaultState: state.trim()
            });
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Personal Information', headerShown: true }} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarCircle}>
                        <User size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.headerTitle}>Update Your Profile</Text>
                    <Text style={styles.headerSubtitle}>Keep your contact details up to date</Text>
                </View>

                <Card style={styles.formCard} variant="outlined">
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        icon={<User size={18} color={Colors.muted} />}
                    />

                    <Input
                        label="Email Address"
                        value={email}
                        editable={false}
                        icon={<Mail size={18} color={Colors.muted} />}
                        helperText="Email cannot be changed"
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="City"
                                placeholder="e.g. Mumbai"
                                value={city}
                                onChangeText={setCity}
                                icon={<MapPin size={18} color={Colors.muted} />}
                            />
                        </View>
                        <View style={{ width: Spacing.md }} />
                        <View style={{ flex: 1 }}>
                            <Input
                                label="State"
                                placeholder="e.g. MH"
                                value={state}
                                onChangeText={setState}
                                icon={<Globe size={18} color={Colors.muted} />}
                            />
                        </View>
                    </View>
                </Card>

                <Button
                    title={isSaving ? "Saving..." : "Save Changes"}
                    onPress={handleSave}
                    loading={isSaving}
                    style={styles.saveButton}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: Typography.size.lg,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    headerSubtitle: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginTop: 4,
    },
    formCard: {
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        marginTop: Spacing.sm,
    }
});
