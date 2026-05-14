<<<<<<< Updated upstream
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail } from '../services/authService';
=======
import { useAuth } from '../contexts/AuthContext';
import { IS_DEMO } from '../demoMode';
import { Sprout } from 'lucide-react';
>>>>>>> Stashed changes

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const credential = await loginWithEmail(email.trim(), password);
      console.log('Authenticated user:', credential.user);
      // Navigate to dashboard; AuthContext's onAuthStateChanged also updates global state
      navigate('/', { replace: true });
    } catch (err) {
      setError(friendlyError(err));
      setLoading(false);
    }
  }

  return (
<<<<<<< Updated upstream
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: 16,
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 14,
        padding: '40px 40px',
        width: '100%',
        maxWidth: 400,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>KrishiDukan</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Admin Portal</p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#450a0a',
            border: '1px solid #991b1b',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 13,
            color: '#fca5a5',
          }}>
            {error}
          </div>
        )}

        {/* Email / password form */}
        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '12px',
              background: loading ? '#166534' : '#22c55e',
              color: '#0f172a',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#334155' }} />
          <span style={{ fontSize: 11, color: '#475569' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#334155' }} />
        </div>

        {/* Google button placeholder (non-functional) */}
        <button
          type="button"
          disabled
          title="Google login coming soon"
          style={{
            width: '100%',
            padding: '11px',
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            color: '#475569',
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <GoogleIcon />
          Continue with Google (coming soon)
        </button>

        <p style={{ color: '#475569', fontSize: 11, marginTop: 24, textAlign: 'center' }}>
          Access restricted to authorized admin accounts only.
=======
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white border border-surface-container rounded-3xl p-10 text-center w-96 shadow-ambient">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sprout className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-1 tracking-tight">Krishidukan</h1>
        <p className="text-on-surface-variant text-sm mb-8 font-medium">Admin Portal</p>

        {IS_DEMO && (
          <div className="bg-harvest/10 border border-harvest/20 rounded-2xl p-4 mb-6 text-left">
            <p className="text-harvest text-xs font-black uppercase tracking-widest mb-1">Demo Mode</p>
            <p className="text-on-surface-variant text-xs leading-relaxed">Backend & Firebase not configured. Click below to enter with mock data.</p>
          </div>
        )}

        <button onClick={() => void login()}
          className="w-full py-3 bg-primary text-white font-bold rounded-2xl text-sm hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">
          {IS_DEMO ? 'Enter Demo' : 'Sign in with Google'}
        </button>
        <p className="text-on-surface-variant text-xs mt-5">
          {IS_DEMO ? 'Set VITE_FIREBASE_API_KEY to use real auth.' : 'Access restricted to authorized admin accounts only.'}
>>>>>>> Stashed changes
        </p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 8,
  fontSize: 14,
  color: '#f1f5f9',
  outline: 'none',
  boxSizing: 'border-box',
};

function friendlyError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many failed attempts. Please try again later.';
    }
    if (code === 'auth/user-disabled') {
      return 'This account has been disabled.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network error. Check your connection.';
    }
  }
  return 'Sign in failed. Please try again.';
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
