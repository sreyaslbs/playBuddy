import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDbdnejQ7XdBKTMrCcZerL6rCxI2joa6lU",
    authDomain: "play-buddy-app.firebaseapp.com",
    projectId: "play-buddy-app",
    storageBucket: "play-buddy-app.firebasestorage.app",
    messagingSenderId: "224571215171",
    appId: "1:224571215171:web:5232d2a1754e8ee1c7b3f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
    try {
        const querySnapshot = await getDocs(collection(db, "complexes"));
        console.log("Found", querySnapshot.size, "complexes.");
        querySnapshot.forEach((doc) => {
            console.log(doc.id, "=>", doc.data());
        });

        const courtsSnapshot = await getDocs(collection(db, "courts"));
        console.log("Found", courtsSnapshot.size, "courts.");
        courtsSnapshot.forEach((doc) => {
            console.log(doc.id, "=>", doc.data());
        });
    } catch (e) {
        console.error("Error reading data:", e);
    }
}

checkData();
