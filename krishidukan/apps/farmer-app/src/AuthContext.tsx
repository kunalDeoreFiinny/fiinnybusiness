import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
  ApplicationVerifier,
} from 'firebase/auth';
import { auth } from './firebase';
import { kdApi, setKdToken } from './api';

interface AuthState {
  user: User | null;
  kdToken: string | null;
  loading: boolean;
  sendOtp: (phone: string, verifier: ApplicationVerifier) => Promise<string>;
  confirmOtp: (verificationId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [kdToken, setKdTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await kdApi.post<{ accessToken: string }>('/auth/login', { idToken });
          setKdToken(res.data.accessToken);
          setKdTokenState(res.data.accessToken);
        } catch {
          setKdToken(null);
          setKdTokenState(null);
        }
      } else {
        setKdToken(null);
        setKdTokenState(null);
      }
      setLoading(false);
    });
  }, []);

  async function sendOtp(phone: string, verifier: ApplicationVerifier): Promise<string> {
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phone, verifier);
    return verificationId;
  }

  async function confirmOtp(verificationId: string, code: string): Promise<void> {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    await signInWithCredential(auth, credential);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, kdToken, loading, sendOtp, confirmOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
