import { useAuth } from '@playbuddy/shared';
import { BorderRadius, Button, Colors, Input, Spacing, Typography } from '@playbuddy/ui';
import { exchangeCodeAsync, makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Lock, LogIn, Mail, MailWarning, Trophy } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '224571215171-bdhlk4jekmeio6r0854eim6l7pnjr6os.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '224571215171-aarv2sevm5c6fjcj1umqt5pr32jc7q0d.apps.googleusercontent.com';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, loginWithGooglePopup, loginWithGoogleCredential, loginWithEmail, sendVerificationEmail, refreshUser, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Login Screen user state effect. User:', user?.email, 'Verified:', user?.emailVerified);
        if (user && user.emailVerified) {
            console.log('User is verified, navigating to dashboard...');
            router.replace('/');
        }
    }, [user, router]);

    // Force the redirect URI to use the Android Package Name scheme that Google explicitly authorizes
    const redirectUri = makeRedirectUri({
        scheme: 'com.sreyaslbs.playbuddy'
    });

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: Platform.OS === 'android' ? ANDROID_CLIENT_ID : WEB_CLIENT_ID,
        webClientId: WEB_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        prompt: 'select_account' as any,
 // Force account selection to avoid session persistence issues
    });

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            if (Platform.OS === 'web') {
                await loginWithGooglePopup();
            } else {
                // For Mobile (Native)
                if (request) {
                    const result = await promptAsync({ showInRecents: true });
                    if (result.type === 'success') {
                        // Try idToken from authentication object first (implicit flow)
                        const idToken = result.authentication?.idToken || result.params?.id_token || null;
                        const accessToken = result.authentication?.accessToken || result.params?.access_token || null;

                        if (idToken || accessToken) {
                            // We got tokens directly — pass them to Firebase
                            await loginWithGoogleCredential(idToken, accessToken);
                        } else if (result.params?.code) {
                            // Google returned Authorization Code — exchange it for real tokens
                            const currentClientId = Platform.OS === 'android' ? ANDROID_CLIENT_ID : WEB_CLIENT_ID;
                            const tokenResponse = await exchangeCodeAsync(
                                {
                                    clientId: currentClientId,
                                    code: result.params.code,
                                    redirectUri,
                                    extraParams: request.codeVerifier
                                        ? { code_verifier: request.codeVerifier }
                                        : undefined,
                                },
                                { tokenEndpoint: 'https://oauth2.googleapis.com/token' }
                            );
                            const exchangedIdToken = tokenResponse.idToken || null;
                            const exchangedAccessToken = tokenResponse.accessToken || null;
                            await loginWithGoogleCredential(exchangedIdToken, exchangedAccessToken);
                        } else {
                            throw new Error('No tokens or code received from Google.');
                        }
                    } else if (result.type !== 'dismiss') {
                        setError(`Login cancelled or failed: ${result.type}`);
                    }
                }
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await loginWithEmail(email, password);
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            await sendVerificationEmail();
            Alert.alert('Success', 'Verification email sent!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    if (user && !user.emailVerified) {
        return (
            <View style={styles.container}>
                <View style={styles.scrollContent}>
                    <View style={styles.card}>
                        <View style={styles.warningIcon}>
                            <MailWarning size={48} color={Colors.warning || '#ffcc00'} />
                        </View>
                        <Text style={styles.cardHeading}>Verify your email</Text>
                        <Text style={styles.cardSubheading}>
                            Please verify your email to access your account. Check your inbox for the verification link.
                        </Text>
                        <View style={styles.buttonGroup}>
                            <Button
                                title="I've Verified My Email"
                                onPress={refreshUser}
                                variant="primary"
                            />
                            <Button
                                title="Resend Verification"
                                onPress={handleResendVerification}
                                variant="outline"
                                style={{ marginTop: Spacing.md }}
                            />
                            <Button
                                title="Sign Out"
                                onPress={logout}
                                variant="ghost"
                                style={{ marginTop: Spacing.md }}
                            />
                        </View>
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
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Trophy size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>playBuddy</Text>
                    <Text style={styles.subtitle}>Your Ultimate Sports Partner</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardHeading}>Welcome Back</Text>
                    <Text style={styles.cardSubheading}>Sign in to manage your sports bookings</Text>

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
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Lock size={18} color={Colors.muted} />}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title={loading ? 'Signing in...' : 'Sign In'}
                        onPress={handleEmailLogin}
                        loading={loading}
                        variant="primary"
                        style={styles.submitButton}
                    />

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Button
                        title="Continue with Google"
                        onPress={handleGoogleLogin}
                        loading={loading}
                        variant="outline"
                        style={styles.googleButton}
                        icon={<LogIn size={20} color={Colors.primary} />}
                    />

                    <TouchableOpacity 
                        style={styles.footerLink} 
                        onPress={() => router.push('/signup')}
                    >
                        <Text style={styles.footerText}>
                            Don't have an account? <Text style={styles.link}>Sign Up</Text>
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
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
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
    },
    cardSubheading: {
        fontSize: Typography.size.sm,
        color: Colors.muted,
        textAlign: 'center',
        marginTop: Spacing.xs,
        marginBottom: Spacing.xl,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.size.xs,
        marginBottom: Spacing.md,
        textAlign: 'left',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: 4,
        marginBottom: Spacing.xxl,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderRadius: BorderRadius.sm,
    },
    activeTab: {
        backgroundColor: Colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.medium,
        color: Colors.muted,
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: Typography.weight.semiBold,
    },
    submitButton: {
        marginTop: Spacing.sm,
    },
    googleButton: {
        borderColor: Colors.border,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        paddingHorizontal: Spacing.md,
        fontSize: Typography.size.xs,
        color: Colors.muted,
        textTransform: 'uppercase',
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
    warningIcon: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    buttonGroup: {
        marginTop: Spacing.xl,
    },
});
