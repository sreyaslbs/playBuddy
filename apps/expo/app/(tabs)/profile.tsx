import { useAuth } from '@playbuddy/shared';
import { BorderRadius, Card, Colors, Spacing, Typography } from '@playbuddy/ui';
import { useRouter } from 'expo-router';
import { Bell, Building2, ChevronRight, CreditCard, History, LogOut, MapPin, Settings, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, role, metadata, logout } = useAuth();
    const router = useRouter();

    const ProfileItem = ({ icon: Icon, label, onPress, color = Colors.secondary }: any) => (
        <TouchableOpacity style={styles.profileItem} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                    <Icon size={20} color={color} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>
            <ChevronRight size={20} color={Colors.border} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarBox}>
                    <User size={40} color={Colors.muted} />
                </View>
                <Text style={styles.userName}>{metadata?.displayName || user?.displayName || 'Sports Enthusiast'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                
                {(metadata?.defaultCity || metadata?.defaultState) && (
                    <View style={styles.locationRow}>
                        <MapPin size={12} color={Colors.muted} />
                        <Text style={styles.locationText}>
                            {metadata.defaultCity}{metadata.defaultCity && metadata.defaultState ? ', ' : ''}{metadata.defaultState}
                        </Text>
                    </View>
                )}

                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{role === 'manager' ? 'Court Manager' : 'Player'}</Text>
                </View>
            </View>

            {role === 'manager' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Court Management</Text>
                    <Card style={styles.card} variant="outlined">
                        <ProfileItem
                            icon={Building2}
                            label="Add Sports Complex"
                            color={Colors.primary}
                            onPress={() => router.push('/modal/complex')}
                        />
                    </Card>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>My Activity</Text>
                <Card style={styles.card} variant="outlined">
                    <ProfileItem 
                        icon={History} 
                        label="Past Bookings" 
                        onPress={() => router.push('/modal/past-bookings')}
                    />
                </Card>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Settings</Text>
                <Card style={styles.card} variant="outlined">
                    <ProfileItem 
                        icon={User} 
                        label="Personal Information" 
                        onPress={() => router.push('/modal/personal-info')}
                    />
                    <ProfileItem icon={CreditCard} label="Payment Methods" />
                    <ProfileItem icon={Bell} label="Notifications" />
                    <ProfileItem icon={Settings} label="Preferences" />
                </Card>
            </View>

            <View style={styles.section}>
                <Card style={styles.card} variant="outlined">
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <LogOut size={20} color={Colors.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </Card>
            </View>

            <Text style={styles.versionText}>playBuddy v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        backgroundColor: Colors.surface,
    },
    avatarBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 4,
        borderColor: Colors.border,
    },
    userName: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    userEmail: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    locationText: {
        fontSize: Typography.size.xs,
        color: Colors.muted,
    },
    roleBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.md,
    },
    roleText: {
        fontSize: 10,
        fontWeight: Typography.weight.bold,
        color: Colors.primary,
        textTransform: 'uppercase',
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        marginBottom: Spacing.md,
    },
    card: {
        padding: 0,
    },
    profileItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: Typography.size.md,
        color: Colors.secondary,
        fontWeight: Typography.weight.medium,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    logoutText: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
        color: Colors.error,
    },
    versionText: {
        textAlign: 'center',
        color: Colors.muted,
        fontSize: Typography.size.xs,
        marginBottom: Spacing.xxl,
    },
});
