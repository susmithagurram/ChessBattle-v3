import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyADuxjqKq7cp8Huo6uoOfKDLwYSIOkCjYQ",
    authDomain: "chess-battle-11ac7.firebaseapp.com",
    projectId: "chess-battle-11ac7",
    storageBucket: "chess-battle-11ac7.appspot.com",
    messagingSenderId: "1083516589527",
    appId: "1:1083516589527:web:d2268fb6ae5bb07c6de792",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);

export default app;