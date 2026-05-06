import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ExternalLink, CheckCircle, XCircle, PauseCircle, ArrowLeft } from 'lucide-react';
import { LicenseType, LICENSE_TYPE_LABELS } from '@krishidukan/shared';

interface License {
  id: string;
  licenseType: LicenseType;
  licenseNumber: string;
  expiryDate: string | null;
  documentUrl: string;
}

interface ShopDetail {
  id: string;
  businessName: string;
  ownerName: string;
  gst: string | null;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  licenses: License[];
  _count: { inventory: number; views: number };
}

export function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [erpKey, setErpKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<ShopDetail>(`/admin/shops/${id}`)
      .then((r) => setShop(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function approve() {
    if (!id) return;
    setActionLoading('approve');
    try {
      const res = await api.post<{ erpApiKey: string }>(`/admin/shops/${id}/approve`);
      setErpKey(res.data.erpApiKey);
      setShop((s) => s ? { ...s, status: 'active' } : s);
    } finally {
      setActionLoading('');
    }
  }

  async function reject() {
    if (!id || !rejectReason.trim()) return;
    setActionLoading('reject');
    try {
      await api.post(`/admin/shops/${id}/reject`, { reason: rejectReason });
      setShop((s) => s ? { ...s, status: 'rejected', adminNotes: rejectReason } : s);
      setShowReject(false);
    } finally {
      setActionLoading('');
    }
  }

  async function suspend() {
    if (!id) return;
    setActionLoading('suspend');
    try {
      await api.post(`/admin/shops/${id}/suspend`);
      setShop((s) => s ? { ...s, status: 'suspended' } : s);
    } finally {
      setActionLoading('');
    }
  }

  async function viewLicense(licenseId: string) {
    const res = await api.get<{ url: string }>(`/licenses/${licenseId}/url`);
    window.open(res.data.url, '_blank');
  }

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!shop) return <div style={{ padding: 32, color: '#f87171' }}>Shop not found</div>;

  const isPending = shop.status === 'pending_review';
  const isActive = shop.status === 'active';

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{shop.businessName}</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{shop.ownerName} · {shop.phone}</p>
        </div>
        <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, background: shop.status === 'active' ? '#22c55e20' : shop.status === 'pending_review' ? '#f59e0b20' : '#f8717120', color: shop.status === 'active' ? '#22c55e' : shop.status === 'pending_review' ? '#f59e0b' : '#f87171' }}>
          {shop.status}
        </span>
      </div>

      {erpKey && (
        <div style={{ background: '#022c22', border: '1px solid #22c55e50', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Shop approved. ERP API Key (shown once):</p>
          <code style={{ fontSize: 13, color: '#4ade80', wordBreak: 'break-all' }}>{erpKey}</code>
          <p style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>Copy and share with the shop owner. This will not be shown again.</p>
        </div>
      )}

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {[
            ['Address', `${shop.addressLine}, ${shop.city}, ${shop.state} ${shop.pincode}`],
            ['GST', shop.gst ?? '—'],
            ['Inventory items', String(shop._count.inventory)],
            ['Total views', String(shop._count.views)],
            ['Registered', new Date(shop.createdAt).toLocaleDateString('en-IN')],
            ['Admin notes', shop.adminNotes ?? '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, color: '#e2e8f0' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>License Documents ({shop.licenses.length})</h2>
        {shop.licenses.length === 0 ? (
          <p style={{ color: '#f87171', fontSize: 13 }}>No license documents uploaded. Cannot approve this shop.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {shop.licenses.map((lic) => (
              <div key={lic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{LICENSE_TYPE_LABELS[lic.licenseType]}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>#{lic.licenseNumber}{lic.expiryDate ? ` · Expires ${new Date(lic.expiryDate).toLocaleDateString('en-IN')}` : ''}</div>
                </div>
                <button
                  onClick={() => void viewLicense(lic.id)}
                  style={{ background: 'none', border: '1px solid #334155', borderRadius: 6, padding: '6px 12px', color: '#60a5fa', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={12} /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {isPending && (
          <button
            onClick={() => void approve()}
            disabled={!!actionLoading || shop.licenses.length === 0}
            style={{ padding: '10px 24px', background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: actionLoading ? 0.6 : 1 }}
          >
            <CheckCircle size={16} /> {actionLoading === 'approve' ? 'Approving...' : 'Approve Shop'}
          </button>
        )}
        {(isPending || isActive) && !showReject && (
          <button
            onClick={() => setShowReject(true)}
            style={{ padding: '10px 24px', background: 'transparent', color: '#f87171', border: '1px solid #f8717150', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <XCircle size={16} /> Reject
          </button>
        )}
        {isActive && (
          <button
            onClick={() => void suspend()}
            disabled={!!actionLoading}
            style={{ padding: '10px 24px', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b50', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <PauseCircle size={16} /> {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
          </button>
        )}
      </div>

      {showReject && (
        <div style={{ marginTop: 16, background: '#1e293b', border: '1px solid #f8717150', borderRadius: 10, padding: 20 }}>
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 10 }}>Rejection reason (required):</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. License document unclear, please re-upload..."
            rows={3}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '10px 12px', color: '#e2e8f0', fontSize: 13, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={() => void reject()} disabled={!rejectReason.trim() || !!actionLoading} style={{ padding: '8px 20px', background: '#f87171', color: '#0f172a', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button onClick={() => setShowReject(false)} style={{ padding: '8px 20px', background: 'transparent', color: '#64748b', border: '1px solid #334155', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
