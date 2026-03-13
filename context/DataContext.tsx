import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
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
    managerId: string;
    complexId?: string;
    complexName?: string;
    bookingType?: 'customer' | 'manager_behalf' | 'maintenance';
}

interface DataContextType {
    complexes: Complex[];
    courts: Court[];
    bookings: Booking[];
    availabilityBookings: Booking[];
    loading: boolean;
    addComplex: (complex: Omit<Complex, 'id' | 'managerId' | 'createdAt'>) => Promise<void>;
    addCourt: (court: Omit<Court, 'id' | 'managerId' | 'createdAt' | 'rating'>) => Promise<void>;
    deleteCourt: (courtId: string) => Promise<void>;
    deleteComplex: (complexId: string) => Promise<void>;
    updateComplex: (id: string, complex: Partial<Omit<Complex, 'id' | 'managerId' | 'createdAt'>>) => Promise<void>;
    updateCourt: (id: string, court: Partial<Omit<Court, 'id' | 'managerId' | 'createdAt' | 'rating'>>) => Promise<void>;
    addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
    complexes: [],
    courts: [],
    bookings: [],
    availabilityBookings: [],
    loading: true,
    addComplex: async () => { },
    addCourt: async () => { },
    deleteCourt: async () => { },
    deleteComplex: async () => { },
    updateComplex: async () => { },
    updateCourt: async () => { },
    addBooking: async () => { },
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role } = useAuth();
    const [complexes, setComplexes] = useState<Complex[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [availabilityBookings, setAvailabilityBookings] = useState<Booking[]>([]);
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
        if (!user || !role) return;

        let q;
        if (role === 'manager') {
            // Remove orderBy to avoid requiring a composite index (managerId + createdAt)
            q = query(collection(db, 'courts'), where('managerId', '==', user.uid));
        } else {
            q = query(collection(db, 'courts'), orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`DataContext: Courts snapshot received. Count: ${snapshot.size}`);
            const courtsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Court[];
            
            // Sort in memory for managers since we removed orderBy from query
            if (role === 'manager') {
                courtsData.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });
            }

            setCourts(courtsData);
            setLoading(false);
        }, (error) => {
            console.error("Courts listener error:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user, role]);

    // Listen to Bookings (based on role - for Dashboard/History)
    useEffect(() => {
        if (!user || !role) return;

        let q;
        if (role === 'manager') {
            // Managers see bookings where they are the manager
            q = query(collection(db, 'bookings'), where('managerId', '==', user.uid));
        } else {
            // Customers see their own bookings
            q = query(collection(db, 'bookings'), where('customerId', '==', user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Booking[];
            setBookings(bookingsData);
        }, (error) => {
            console.error("Bookings listener error:", error);
        });

        return unsubscribe;
    }, [user, role]);

    // Listen to ALL Confirmed Bookings (only for Customers - for availability checking)
    useEffect(() => {
        if (!user || role !== 'customer') return;

        const q = query(
            collection(db, 'bookings'),
            where('status', '==', 'Confirmed')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Booking[];
            setAvailabilityBookings(bookingsData);
        }, (error) => {
            console.error("Availability Bookings listener error:", error);
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

    const updateComplex = async (id: string, complexData: Partial<Omit<Complex, 'id' | 'managerId' | 'createdAt'>>) => {
        if (!user || role !== 'manager') throw new Error("Unauthorized");
        try {
            await updateDoc(doc(db, 'complexes', id), {
                ...complexData,
                updatedAt: Timestamp.now()
            });
            console.log(`DataContext: Complex ${id} updated successfully`);
        } catch (error) {
            console.error("Error updating complex:", error);
            throw error;
        }
    };

    const updateCourt = async (id: string, courtData: Partial<Omit<Court, 'id' | 'managerId' | 'createdAt' | 'rating'>>) => {
        if (!user || role !== 'manager') throw new Error("Unauthorized");
        try {
            await updateDoc(doc(db, 'courts', id), {
                ...courtData,
                updatedAt: Timestamp.now()
            });
            console.log(`DataContext: Court ${id} updated successfully`);
        } catch (error) {
            console.error("Error updating court:", error);
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
        <DataContext.Provider value={{
            complexes,
            courts,
            bookings,
            availabilityBookings,
            loading,
            addComplex,
            addCourt,
            deleteCourt,
            deleteComplex,
            updateComplex,
            updateCourt,
            addBooking
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
