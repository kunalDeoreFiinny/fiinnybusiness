'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  sendOtp as firebaseSendOtp,
  verifyOtp as firebaseVerifyOtp,
  logoutUser,
} from '../firebase/auth';
import { getOrCreateUser, getUserById } from '../services/userService';
import { getRetailerByPhone, getRetailerById } from '../services/retailerService';
import { setAuthToken } from '../api';
import { IS_DEMO, DEMO_USER, DEMO_SHOP, DEMO_ROLE } from '../demoMode';
import type { UserDoc } from '../types/firebase';
import { ShopStatus, UserRole } from '../types/shared';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ShopInfo {
  id: string;
  businessName: string;
  status: ShopStatus;
}

type AnyUser = User | typeof DEMO_USER;

interface DemoConfirmation {
  __demo: true;
  phone: string;
}

type AnyConfirmation = ConfirmationResult | DemoConfirmation;

interface AuthState {
  user: AnyUser | null;
  userDoc: UserDoc | null;
  token: string | null;
  role: UserRole | null;
  shop: ShopInfo | null;
  loading: boolean;
  sendOtp: (phone: string, recaptchaContainerId: string) => Promise<AnyConfirmation>;
  confirmOtp: (result: AnyConfirmation, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshShop: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
const DEMO_LS_KEY = 'kd_demo_shop_logged_in';

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Auth state listener ──
  useEffect(() => {
    if (IS_DEMO) {
      if (localStorage.getItem(DEMO_LS_KEY) === '1') {
        loginDemo();
      }
      setLoading(false);
      return;
    }
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          setAuthToken(idToken);

          // Ensure user document exists in Firestore
          const phone = firebaseUser.phoneNumber ?? '';
          const firestoreUser = await getOrCreateUser(firebaseUser.uid, phone);
          setUserDoc(firestoreUser);
          setRole(firestoreUser.role === 'admin' ? UserRole.ADMIN : UserRole.SHOP_OWNER);

          // Try to load linked retailer/shop
          if (firestoreUser.retailerId) {
            await loadShop();
          } else {
            // Fallback: find retailer by phone number
            const retailer = await getRetailerByPhone(phone).catch(() => null);
            if (retailer) {
              setShop({
                id: retailer.id,
                businessName: retailer.data.shopName,
                status: retailer.data.approved ? ShopStatus.ACTIVE : ShopStatus.PENDING_REVIEW,
              });
            }
          }
        } catch {
          setToken(null);
          setRole(null);
          setUserDoc(null);
          setAuthToken(null);
        }
      } else {
        setToken(null);
        setRole(null);
        setShop(null);
        setUserDoc(null);
        setAuthToken(null);
      }
      setLoading(false);
    });
  }, []);

  // ── Demo mode helpers ──
  function loginDemo() {
    setUser(DEMO_USER);
    setToken('demo-jwt');
    setRole(DEMO_ROLE);
    setShop(DEMO_SHOP);
    setAuthToken('demo-jwt');
    localStorage.setItem(DEMO_LS_KEY, '1');
  }

  async function loadShop() {
    try {
      // Read from Firestore — get user's linked retailer
      const currentUser = auth?.currentUser;
      if (!currentUser) return;
      const userDocData = await getUserById(currentUser.uid);
      if (userDocData?.retailerId) {
        const retailer = await getRetailerById(userDocData.retailerId);
        if (retailer) {
          setShop({
            id: userDocData.retailerId,
            businessName: retailer.shopName,
            status: retailer.approved ? ShopStatus.ACTIVE : ShopStatus.PENDING_REVIEW,
          });
          return;
        }
      }
      setShop(null);
    } catch {
      setShop(null);
    }
  }

  // ── OTP flow ──
  async function sendOtp(phone: string, recaptchaContainerId: string): Promise<AnyConfirmation> {
    if (IS_DEMO) {
      return { __demo: true, phone };
    }
    return firebaseSendOtp(phone, recaptchaContainerId);
  }

  async function confirmOtp(result: AnyConfirmation, otp: string) {
    if (IS_DEMO || (result as DemoConfirmation).__demo) {
      if (otp.length !== 6) throw new Error('Invalid OTP');
      loginDemo();
      return;
    }
    await firebaseVerifyOtp(result as ConfirmationResult, otp);
    // onAuthStateChanged will handle Firestore user creation
  }

  // ── Logout ──
  async function logout() {
    if (IS_DEMO) {
      localStorage.removeItem(DEMO_LS_KEY);
      setUser(null);
      setToken(null);
      setRole(null);
      setShop(null);
      setUserDoc(null);
      setAuthToken(null);
      return;
    }
    await logoutUser();
  }

  // ── Refresh shop data ──
  async function refreshShop() {
    if (IS_DEMO) {
      setShop(DEMO_SHOP);
      return;
    }
    await loadShop();
  }

  return (
    <AuthContext.Provider
      value={{ user, userDoc, token, role, shop, loading, sendOtp, confirmOtp, logout, refreshShop }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth state. Must be inside <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
