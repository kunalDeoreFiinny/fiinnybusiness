import { useState, type FormEvent, type ChangeEvent } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { createRetailerAuthAccount } from '../services/authService';
import { createRetailerDocs } from '../services/retailerService';
import type { AddRetailerFormData } from '../types/retailer';

const EMPTY: AddRetailerFormData = {
  shopName: '',
  ownerName: '',
  phone: '',
  email: '',
  password: '',
  address: '',
  lat: '',
  lng: '',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export function AddRetailerPage() {
  const [form, setForm] = useState<AddRetailerFormData>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState('');

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Latitude and Longitude must be valid numbers.');
      setStatus('error');
      return;
    }

    try {
      // Step 1: Create Firebase Auth account (secondary app — admin stays logged in)
      console.log('[AddRetailerPage] Step 1: creating Firebase Auth account for', form.email.trim());
      const uid = await createRetailerAuthAccount(form.email.trim(), form.password);
      console.log('[AddRetailerPage] Step 1 ✅ Auth account created, UID:', uid);

      // Step 2: Write /users and /retailers docs in Firestore
      console.log('[AddRetailerPage] Step 2: writing Firestore documents…');
      await createRetailerDocs({
        uid,
        shopName: form.shopName.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        lat,
        lng,
      });
      console.log('[AddRetailerPage] Step 2 ✅ Firestore documents written');

      setCreatedEmail(form.email.trim());
      setForm(EMPTY);
      setStatus('success');
    } catch (err) {
      setError(friendlyError(err));
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div style={{ padding: 32, maxWidth: 560 }}>
        <div style={{
          background: '#052e16',
          border: '1px solid #166534',
          borderRadius: 12,
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          textAlign: 'center',
        }}>
          <CheckCircle size={44} color="#22c55e" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Retailer Created</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
            Firebase Auth account and Firestore documents created successfully for<br />
            <strong style={{ color: '#22c55e' }}>{createdEmail}</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => setStatus('idle')}
              style={btnStyle('#22c55e', '#0f172a')}
            >
              Add Another Retailer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserPlus size={20} color="#22c55e" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>Add Retailer</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Creates a Firebase Auth account + Firestore retailer document
          </p>
        </div>
      </div>

      {/* Error banner */}
      {status === 'error' && error && (
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

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SectionLabel>Shop Details</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Shop Name" name="shopName" value={form.shopName} onChange={handleChange} placeholder="Krishi Mitra Agro Centre" required />
            <Field label="Owner Name" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Ramesh Patil" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Plot 14, Market Road, Nashik Road, Nashik – 422001"
              required
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <Field label="Latitude" name="lat" value={form.lat} onChange={handleChange} placeholder="19.9975" required />
            <Field label="Longitude" name="lng" value={form.lng} onChange={handleChange} placeholder="73.7898" required />
          </div>

          <SectionLabel>Contact</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+919876543210" required />
            <div /> {/* spacer */}
          </div>

          <SectionLabel>Login Credentials</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="retailer@example.com" required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={btnStyle(status === 'loading' ? '#166534' : '#22c55e', '#0f172a')}
        >
          {status === 'loading' ? 'Creating…' : 'Create Retailer Account'}
        </button>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
      {children}
    </p>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function Field({ label, name, value, onChange, placeholder, type = 'text', required }: FieldProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        style={inputStyle}
      />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 8,
  fontSize: 14,
  color: '#f1f5f9',
  outline: 'none',
  boxSizing: 'border-box',
};

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '11px 24px',
    background: bg,
    color,
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  };
}

// ── Error mapping ─────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  console.error('[AddRetailerPage] Error details:', err);

  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;

    // Firebase Auth errors
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/network-request-failed') return 'Network error. Check your connection.';

    // Firestore errors
    if (code === 'permission-denied') {
      return 'Firestore permission denied. Update your security rules to allow admin writes to /retailers and /users. See console for details.';
    }
    if (code === 'unavailable') return 'Firestore is temporarily unavailable. Try again.';
    if (code === 'not-found') return 'Firestore database not found. Check your Firebase project config.';

    // Show the raw code if we don't recognise it
    return `Firebase error: ${code}`;
  }

  if (err instanceof Error) return err.message;
  return 'Something went wrong. Check the browser console for details.';
}
