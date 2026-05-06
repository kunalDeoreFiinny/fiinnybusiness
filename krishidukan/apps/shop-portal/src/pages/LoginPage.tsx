import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IS_DEMO } from '../demoMode';

const STYLES = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4', padding: 20 } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 16, padding: '40px 40px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' } as React.CSSProperties,
  input: { width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, outline: 'none', marginBottom: 12, fontFamily: 'inherit' } as React.CSSProperties,
  btn: { width: '100%', padding: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  err: { color: '#dc2626', fontSize: 13, marginBottom: 10 } as React.CSSProperties,
  banner: { background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#92400e', lineHeight: 1.5 } as React.CSSProperties,
};

export function LoginPage() {
  const { sendOtp, confirmOtp } = useAuth();
  const [phone, setPhone] = useState('+919876543210');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp() {
    setError('');
    setLoading(true);
    try {
      const result = await sendOtp(phone, 'recaptcha-container');
      setConfirmation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!confirmation) return;
    setError('');
    setLoading(true);
    try {
      await confirmOtp(confirmation as never, otp);
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={STYLES.page}>
      <div style={STYLES.card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#14532d' }}>KrishiDukan</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Shop Owner Portal</p>
        </div>

        {IS_DEMO && (
          <div style={STYLES.banner}>
            <strong>Demo Mode</strong> — Firebase not configured. Use any phone number; any 6-digit code works as OTP.
          </div>
        )}

        {error && <p style={STYLES.err}>{error}</p>}

        {!confirmation ? (
          <>
            <label style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginBottom: 6, display: 'block' }}>
              Mobile Number
            </label>
            <input
              style={STYLES.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              type="tel"
            />
            {!IS_DEMO && <div id="recaptcha-container" />}
            <button style={STYLES.btn} onClick={() => void handleSendOtp()} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p style={{ color: '#374151', fontSize: 14, marginBottom: 16 }}>
              OTP sent to <strong>{phone}</strong>
              {IS_DEMO && <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#16a34a' }}>(Enter any 6-digit code)</span>}
            </p>
            <input
              style={STYLES.input}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
              inputMode="numeric"
              autoFocus
            />
            <button style={STYLES.btn} onClick={() => void handleConfirm()} disabled={loading || otp.length < 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={() => { setConfirmation(null); setOtp(''); }}
              style={{ width: '100%', marginTop: 8, padding: '10px', background: 'transparent', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer' }}
            >
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
