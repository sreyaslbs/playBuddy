import { useAuth } from '@playbuddy/shared';
import { BorderRadius, Button, Colors, Input, Spacing, Typography } from '@playbuddy/ui';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, Trophy, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const { signUpWithEmail } = useAuth();
    const router = useRouter();

    const handleSignUp = async () => {
        if (!email || !password || !displayName) {
            setError('Please fill in all fields');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            await signUpWithEmail(email, password, displayName);
            setSuccess(true);
        } catch (err: any) {
            console.error('Sign up failed:', err);
            setError(err.message || 'An error occurred during sign up.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.scrollContent}>
                    <View style={styles.card}>
                        <View style={styles.successIcon}>
                            <Mail size={48} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardHeading}>Check your email</Text>
                        <Text style={styles.cardSubheading}>
                            We've sent a verification link to {email}. Please verify your email to continue.
                        </Text>
                        <Button
                            title="Back to Login"
                            onPress={() => router.push('/login')}
                            variant="primary"
                            style={{ width: '100%' }}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={Colors.secondary} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Trophy size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>playBuddy</Text>
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                <View style={styles.card}>
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        icon={<User size={18} color={Colors.muted} />}
                    />
                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={<Mail size={18} color={Colors.muted} />}
                    />
                    <Input
                        label="Password"
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Lock size={18} color={Colors.muted} />}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title={loading ? 'Creating account...' : 'Sign Up'}
                        onPress={handleSignUp}
                        loading={loading}
                        variant="primary"
                        style={styles.submitButton}
                    />

                    <TouchableOpacity 
                        style={styles.footerLink} 
                        onPress={() => router.push('/login')}
                    >
                        <Text style={styles.footerText}>
                            Already have an account? <Text style={styles.link}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
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
        flexGrow: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: Typography.size.xxl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    subtitle: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        marginTop: Spacing.xs,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeading: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    cardSubheading: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.size.xs,
        marginBottom: Spacing.md,
        textAlign: 'left',
    },
    successIcon: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    submitButton: {
        marginTop: Spacing.md,
    },
    footerLink: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
    },
    link: {
        color: Colors.primary,
        fontWeight: Typography.weight.bold,
    },
});
