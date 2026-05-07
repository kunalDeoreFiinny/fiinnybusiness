import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult,
  onAuthStateChanged, signOut, User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { api, setAuthToken } from '../api';
import { ShopStatus, UserRole } from '@krishidukan/shared';
import { IS_DEMO, DEMO_USER, DEMO_SHOP, DEMO_ROLE } from '../demoMode';

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
  token: string | null;
  role: UserRole | null;
  shop: ShopInfo | null;
  loading: boolean;
  sendOtp: (phone: string, recaptchaContainerId: string) => Promise<AnyConfirmation>;
  confirmOtp: (result: AnyConfirmation, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshShop: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const DEMO_LS_KEY = 'kd_demo_shop_logged_in';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO) {
      if (localStorage.getItem(DEMO_LS_KEY) === '1') {
        loginDemo();
      }
      setLoading(false);
      return;
    }
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await api.post<{ accessToken: string; role: UserRole; shopId: string | null }>(
            '/auth/login', { idToken },
          );
          const kdToken = res.data.accessToken;
          setToken(kdToken);
          setRole(res.data.role);
          setAuthToken(kdToken);

          if (res.data.shopId) {
            await loadShop();
          }
        } catch {
          setToken(null);
          setRole(null);
          setAuthToken(null);
        }
      } else {
        setToken(null);
        setRole(null);
        setShop(null);
        setAuthToken(null);
      }
      setLoading(false);
    });
  }, []);

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
      const res = await api.get<ShopInfo>('/shops/me');
      setShop(res.data);
    } catch {
      setShop(null);
    }
  }

  async function sendOtp(phone: string, recaptchaContainerId: string): Promise<AnyConfirmation> {
    if (IS_DEMO) {
      return { __demo: true, phone };
    }
    if (!auth) throw new Error('Firebase not configured');
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
    return signInWithPhoneNumber(auth, phone, verifier);
  }

  async function confirmOtp(result: AnyConfirmation, otp: string) {
    if (IS_DEMO || (result as DemoConfirmation).__demo) {
      // accept any 6-digit code in demo
      if (otp.length !== 6) throw new Error('Invalid OTP');
      loginDemo();
      return;
    }
    await (result as ConfirmationResult).confirm(otp);
  }

  async function logout() {
    if (IS_DEMO) {
      localStorage.removeItem(DEMO_LS_KEY);
      setUser(null);
      setToken(null);
      setRole(null);
      setShop(null);
      setAuthToken(null);
      return;
    }
    if (!auth) return;
    await signOut(auth);
  }

  async function refreshShop() {
    if (IS_DEMO) {
      setShop(DEMO_SHOP);
      return;
    }
    await loadShop();
  }

  return (
    <AuthContext.Provider value={{ user, token, role, shop, loading, sendOtp, confirmOtp, logout, refreshShop }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
