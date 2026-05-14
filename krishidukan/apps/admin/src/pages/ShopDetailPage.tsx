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

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  pending_review: { bg: '#fff7ed', text: '#f57c00', border: '#fed7aa' },
  active: { bg: '#f0fdf4', text: '#154212', border: '#bbf7d0' },
  suspended: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  rejected: { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
};

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

  if (loading) return <div className="p-8 text-on-surface-variant text-sm">Loading...</div>;
  if (!shop) return <div className="p-8 text-red-600 text-sm">Shop not found</div>;

  const isPending = shop.status === 'pending_review';
  const isActive = shop.status === 'active';
  const ss = STATUS_STYLES[shop.status] ?? STATUS_STYLES['rejected'];

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors bg-transparent border-none cursor-pointer p-0">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{shop.businessName}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{shop.ownerName} · {shop.phone}</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full border"
          style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}>
          {shop.status.replace('_', ' ')}
        </span>
      </div>

      {erpKey && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
          <p className="text-primary text-sm font-bold mb-2">Shop approved. ERP API Key (shown once):</p>
          <code className="text-sm text-primary-container font-mono break-all">{erpKey}</code>
          <p className="text-on-surface-variant text-xs mt-3">Copy and share with the shop owner. This will not be shown again.</p>
        </div>
      )}

      <div className="bg-white border border-surface-container rounded-2xl p-5 mb-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Shop Details</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            ['Address', `${shop.addressLine}, ${shop.city}, ${shop.state} ${shop.pincode}`],
            ['GST', shop.gst ?? '—'],
            ['Inventory items', String(shop._count.inventory)],
            ['Total views', String(shop._count.views)],
            ['Registered', new Date(shop.createdAt).toLocaleDateString('en-IN')],
            ['Admin notes', shop.adminNotes ?? '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-on-surface-variant mb-1">{label}</div>
              <div className="text-sm text-on-surface font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-surface-container rounded-2xl p-5 mb-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">
          License Documents ({shop.licenses.length})
        </h2>
        {shop.licenses.length === 0 ? (
          <p className="text-red-600 text-sm">No license documents uploaded. Cannot approve this shop.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {shop.licenses.map((lic) => (
              <div key={lic.id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-surface-container">
                <div>
                  <div className="text-sm text-on-surface font-semibold">{LICENSE_TYPE_LABELS[lic.licenseType]}</div>
                  <div className="text-xs text-on-surface-variant">
                    #{lic.licenseNumber}{lic.expiryDate ? ` · Expires ${new Date(lic.expiryDate).toLocaleDateString('en-IN')}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => void viewLicense(lic.id)}
                  className="bg-transparent border border-outline-variant rounded-xl px-3 py-1.5 text-primary text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-surface-container transition-colors">
                  <ExternalLink size={12} /> View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {isPending && (
          <button
            onClick={() => void approve()}
            disabled={!!actionLoading || shop.licenses.length === 0}
            className="px-6 py-2.5 bg-primary text-white border-none rounded-2xl text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-60">
            <CheckCircle size={16} /> {actionLoading === 'approve' ? 'Approving...' : 'Approve Shop'}
          </button>
        )}
        {(isPending || isActive) && !showReject && (
          <button
            onClick={() => setShowReject(true)}
            className="px-6 py-2.5 bg-transparent text-red-600 border border-red-200 rounded-2xl text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-red-50 transition-colors">
            <XCircle size={16} /> Reject
          </button>
        )}
        {isActive && (
          <button
            onClick={() => void suspend()}
            disabled={!!actionLoading}
            className="px-6 py-2.5 bg-transparent text-harvest border border-harvest/30 rounded-2xl text-sm font-bold cursor-pointer flex items-center gap-2 hover:bg-harvest/5 transition-colors disabled:opacity-60">
            <PauseCircle size={16} /> {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
          </button>
        )}
      </div>

      {showReject && (
        <div className="mt-5 bg-white border border-red-200 rounded-2xl p-5">
          <p className="text-red-600 text-sm font-semibold mb-3">Rejection reason (required):</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. License document unclear, please re-upload..."
            rows={3}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary resize-vertical"
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => void reject()}
              disabled={!rejectReason.trim() || !!actionLoading}
              className="px-5 py-2 bg-red-600 text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-60">
              {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="px-5 py-2 bg-transparent text-on-surface-variant border border-surface-container-highest rounded-xl text-sm cursor-pointer hover:bg-surface-container transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
