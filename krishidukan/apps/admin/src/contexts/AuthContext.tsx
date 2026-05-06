import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { api, setAuthToken } from '../api';
import { IS_DEMO, DEMO_ADMIN_USER } from '../demoMode';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | DemoUser | null;
  token: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO) {
      // Auto-login restored from localStorage flag
      const wasLoggedIn = localStorage.getItem('kd_demo_logged_in') === '1';
      if (wasLoggedIn) {
        setUser(DEMO_ADMIN_USER);
        setToken('demo-jwt-token');
        setAuthToken('demo-jwt-token');
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
          const res = await api.post<{ accessToken: string }>('/auth/login', { idToken });
          const kdToken = res.data.accessToken;
          setToken(kdToken);
          setAuthToken(kdToken);
        } catch {
          setToken(null);
          setAuthToken(null);
        }
      } else {
        setToken(null);
        setAuthToken(null);
      }
      setLoading(false);
    });
  }, []);

  async function login() {
    if (IS_DEMO) {
      localStorage.setItem('kd_demo_logged_in', '1');
      setUser(DEMO_ADMIN_USER);
      setToken('demo-jwt-token');
      setAuthToken('demo-jwt-token');
      return;
    }
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    if (IS_DEMO) {
      localStorage.removeItem('kd_demo_logged_in');
      setUser(null);
      setToken(null);
      setAuthToken(null);
      return;
    }
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
