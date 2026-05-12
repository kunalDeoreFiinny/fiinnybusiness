'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { IS_DEMO } from '../demoMode';
import { getRetailerById, updateRetailer } from '../services/retailerService';
import { uploadFile, retailerFilePath } from '../firebase/storage';
import { Store, Camera, Clock, MapPin, Phone as PhoneIcon, Save, CheckCircle } from 'lucide-react';
import type { RetailerDoc } from '../types/firebase';

export function ProfilePage() {
  const { shop, userDoc } = useAuth();
  const toast = useToast();
  const [retailer, setRetailer] = useState<RetailerDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ shopName: '', ownerName: '', phone: '', address: '', whatsappNumber: '', gstNumber: '', description: '', openTime: '09:00', closeTime: '20:00' });
  const [bannerUploading, setBannerUploading] = useState(false);

  const retailerId = userDoc?.retailerId ?? shop?.id ?? '';

  useEffect(() => {
    if (IS_DEMO || !retailerId) { setLoading(false); return; }
    getRetailerById(retailerId).then((r) => {
      if (r) {
        setRetailer(r);
        setForm({ shopName: r.shopName, ownerName: r.ownerName, phone: r.phone, address: r.address, whatsappNumber: r.whatsappNumber ?? '', gstNumber: r.gstNumber ?? '', description: r.description ?? '', openTime: r.timings?.open ?? '09:00', closeTime: r.timings?.close ?? '20:00' });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [retailerId]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateRetailer(retailerId, { shopName: form.shopName, ownerName: form.ownerName, phone: form.phone, address: form.address, whatsappNumber: form.whatsappNumber, gstNumber: form.gstNumber, description: form.description, timings: { open: form.openTime, close: form.closeTime, holidays: [] } });
      toast.success('Profile updated successfully');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadFile(retailerFilePath(retailerId, 'banners', file.name), file);
      await updateRetailer(retailerId, { bannerUrl: url });
      toast.success('Banner uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setBannerUploading(false); }
  }

  // Profile completeness
  const fields = [form.shopName, form.ownerName, form.phone, form.address, form.description, form.gstNumber, form.whatsappNumber];
  const filled = fields.filter((f) => f.trim().length > 0).length;
  const completeness = Math.round((filled / fields.length) * 100);

  if (loading) return <AppShell title="Shop Profile"><div style={{ color: 'var(--kd-text-muted)', padding: 40, textAlign: 'center' }}>Loading profile...</div></AppShell>;

  return (
    <AppShell title="Shop Profile" subtitle="Manage your shop details and branding" headerActions={<Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save Changes</Button>}>
      {/* Completeness Bar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Profile Completeness</span>
          <Badge variant={completeness >= 80 ? 'success' : completeness >= 50 ? 'warning' : 'danger'} dot>{completeness}%</Badge>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--kd-gray-100)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completeness}%`, borderRadius: 4, background: completeness >= 80 ? 'var(--kd-success)' : completeness >= 50 ? 'var(--kd-warning)' : 'var(--kd-danger)', transition: 'width 0.5s ease' }} />
        </div>
        {completeness < 100 && <p style={{ fontSize: 12, color: 'var(--kd-text-muted)', marginTop: 8 }}>Complete your profile to build trust with farmers. Add description, GST, and WhatsApp number.</p>}
      </Card>

      {/* Banner Upload */}
      <Card style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 160, background: retailer?.bannerUrl ? `url(${retailer.bannerUrl}) center/cover` : 'linear-gradient(135deg, var(--kd-green-100), var(--kd-green-200))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.9)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--kd-text-secondary)' }}>
            <Camera size={16} />{bannerUploading ? 'Uploading...' : 'Change Banner'}
            <input type="file" accept="image/*" hidden onChange={handleBannerUpload} />
          </label>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--kd-green-500), var(--kd-green-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌾</div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{form.shopName || 'Your Shop'}</h2>
              <div style={{ fontSize: 13, color: 'var(--kd-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} />{form.address || 'Add address'}</div>
            </div>
            <Badge variant="success" dot style={{ marginLeft: 'auto' }}>Active</Badge>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Business Info */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><Store size={18} style={{ color: 'var(--kd-primary)' }} /><span style={{ fontSize: 15, fontWeight: 600 }}>Business Information</span></div>
          <Input label="Shop Name *" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="e.g. Krishi Seva Kendra" />
          <Input label="Owner Name *" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} icon={<MapPin size={14} />} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell farmers about your shop" hint="Visible on your public listing" />
          <Input label="GST Number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="15-character GST" />
        </Card>

        {/* Contact & Timings */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><PhoneIcon size={18} style={{ color: 'var(--kd-primary)' }} /><span style={{ fontSize: 15, fontWeight: 600 }}>Contact & Timings</span></div>
          <Input label="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} icon={<PhoneIcon size={14} />} />
          <Input label="WhatsApp Number" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="For farmer inquiries" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><Clock size={18} style={{ color: 'var(--kd-primary)' }} /><span style={{ fontSize: 15, fontWeight: 600 }}>Business Hours</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Opening Time" type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} />
            <Input label="Closing Time" type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} />
          </div>
          <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: 'var(--kd-primary-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={16} style={{ color: 'var(--kd-green-600)' }} />
            <span style={{ fontSize: 13, color: 'var(--kd-green-700)' }}>Your shop is currently <strong>Active</strong></span>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
