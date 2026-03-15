import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithCredential,
    signInWithEmailAndPassword,
    signInWithPopup,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../constants/Firebase';

type UserRole = 'manager' | 'customer' | null;

interface UserMetadata {
    role: UserRole;
    defaultCity?: string;
    defaultState?: string;
    displayName?: string;
    email?: string;
    favorites?: string[]; // Array of complex IDs
}

interface AuthContextType {
    user: User | null;
    role: UserRole;
    metadata: UserMetadata | null;
    loading: boolean;
    loginWithGooglePopup: () => Promise<void>;
    loginWithGoogleCredential: (idToken: string | null, accessToken?: string | null) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setAccountRole: (selectedRole: UserRole) => Promise<void>;
    updateUserData: (data: Partial<UserMetadata>) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    metadata: null,
    loading: true,
    loginWithGooglePopup: async () => { },
    loginWithGoogleCredential: async () => { },
    signUpWithEmail: async () => { },
    loginWithEmail: async () => { },
    sendVerificationEmail: async () => { },
    refreshUser: async () => { },
    setAccountRole: async () => { },
    updateUserData: async () => { },
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [metadata, setMetadata] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserMetadata = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data() as UserMetadata;
                setMetadata(data);
                setRole(data.role);
                return data;
            }
            return null;
        } catch (error) {
            console.error("Error fetching user metadata:", error);
            return null;
        }
    };

    useEffect(() => {
        console.log('Setting up onAuthStateChanged listener');
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('onAuthStateChanged triggered. User:', currentUser?.email, 'Verified:', currentUser?.emailVerified);
            setLoading(true);
            if (currentUser && currentUser.emailVerified) {
                console.log('User is verified, fetching metadata...');
                setUser(currentUser);
                await fetchUserMetadata(currentUser.uid);
            } else if (currentUser && !currentUser.emailVerified) {
                console.log('User is NOT verified. Restricting access.');
                setUser(currentUser); // Still set user so we can access user.emailVerified in UI
                setRole(null);
                setMetadata(null);
            } else {
                console.log('No user signed in.');
                setUser(null);
                setRole(null);
                setMetadata(null);
            }
            setLoading(false);
            console.log('onAuthStateChanged processing complete.');
        });

        return unsubscribe;
    }, []);

    const handleUserRegistration = async (user: User, displayName?: string) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const data: any = {
                displayName: displayName || user.displayName || '',
                email: user.email || '',
                createdAt: new Date().toISOString(),
                role: null // Role will be selected later
            };
            await setDoc(userDocRef, data);
            setRole(null);
            setMetadata(data);
        } else {
            const data = userDoc.data() as UserMetadata;
            setRole(data.role);
            setMetadata(data);
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            console.log('Starting sign-up for:', email);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created successfully:', result.user.uid);
            
            try {
                await sendEmailVerification(result.user);
                console.log('Verification email sent to:', email);
            } catch (emailError: any) {
                console.error('Failed to send verification email:', emailError);
                // We don't throw here to allow user creation to complete, 
                // but we might want to inform the user they can resend it later.
            }
            
            await handleUserRegistration(result.user, displayName);
        } catch (error: any) {
            console.error('Firebase Auth Error (SignUp):', error.code, error.message);
            let message = 'An error occurred during sign up.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'This email is already in use. Please try logging in or use a different email.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'The email address is invalid.';
            } else if (error.code === 'auth/weak-password') {
                message = 'The password is too weak. Please use at least 6 characters.';
            } else if (error.code === 'auth/operation-not-allowed') {
                message = 'Email/Password sign-up is currently disabled in the Firebase Console. Please enable it under Authentication > Sign-in method.';
            } else {
                message = `Sign up failed: ${error.message || error.code || 'Unknown error'}`;
            }
            throw new Error(message);
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            console.log('Attempting login for:', email);
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log('Firebase login successful. UID:', result.user.uid, 'Verified:', result.user.emailVerified);
            
            await handleUserRegistration(result.user);
            console.log('User registration/metadata check complete.');
        } catch (error: any) {
            console.error('Firebase Auth Error (Login):', error.code, error.message);
            let message = 'Invalid email or password.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = 'Invalid email or password.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed login attempts. Please try again later.';
            } else {
                message = `Login failed: ${error.message || error.code || 'Unknown error'}`;
            }
            throw new Error(message);
        }
    };

    const sendVerificationEmail = async () => {
        if (auth.currentUser) {
            try {
                console.log('Sending verification email to:', auth.currentUser.email);
                await sendEmailVerification(auth.currentUser);
                console.log('Verification email successfully sent');
            } catch (error: any) {
                console.error('Error in sendVerificationEmail:', error.code, error.message);
                throw error;
            }
        } else {
            console.warn('Cannot send verification email: No current user signed in');
        }
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            const currentUser = auth.currentUser;
            setUser(currentUser);
            if (currentUser.emailVerified) {
                await fetchUserMetadata(currentUser.uid);
            }
        }
    };

    const setAccountRole = async (selectedRole: UserRole) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { role: selectedRole }, { merge: true });
            setRole(selectedRole);
            setMetadata(prev => prev ? { ...prev, role: selectedRole } : { role: selectedRole });
        } catch (error) {
            console.error("Error setting account role:", error);
            throw error;
        }
    };

    const updateUserData = async (newData: Partial<UserMetadata>) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, newData, { merge: true });
            setMetadata(prev => prev ? { ...prev, ...newData } : null);
            if (newData.role) setRole(newData.role);
        } catch (error) {
            console.error("Error updating user data:", error);
            throw error;
        }
    };

    const loginWithGooglePopup = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await handleUserRegistration(result.user);
    };

    const loginWithGoogleCredential = async (idToken: string | null, accessToken?: string | null) => {
        // Firebase allows logging in with an access token if id token fails or is omitted
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        const result = await signInWithCredential(auth, credential);
        await handleUserRegistration(result.user);
    };

    const logout = () => auth.signOut();

    return (
        <AuthContext.Provider value={{
            user,
            role,
            metadata,
            loading,
            loginWithGooglePopup,
            loginWithGoogleCredential,
            signUpWithEmail,
            loginWithEmail,
            sendVerificationEmail,
            refreshUser,
            setAccountRole,
            updateUserData,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
