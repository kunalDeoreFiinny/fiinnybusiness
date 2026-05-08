// Mock phone/OTP auth. The static OTP is `1234`. Replace with Firebase Phone Auth later.
import { isLiveBackend, api } from './api';

export interface AuthUser {
  phone: string;
  token: string;
  loggedInAt: number;
}

const LS_KEY = 'kd_auth_user';
const MOCK_OTP = '1234';

export function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser) {
  localStorage.setItem(LS_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(LS_KEY);
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

export async function requestOtp(phone: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidPhone(phone)) return { ok: false, error: 'Enter a valid 10-digit mobile number.' };
  if (isLiveBackend) {
    try {
      await api.post('/auth/otp/request', { phone: normalizePhone(phone) });
      return { ok: true };
    } catch {
      // fall through to mock so demo still works offline
    }
  }
  // Simulate ~600 ms network round-trip
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}

export async function verifyOtp(phone: string, otp: string): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  if (!isValidPhone(phone)) return { ok: false, error: 'Invalid mobile number.' };
  if (otp.trim().length !== 4) return { ok: false, error: 'OTP must be 4 digits.' };

  if (isLiveBackend) {
    try {
      const res = await api.post<{ token: string }>('/auth/otp/verify', { phone: normalizePhone(phone), otp });
      const user: AuthUser = { phone: normalizePhone(phone), token: res.data.token, loggedInAt: Date.now() };
      saveUser(user);
      return { ok: true, user };
    } catch {
      // fall through to mock
    }
  }

  await new Promise((r) => setTimeout(r, 500));
  if (otp.trim() !== MOCK_OTP) return { ok: false, error: `Invalid OTP. Use ${MOCK_OTP} for the demo.` };
  const user: AuthUser = {
    phone: normalizePhone(phone),
    token: `mock-token-${Math.random().toString(36).slice(2, 10)}`,
    loggedInAt: Date.now(),
  };
  saveUser(user);
  return { ok: true, user };
}

export function logout(): void {
  clearStoredUser();
}

export const DEMO_OTP_HINT = MOCK_OTP;
