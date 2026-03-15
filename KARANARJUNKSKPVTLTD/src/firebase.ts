import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
    apiKey: "AIzaSyAaQ8tB11OBJyqGXEl55oeyQnVrOLrBrxE",
    authDomain: "karanarjun-pvt-ltd.firebaseapp.com",
    projectId: "karanarjun-pvt-ltd",
    storageBucket: "karanarjun-pvt-ltd.firebasestorage.app",
    messagingSenderId: "832154675525",
    appId: "1:832154675525:web:aadc29d24e4c962f85362c",
    measurementId: "G-70B3CNJVQM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
