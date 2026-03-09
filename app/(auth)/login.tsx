import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { LogIn, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/Styles';
import { useAuth } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);
    const { loginWithGooglePopup, loginWithGoogleCredential } = useAuth();

    // Force the redirect URI to use the Android Package Name scheme that Google explicitly authorizes
    const redirectUri = makeRedirectUri({
        scheme: 'com.sreyaslbs.playbuddy'
    });

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: '224571215171-bdhlk4jekmeio6r0854eim6l7pnjr6os.apps.googleusercontent.com',
        webClientId: '224571215171-bdhlk4jekmeio6r0854eim6l7pnjr6os.apps.googleusercontent.com',
        androidClientId: '224571215171-aarv2sevm5c6fjcj1umqt5pr32jc7q0d.apps.googleusercontent.com',
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
    });

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            if (Platform.OS === 'web') {
                await loginWithGooglePopup();
                // AuthContext updates state, RootLayout handles redirect
            } else {
                // For Mobile (Native)
                if (request) {
                    const result = await promptAsync();
                    if (result.type === 'success') {
                        const idToken = result.authentication?.idToken || (result.params && result.params.id_token) || null;
                        const accessToken = result.authentication?.accessToken || (result.params && result.params.access_token) || null;

                        if (!idToken && !accessToken) {
                            throw new Error("No tokens. Payload: " + JSON.stringify(result));
                        }
                        await loginWithGoogleCredential(idToken, accessToken);
                    } else {
                        Alert.alert("Login Result Type", result.type);
                    }
                }
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

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
                    <Text style={styles.cardHeading}>Welcome</Text>
                    <Text style={styles.cardSubheading}>Sign in to discover and book sports venues around you</Text>

                    <Button
                        title={loading ? 'Signing in...' : 'Sign in with Google'}
                        onPress={handleGoogleLogin}
                        loading={loading}
                        variant="outline"
                        style={styles.googleButton}
                        icon={<LogIn size={20} color={Colors.primary} />}
                    />

                    <Text style={styles.helperText}>
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </Text>
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
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: Typography.size.xxxl,
        fontWeight: Typography.weight.bold,
        color: Colors.secondary,
    },
    subtitle: {
        fontSize: Typography.size.md,
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
    googleButton: {
        borderColor: Colors.border,
        paddingVertical: Spacing.md,
    },
    helperText: {
        fontSize: Typography.size.xs,
        color: Colors.muted,
        textAlign: 'center',
        marginTop: Spacing.xl,
    },
});
