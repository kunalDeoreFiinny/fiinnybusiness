import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { IS_DEMO } from './demoMode';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

if (!IS_DEMO) {
  const firebaseConfig = {
    apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
    authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'],
    projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
    storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'],
    appId: import.meta.env['VITE_FIREBASE_APP_ID'],
  };
  try {
    firebaseApp = initializeApp(firebaseConfig, 'krishidukan-shop-portal');
    auth = getAuth(firebaseApp);
  } catch (e) {
    console.warn('[firebase] init failed, falling back to demo mode', e);
  }
}

export { firebaseApp, auth };
