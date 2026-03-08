import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
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
}

interface AuthContextType {
    user: User | null;
    role: UserRole;
    metadata: UserMetadata | null;
    loading: boolean;
    loginWithGooglePopup: () => Promise<void>;
    loginWithGoogleCredential: (idToken: string) => Promise<void>;
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
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            setUser(currentUser);
            if (currentUser) {
                await fetchUserMetadata(currentUser.uid);
            } else {
                setRole(null);
                setMetadata(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleUserRegistration = async (user: User) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const data: any = {
                displayName: user.displayName || '',
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

    const loginWithGoogleCredential = async (idToken: string) => {
        const credential = GoogleAuthProvider.credential(idToken);
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
            setAccountRole,
            updateUserData,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
