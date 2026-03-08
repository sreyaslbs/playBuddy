import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../constants/Firebase';
import { useAuth } from './AuthContext';

export interface Complex {
    id: string;
    name: string;
    address: string;
    landmark: string;
    city: string;
    state: string;
    managerId: string;
    createdAt: any;
}

export interface Court {
    id: string;
    complexId: string;
    name: string;
    type: string;
    price: number; // In INR
    description?: string;
    rating: number;
    slots?: Slot[];
    managerId: string;
    createdAt: any;
}

export interface Slot {
    hour: number; // 0-23
    isAvailable: boolean;
    price?: number; // Override price per slot if needed
}

export interface Booking {
    id: string;
    courtId: string;
    courtName: string;
    customerId: string;
    customerName: string;
    startTime: any;
    endTime: any;
    date: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
    price: number;
}

interface DataContextType {
    complexes: Complex[];
    courts: Court[];
    bookings: Booking[];
    loading: boolean;
    addComplex: (complex: Omit<Complex, 'id' | 'managerId' | 'createdAt'>) => Promise<void>;
    addCourt: (court: Omit<Court, 'id' | 'managerId' | 'createdAt' | 'rating'>) => Promise<void>;
    deleteCourt: (courtId: string) => Promise<void>;
    deleteComplex: (complexId: string) => Promise<void>;
    addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
    complexes: [],
    courts: [],
    bookings: [],
    loading: true,
    addComplex: async () => { },
    addCourt: async () => { },
    deleteCourt: async () => { },
    deleteComplex: async () => { },
    addBooking: async () => { },
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role } = useAuth();
    const [complexes, setComplexes] = useState<Complex[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Listen to Complexes
    useEffect(() => {
        if (!user || !role) {
            console.log("DataContext: No user or role found, skipping complexes listener");
            return;
        }

        console.log(`DataContext: Setting up complexes listener for role: ${role}`);

        let q;
        if (role === 'manager') {
            // Managers only see their own complexes
            q = query(collection(db, 'complexes'), where('managerId', '==', user.uid));
        } else {
            // Customers see ALL complexes (to find any court)
            q = query(collection(db, 'complexes'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("DataContext: Complexes snapshot received, count:", snapshot.size);
            const complexData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Complex[];
            setComplexes(complexData);
        }, (error) => {
            console.error("Complexes listener error:", error);
        });
        return unsubscribe;
    }, [user, role]);

    // Listen to Courts
    useEffect(() => {
        const q = query(collection(db, 'courts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const courtsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Court[];
            console.log("DataContext: Courts fetched:", courtsData.length);
            if (courtsData.length > 0) {
                console.log(`Debug: Court ${courtsData[0].name} structure:`, JSON.stringify(courtsData[0].slots || []));
            }
            setCourts(courtsData);
            setLoading(false);
        }, (error) => {
            console.error("Courts listener error:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Listen to Bookings (based on role)
    useEffect(() => {
        if (!user || !role) return;

        let q;
        if (role === 'manager') {
            // Managers see all bookings for their complexes 
            // (Simplified: showing all bookings they are managers of via courtId lookup would be ideal, 
            // but for now showing all is fine as they are the only managers)
            q = query(collection(db, 'bookings'));
        } else {
            // Customers see:
            // 1. Their own bookings (any status)
            // 2. ALL 'Confirmed' bookings (to check availability globally)
            // For now, let's fetch ALL 'Confirmed' bookings so they can see availability.
            // Note: In a production app, you'd filter this more strictly by courtId/date.
            q = query(
                collection(db, 'bookings'),
                where('status', '==', 'Confirmed')
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Booking[];

            // If customer, we also need to make sure their OWN non-confirmed bookings are included
            // but for simplicity of the "check availability" logic, 'Confirmed' is what matters.
            setBookings(bookingsData);
        }, (error) => {
            console.error("Bookings listener error:", error);
        });

        return unsubscribe;
    }, [user, role]);

    const addComplex = async (complexData: Omit<Complex, 'id' | 'managerId' | 'createdAt'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'complexes'), {
                ...complexData,
                managerId: user.uid,
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error adding complex:", error);
            throw error;
        }
    };

    const addCourt = async (courtData: Omit<Court, 'id' | 'managerId' | 'createdAt' | 'rating'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'courts'), {
                ...courtData,
                managerId: user.uid,
                rating: 5.0,
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error adding court:", error);
            throw error;
        }
    };

    const deleteCourt = async (courtId: string) => {
        console.log(`[DEBUG] DataContext: deleteCourt entering for ID: ${courtId}`);
        if (!user || role !== 'manager') {
            console.error("DataContext: Unauthorized attempt to delete court");
            throw new Error("Unauthorized: Only managers can delete courts.");
        }
        try {
            await deleteDoc(doc(db, 'courts', courtId));
            console.log(`DataContext: Court ${courtId} deleted successfully`);
        } catch (error) {
            console.error("Error deleting court:", error);
            throw error;
        }
    };

    const deleteComplex = async (complexId: string) => {
        console.log(`[DEBUG] DataContext: deleteComplex entering for ID: ${complexId}`);
        if (!user || role !== 'manager') {
            console.error("DataContext: Unauthorized attempt to delete complex");
            throw new Error("Unauthorized: Only managers can delete complexes.");
        }
        // Simple delete for now, in prod you'd want to also delete its courts
        try {
            await deleteDoc(doc(db, 'complexes', complexId));
            console.log(`DataContext: Complex ${complexId} deleted successfully`);
        } catch (error) {
            console.error("Error deleting complex:", error);
            throw error;
        }
    };

    const addBooking = async (bookingData: Omit<Booking, 'id' | 'status'>) => {
        try {
            await addDoc(collection(db, 'bookings'), {
                ...bookingData,
                status: 'Confirmed',
                createdAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error adding booking:", error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{ complexes, courts, bookings, loading, addComplex, addCourt, deleteCourt, deleteComplex, addBooking }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
