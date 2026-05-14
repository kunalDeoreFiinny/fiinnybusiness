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
  // TEMP_DISABLED: Login/auth feature disabled for current release
  const [user] = useState<AuthUser | null>(null);
  const [gateOpen] = useState(false);
  const [gateIntent] = useState<LoginIntent>('generic');
  const pendingRef = useRef<PendingAction | null>(null);

  // TEMP_DISABLED: requireLogin always runs action immediately (no gate)
  const requireLogin = useCallback((action: () => void, _intent: LoginIntent = 'generic') => {
    action();
  }, []);

  // TEMP_DISABLED: closeGate is a no-op
  const closeGate = useCallback(() => {
    pendingRef.current = null;
  }, []);

  // TEMP_DISABLED: OTP flow disabled — always returns failure
  const requestOtp = useCallback(async (_phone: string) => {
    return { ok: false as const, error: 'Login is temporarily disabled' };
  }, []);

  const verifyOtp = useCallback(async (_phone: string, _otp: string) => {
    return { ok: false as const, error: 'Login is temporarily disabled' };
  }, []);

  // TEMP_DISABLED: logout is a no-op
  const logout = useCallback(() => {}, []);

  // Keep a single tab in sync if we ever open multiples.
  // TEMP_DISABLED: storage sync disabled
  // useEffect(() => {
  //   function onStorage(e: StorageEvent) {
  //     if (e.key === 'kd_auth_user') setUser(loadStoredUser());
  //   }
  //   window.addEventListener('storage', onStorage);
  //   return () => window.removeEventListener('storage', onStorage);
  // }, []);

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
