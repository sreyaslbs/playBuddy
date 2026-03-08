import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDbdnejQ7XdBKTMrCcZerL6rCxI2joa6lU",
    authDomain: "play-buddy-app.firebaseapp.com",
    projectId: "play-buddy-app",
    storageBucket: "play-buddy-app.firebasestorage.app",
    messagingSenderId: "224571215171",
    appId: "1:224571215171:web:5232d2a1754e8ee1c7b3f6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
