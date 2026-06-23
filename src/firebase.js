import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDuzZDZ655VWDE4ldL63F4azTyanXjCZx4",
    authDomain: "friendex-a9a71.firebaseapp.com",
    projectId: "friendex-a9a71",
    storageBucket: "friendex-a9a71.firebasestorage.app",
    messagingSenderId: "1000444798111",
    appId: "1:1000444798111:web:650f984ab10efcb4e6eeaa",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestoreDb = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
