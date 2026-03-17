import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
export const functions = getFunctions(app, 'asia-south1');

// ✅ Firebase Performance Monitoring (tracks page load, network calls)
export const perf = getPerformance(app);

// ✅ Firebase App Check (reCAPTCHA v3) — prevents API abuse
// Token gate on Firestore + Functions so bots can't query your data or run up AI costs
const recaptchaKey = (import.meta as any).env?.VITE_RECAPTCHA_KEY;
if (recaptchaKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  // In dev without the key: enable debug mode so local testing still works
  // Set self.FIREBASE_APPCHECK_DEBUG_TOKEN = true in browser console if needed
  if ((import.meta as any).env?.DEV) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
}
