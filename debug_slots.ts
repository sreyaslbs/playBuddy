import { db } from './constants/Firebase';
import { collection, getDocs } from 'firebase/firestore';

async function debugCourts() {
    console.log("--- DEBUG: Fetching all courts ---");
    const snapshot = await getDocs(collection(db, 'courts'));
    console.log(`Total courts found: ${snapshot.size}`);

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`Court ID: ${doc.id}`);
        console.log(`Name: ${data.name}`);
        console.log(`Slots defined: ${data.slots ? data.slots.length : 'UNDEFINED'}`);
        if (data.slots) {
            console.log(`Slots: ${JSON.stringify(data.slots)}`);
        }
        console.log('------------------');
    });
}

debugCourts();
