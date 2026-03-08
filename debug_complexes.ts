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
    console.log("Checking complexes...");
    const snap = await getDocs(collection(db, "complexes"));
    console.log("Total Complexes:", snap.size);
    snap.forEach(d => console.log("ID:", d.id, "Name:", d.data().name, "Manager:", d.data().managerId));
}

checkData();
