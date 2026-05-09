import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart, type SavedAddress } from '../contexts/CartContext';
import { useLocation } from '../LocationContext';

type Form = Omit<SavedAddress, 'id'>;

const EMPTY_FORM: Form = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine: '',
  village: '',
  district: '',
  state: 'Maharashtra',
  pincode: '',
};

export function AddressesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, requireLogin, user } = useAuth();
  const { addresses, saveAddress, removeAddress } = useCart();
  const { location } = useLocation();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) requireLogin(() => {}, 'save-address');
  }, [isAuthenticated, requireLogin]);

  function startAdd() {
    setForm({
      ...EMPTY_FORM,
      phone: user?.phone.replace('+91', '') ?? '',
      village: location.village ?? '',
      district: location.district ?? '',
      state: location.state ?? 'Maharashtra',
      pincode: location.pincode ?? '',
    });
    setError(null);
    setAdding(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine.trim() || !form.pincode.trim()) {
      setError('Name, phone, address and pincode are required.');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be 6 digits.');
      return;
    }
    saveAddress(form);
    setAdding(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', flex: 1 }}>Saved Addresses</span>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {addresses.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📍</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>No addresses yet</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div key={addr.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, display: 'flex', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={18} style={{ color: '#16a34a' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                {addr.label} <span style={{ fontWeight: 400, color: '#6b7280' }}>· {addr.fullName}</span>
              </div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                {addr.addressLine}<br />
                {addr.village}, {addr.district}, {addr.state} — {addr.pincode}<br />
                Phone: {addr.phone}
              </div>
            </div>
            <button
              onClick={() => removeAddress(addr.id)}
              aria-label="Remove"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4, alignSelf: 'flex-start' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {!adding ? (
          <button
            onClick={startAdd}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={16} /> Add new address
          </button>
        ) : (
          <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>New address</div>
            <Field label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Home / Farm" />
            <Field label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} placeholder="Your name" />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" inputMode="numeric" />
            <Field label="Address line" value={form.addressLine} onChange={(v) => setForm({ ...form, addressLine: v })} placeholder="House/Plot, road, landmark" />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><Field label="Village" value={form.village} onChange={(v) => setForm({ ...form, village: v })} placeholder="Village" /></div>
              <div style={{ flex: 1 }}><Field label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} placeholder="District" /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} placeholder="State" /></div>
              <div style={{ flex: 1 }}><Field label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v.replace(/\D/g, '').slice(0, 6) })} placeholder="6-digit" inputMode="numeric" /></div>
            </div>
            {error && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 8px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setAdding(false)} style={{ flex: 1, padding: '10px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ flex: 2, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Save address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric' | 'search';
}

function Field({ label, value, onChange, placeholder, inputMode = 'text' }: FieldProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        style={{ width: '100%', padding: '10px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none' }}
      />
    </div>
  );
}
