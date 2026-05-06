import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { INDIAN_STATES } from '@krishidukan/shared';

const CARD: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 };
const INPUT: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 };
const LABEL: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5, display: 'block' };
const BTN: React.CSSProperties = { padding: '13px 32px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' };

interface FormData {
  ownerName: string;
  businessName: string;
  gst: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  lat: string;
  lng: string;
  phone: string;
}

export function RegisterShopPage() {
  const { user, refreshShop } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    ownerName: '', businessName: '', gst: '', addressLine: '',
    city: '', state: 'Maharashtra', pincode: '',
    lat: '', lng: '', phone: user?.phoneNumber ?? '',
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: String(pos.coords.latitude.toFixed(6)), lng: String(pos.coords.longitude.toFixed(6)) }));
        setLocating(false);
      },
      () => { setError('Location access denied. Please enter coordinates manually.'); setLocating(false); },
    );
  }

  async function submit() {
    setError('');
    setLoading(true);
    try {
      await api.post('/shops', {
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      });
      await refreshShop();
      navigate('/pending');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = ['Business Info', 'Location', 'Contact & GST', 'Review'];

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', padding: '32px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#14532d' }}>Register Your Shop</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Step {step} of 4 — {stepTitles[step - 1]}</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= step ? '#16a34a' : '#d1fae5' }} />
          ))}
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {step === 1 && (
          <div style={CARD}>
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>Owner Name *</label>
              <input style={INPUT} value={form.ownerName} onChange={update('ownerName')} placeholder="Your full name" />
            </div>
            <div>
              <label style={LABEL}>Business / Shop Name *</label>
              <input style={INPUT} value={form.businessName} onChange={update('businessName')} placeholder="e.g. Balaji Krishi Seva Kendra" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={CARD}>
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>Address Line *</label>
              <input style={INPUT} value={form.addressLine} onChange={update('addressLine')} placeholder="Shop no., street, area" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={LABEL}>City *</label>
                <input style={INPUT} value={form.city} onChange={update('city')} placeholder="City" />
              </div>
              <div>
                <label style={LABEL}>Pincode *</label>
                <input style={INPUT} value={form.pincode} onChange={update('pincode')} placeholder="6-digit" maxLength={6} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>State *</label>
              <select style={INPUT} value={form.state} onChange={update('state')}>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>GPS Coordinates *</label>
              <button
                onClick={useMyLocation}
                style={{ width: '100%', padding: '10px', background: '#f0fdf4', border: '1px dashed #16a34a', borderRadius: 8, color: '#16a34a', fontSize: 13, cursor: 'pointer', marginBottom: 10 }}
              >
                {locating ? 'Getting location...' : '📍 Use My Current Location'}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={LABEL}>Latitude</label>
                  <input style={INPUT} value={form.lat} onChange={update('lat')} placeholder="e.g. 18.5204" />
                </div>
                <div>
                  <label style={LABEL}>Longitude</label>
                  <input style={INPUT} value={form.lng} onChange={update('lng')} placeholder="e.g. 73.8567" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={CARD}>
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>Mobile Number *</label>
              <input style={INPUT} value={form.phone} onChange={update('phone')} placeholder="+91XXXXXXXXXX" />
            </div>
            <div>
              <label style={LABEL}>GST Number (optional)</label>
              <input style={INPUT} value={form.gst} onChange={update('gst')} placeholder="15-character GST number" maxLength={15} />
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>You can add this later from your dashboard</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={CARD}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#14532d', marginBottom: 16 }}>Review Your Details</h3>
            {[
              ['Business Name', form.businessName],
              ['Owner', form.ownerName],
              ['Address', `${form.addressLine}, ${form.city}, ${form.state} ${form.pincode}`],
              ['GPS', `${form.lat}, ${form.lng}`],
              ['Phone', form.phone],
              ['GST', form.gst || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
                <span style={{ fontSize: 13, color: '#111827', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 16, lineHeight: 1.6 }}>
              After submission, our team will verify your license documents. You'll be notified once approved. You can upload license documents after registration.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} style={{ padding: '11px 24px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
              Back
            </button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} style={BTN}>Next</button>
          ) : (
            <button onClick={() => void submit()} style={BTN} disabled={loading}>
              {loading ? 'Registering...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
