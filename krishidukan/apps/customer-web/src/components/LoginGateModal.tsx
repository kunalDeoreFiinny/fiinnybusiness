// Smart login gate (F6). Opens automatically when a gated action is attempted by a guest.
// Phone → OTP → success replays the deferred action.
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, Phone as PhoneIcon, Wheat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, type LoginIntent } from '../contexts/AuthContext';
import { DEMO_OTP_HINT, isValidPhone } from '../services/authService';

type Step = 'phone' | 'otp';

function intentKey(intent: LoginIntent): string {
  switch (intent) {
    case 'add-to-cart':  return 'auth.intent.addToCart';
    case 'buy-now':      return 'auth.intent.buyNow';
    case 'place-order':  return 'auth.intent.placeOrder';
    case 'save-address': return 'auth.intent.saveAddress';
    case 'wishlist':     return 'auth.intent.wishlist';
    case 'generic':
    default:             return 'auth.intent.generic';
  }
}

export function LoginGateModal() {
  const { t } = useTranslation();
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
    if (!isValidPhone(phone)) { setError(t('auth.errorPhone')); return; }
    setBusy(true);
    const res = await requestOtp(phone);
    setBusy(false);
    if (res.ok) setStep('otp');
    else setError(res.error);
  }

  async function handleOtpSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (otp.trim().length !== 4) { setError(t('auth.errorOtpLength')); return; }
    setBusy(true);
    const res = await verifyOtp(phone, otp);
    setBusy(false);
    if (!res.ok) setError(res.error);
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
              aria-label={t('auth.backAria')}
              style={{ position: 'absolute', top: 14, left: 12, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
            >
              <ArrowLeft size={18} />
            </button>
          ) : null}
          <button
            onClick={closeGate}
            aria-label={t('auth.closeAria')}
            style={{ position: 'absolute', top: 14, right: 12, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, opacity: 0.85 }}
          >
            <X size={18} />
          </button>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Wheat size={22} color="#fff" strokeWidth={2.1} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.2px' }}>
            {t('auth.title', { action: t(intentKey(gateIntent)) })}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>{t('auth.subtitle')}</div>
        </div>

        <div style={{ padding: 18 }}>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                {t('auth.mobileLabel')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '11px 14px', marginBottom: 10 }}>
                <PhoneIcon size={15} style={{ color: '#9ca3af' }} />
                <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 600 }}>+91</span>
                <input
                  ref={phoneRef}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={t('auth.mobilePlaceholder')}
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
                {busy ? t('auth.sending') : t('auth.sendOtp')}
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                {t('auth.terms')}
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                {t('auth.otpPrompt', { phone: `+91 ${phone}` })}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '11px 14px', marginBottom: 10 }}>
                <input
                  ref={otpRef}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder={t('auth.otpPlaceholder')}
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
                {busy ? t('auth.verifying') : t('auth.verify')}
              </button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
                {t('auth.demoOtp', { code: DEMO_OTP_HINT })}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
