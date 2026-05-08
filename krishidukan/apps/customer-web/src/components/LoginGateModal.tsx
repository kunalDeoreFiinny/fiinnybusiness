// Smart login gate (F6). Opens automatically when a gated action is attempted by a guest.
// Phone → OTP → success replays the deferred action.
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, Phone as PhoneIcon } from 'lucide-react';
import { intentLabel, useAuth } from '../contexts/AuthContext';
import { DEMO_OTP_HINT, isValidPhone } from '../services/authService';

type Step = 'phone' | 'otp';

export function LoginGateModal() {
  const { gateOpen, gateIntent, closeGate, requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!gateOpen) {
      setStep('phone'); setPhone(''); setOtp(''); setError(null); setBusy(false);
      return;
    }
    setTimeout(() => phoneRef.current?.focus(), 80);
  }, [gateOpen]);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 60);
  }, [step]);

  if (!gateOpen) return null;

  async function handlePhoneSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!isValidPhone(phone)) { setError('Enter a valid 10-digit mobile number.'); return; }
    setBusy(true);
    const res = await requestOtp(phone);
    setBusy(false);
    if (res.ok) setStep('otp');
    else setError(res.error);
  }

  async function handleOtpSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (otp.trim().length !== 4) { setError('OTP must be 4 digits.'); return; }
    setBusy(true);
    const res = await verifyOtp(phone, otp);
    setBusy(false);
    if (!res.ok) setError(res.error);
    // success → modal closes via auth context
  }

  return (
    <div
      onClick={closeGate}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 380, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
      >
        <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', padding: '20px 18px 22px', color: '#fff', position: 'relative' }}>
          {step === 'otp' ? (
            <button
              onClick={() => { setStep('phone'); setError(null); }}
              aria-label="Back"
              style={{ position: 'absolute', top: 14, left: 12, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <button
            onClick={closeGate}
            aria-label="Close"
            style={{ position: 'absolute', top: 14, right: 12, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, opacity: 0.85 }}
          >
            <X size={18} />
          </button>
          <div style={{ fontSize: 30, marginBottom: 4 }}>🌾</div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.2px' }}>Sign in to {intentLabel(gateIntent)}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>You can keep browsing without signing in.</div>
        </div>

        <div style={{ padding: 18 }}>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Mobile number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '11px 14px', marginBottom: 10 }}>
                <PhoneIcon size={15} style={{ color: '#9ca3af' }} />
                <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>+91</span>
                <input
                  ref={phoneRef}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  autoComplete="tel"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827', letterSpacing: '0.04em' }}
                />
              </div>
              {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{error}</p>}
              <button
                type="submit"
                disabled={busy || phone.length !== 10}
                style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', opacity: busy || phone.length !== 10 ? 0.7 : 1 }}
              >
                {busy ? 'Sending OTP…' : 'Send OTP'}
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                By continuing you agree to KrishiDukan’s terms.
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                Enter the 4-digit OTP sent to <strong>+91 {phone}</strong>.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '11px 14px', marginBottom: 10 }}>
                <input
                  ref={otpRef}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 18, color: '#111827', letterSpacing: '0.5em', textAlign: 'center', fontWeight: 700 }}
                />
              </div>
              {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{error}</p>}
              <button
                type="submit"
                disabled={busy || otp.length !== 4}
                style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', opacity: busy || otp.length !== 4 ? 0.7 : 1, marginBottom: 8 }}
              >
                {busy ? 'Verifying…' : 'Verify & Continue'}
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
                Demo OTP: <strong style={{ color: '#15803d' }}>{DEMO_OTP_HINT}</strong>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
