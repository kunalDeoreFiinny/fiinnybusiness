import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyABuimmTbHwrxY-w7xhRrf-LWOu4gLVfnk",
    authDomain: "lifemap-72b21.firebaseapp.com",
    projectId: "lifemap-72b21",
    storageBucket: "lifemap-72b21.firebasestorage.app",
    messagingSenderId: "1085936196639",
    appId: "1:1085936196639:web:b74ffa7e9ded49e616492a",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
