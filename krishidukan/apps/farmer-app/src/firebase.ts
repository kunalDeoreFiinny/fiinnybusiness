import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain ?? 'lifemap-72b21.firebaseapp.com',
  projectId: extra.firebaseProjectId ?? 'lifemap-72b21',
  storageBucket: extra.firebaseStorageBucket ?? 'lifemap-72b21.appspot.com',
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

const APP_NAME = 'krishidukan-farmer';
const app = getApps().find(a => a.name === APP_NAME) ?? initializeApp(firebaseConfig, APP_NAME);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firebaseApp = app;
