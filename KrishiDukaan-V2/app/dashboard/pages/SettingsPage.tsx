'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { IS_DEMO } from '../demoMode';
import { getRetailerById, updateRetailer } from '../services/retailerService';
import { Truck, DollarSign, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import type { DeliverySettings } from '../types/firebase';

export function SettingsPage() {
  const { shop, userDoc } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [delivery, setDelivery] = useState<DeliverySettings>({ enabled: false, radiusKm: 10, minOrderAmount: 500, chargePerKm: 5 });

  const retailerId = userDoc?.retailerId ?? shop?.id ?? '';

  useEffect(() => {
    if (IS_DEMO || !retailerId) return;
    getRetailerById(retailerId).then((r) => {
      if (r?.delivery) setDelivery(r.delivery);
    }).catch(() => null);
  }, [retailerId]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateRetailer(retailerId, { delivery });
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  }

  return (
    <AppShell title="Settings" subtitle="Configure delivery and preferences" headerActions={<Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save</Button>}>
      {/* Delivery */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={18} style={{ color: 'var(--kd-primary)' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Delivery Settings</span>
          </div>
          <button onClick={() => setDelivery({ ...delivery, enabled: !delivery.enabled })} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: delivery.enabled ? 'var(--kd-primary)' : 'var(--kd-text-muted)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--kd-font)' }}>
            {delivery.enabled ? <><ToggleRight size={22} /> Enabled</> : <><ToggleLeft size={22} /> Disabled</>}
          </button>
        </div>
        {delivery.enabled ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input label="Delivery Radius (km)" type="number" value={String(delivery.radiusKm)} onChange={(e) => setDelivery({ ...delivery, radiusKm: Number(e.target.value) })} icon={<Truck size={14} />} />
            <Input label="Min Order Amount (₹)" type="number" value={String(delivery.minOrderAmount)} onChange={(e) => setDelivery({ ...delivery, minOrderAmount: Number(e.target.value) })} icon={<DollarSign size={14} />} />
            <Input label="Charge Per Km (₹)" type="number" value={String(delivery.chargePerKm)} onChange={(e) => setDelivery({ ...delivery, chargePerKm: Number(e.target.value) })} icon={<DollarSign size={14} />} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--kd-text-muted)', fontSize: 13 }}>
            Enable home delivery to let farmers order products from your shop
          </div>
        )}
      </Card>

      {/* Support */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Support</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 20, borderRadius: 10, background: 'var(--kd-primary-light)', border: '1px solid var(--kd-primary-border)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--kd-green-700)', marginBottom: 4 }}>📞 Call Support</div>
            <div style={{ fontSize: 13, color: 'var(--kd-green-600)' }}>+91 98765 43210</div>
            <div style={{ fontSize: 11, color: 'var(--kd-text-muted)', marginTop: 4 }}>Mon-Sat, 9 AM – 7 PM</div>
          </div>
          <div style={{ padding: 20, borderRadius: 10, background: 'var(--kd-info-light)', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--kd-blue-600)', marginBottom: 4 }}>📧 Email</div>
            <div style={{ fontSize: 13, color: 'var(--kd-blue-600)' }}>support@krishidukan.com</div>
            <div style={{ fontSize: 11, color: 'var(--kd-text-muted)', marginTop: 4 }}>Response within 24 hours</div>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
