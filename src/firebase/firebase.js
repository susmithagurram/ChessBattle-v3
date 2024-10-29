import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/* Firebase configuration for the project */
const firebaseConfig = {
    apiKey: "AIzaSyADuxjqKq7cp8Huo6uoOfKDLwYSIOkCjYQ",
    authDomain: "chess-battle-11ac7.firebaseapp.com",
    projectId: "chess-battle-11ac7",
    storageBucket: "chess-battle-11ac7.appspot.com",
    messagingSenderId: "1083516589527",
    appId: "1:1083516589527:web:d2268fb6ae5bb07c6de792",
};

/* Initializing Firebase app */
const app = initializeApp(firebaseConfig);

/* Exporting Firebase authentication and Google authentication provider */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/* Exporting Firestore instance */
export const firestore = getFirestore(app);

/* Exporting the Firebase app instance */
export default app;