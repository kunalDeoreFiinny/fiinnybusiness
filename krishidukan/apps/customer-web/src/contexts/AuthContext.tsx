// AuthContext + smart login gate (F6). Guests can browse the whole app.
// Gated actions (cart, buy, save address, wishlist) call `requireLogin(action, intent)` —
// if not signed in, the modal opens and the pending action runs after successful login.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import {
  AuthUser, loadStoredUser, requestOtp as svcRequestOtp,
  verifyOtp as svcVerifyOtp, logout as svcLogout,
} from '../services/authService';

export type LoginIntent =
  | 'add-to-cart' | 'buy-now' | 'save-address' | 'wishlist' | 'place-order' | 'generic';

interface PendingAction {
  intent: LoginIntent;
  run: () => void;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // gate
  gateOpen: boolean;
  gateIntent: LoginIntent;
  requireLogin: (action: () => void, intent?: LoginIntent) => void;
  closeGate: () => void;
  // OTP flow
  requestOtp: (phone: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());
  const [gateOpen, setGateOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<LoginIntent>('generic');
  const pendingRef = useRef<PendingAction | null>(null);

  const requireLogin = useCallback((action: () => void, intent: LoginIntent = 'generic') => {
    if (user) {
      action();
      return;
    }
    pendingRef.current = { intent, run: action };
    setGateIntent(intent);
    setGateOpen(true);
  }, [user]);

  const closeGate = useCallback(() => {
    pendingRef.current = null;
    setGateOpen(false);
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    return svcRequestOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const result = await svcVerifyOtp(phone, otp);
    if (result.ok) {
      setUser(result.user);
      setGateOpen(false);
      // Replay the deferred action AFTER the modal is closed and state has settled.
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) setTimeout(() => pending.run(), 0);
      return { ok: true as const };
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    svcLogout();
    setUser(null);
  }, []);

  // Keep a single tab in sync if we ever open multiples.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'kd_auth_user') setUser(loadStoredUser());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    isAuthenticated: !!user,
    gateOpen,
    gateIntent,
    requireLogin,
    closeGate,
    requestOtp,
    verifyOtp,
    logout,
  }), [user, gateOpen, gateIntent, requireLogin, closeGate, requestOtp, verifyOtp, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function intentLabel(intent: LoginIntent): string {
  switch (intent) {
    case 'add-to-cart': return 'add items to your cart';
    case 'buy-now':     return 'buy this product';
    case 'place-order': return 'place your order';
    case 'save-address':return 'save your address';
    case 'wishlist':    return 'save to your wishlist';
    case 'generic':
    default:            return 'continue';
  }
}
