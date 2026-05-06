import { useAuth } from '../contexts/AuthContext';
import { IS_DEMO } from '../demoMode';

export function LoginPage() {
  const { login } = useAuth();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '40px 48px', textAlign: 'center', width: 380 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🌾</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>KrishiDukan</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>Admin Portal</p>
        {IS_DEMO && (
          <div style={{ background: '#422006', border: '1px solid #f59e0b40', borderRadius: 8, padding: '10px 14px', marginBottom: 20, textAlign: 'left' }}>
            <p style={{ color: '#fbbf24', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Demo Mode</p>
            <p style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.5 }}>
              Backend & Firebase not configured. Click below to enter with mock data.
            </p>
          </div>
        )}
        <button
          onClick={() => void login()}
          style={{
            width: '100%', padding: '12px 20px', background: '#22c55e', color: '#0f172a',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {IS_DEMO ? 'Enter Demo' : 'Sign in with Google'}
        </button>
        <p style={{ color: '#475569', fontSize: 11, marginTop: 20 }}>
          {IS_DEMO ? 'Set VITE_FIREBASE_API_KEY to use real auth.' : 'Access restricted to authorized admin accounts only.'}
        </p>
      </div>
    </div>
  );
}
