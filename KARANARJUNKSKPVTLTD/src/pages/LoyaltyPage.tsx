import { useState, useEffect } from 'react';
import { Star, Users, Settings, Loader2, Save, TrendingUp, Gift } from 'lucide-react';
import {
  collection, query, orderBy, limit, getDocs, doc, getDoc,
  setDoc, serverTimestamp, updateDoc, increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { useToast } from '../contexts/ToastContext';

interface LoyaltyConfig {
  pointsPerRupee: number;
  pointsValue: number;   // rupee value of 1 point when redeeming
  minRedeemPoints: number;
  tiers: { name: string; minPoints: number; multiplier: number }[];
  enabled: boolean;
}

interface CustomerLoyalty {
  id: string;
  name?: string;
  phone?: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier?: string;
  lastActivity?: any;
}

const DEFAULT_CONFIG: LoyaltyConfig = {
  pointsPerRupee: 1,
  pointsValue: 0.25,
  minRedeemPoints: 100,
  tiers: [
    { name: 'Silver', minPoints: 0, multiplier: 1 },
    { name: 'Gold', minPoints: 500, multiplier: 1.5 },
    { name: 'Platinum', minPoints: 2000, multiplier: 2 },
  ],
  enabled: true,
};

function getTier(points: number, tiers: LoyaltyConfig['tiers']) {
  const sorted = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find(t => points >= t.minPoints)?.name || tiers[0]?.name || 'Silver';
}

export default function LoyaltyPage() {
  const { tenantId } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'customers' | 'config'>('customers');
  const [config, setConfig] = useState<LoyaltyConfig>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!tenantId) return null;

  // Load config
  useEffect(() => {
    const ref = getTenantDoc(db, tenantId!, 'settings', 'loyalty');
    getDoc(ref).then(snap => {
      if (snap.exists()) setConfig({ ...DEFAULT_CONFIG, ...snap.data() } as LoyaltyConfig);
    }).finally(() => setConfigLoading(false));
  }, [tenantId]);

  // Load customers
  useEffect(() => {
    if (activeTab !== 'customers') return;
    setCustomersLoading(true);
    const col = getTenantCollection(db, tenantId!, 'loyalty');
    getDocs(query(col, orderBy('points', 'desc'), limit(100)))
      .then(snap => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerLoyalty))))
      .finally(() => setCustomersLoading(false));
  }, [tenantId, activeTab]);

  async function saveConfig() {
    setSavingConfig(true);
    try {
      const ref = getTenantDoc(db, tenantId!, 'settings', 'loyalty');
      await setDoc(ref, { ...config, updatedAt: serverTimestamp() }, { merge: true });
      showToast('Loyalty config saved', 'success');
    } catch (e: any) {
      showToast('Failed to save: ' + e.message, 'error');
    } finally {
      setSavingConfig(false);
    }
  }

  function updateTier(idx: number, field: keyof LoyaltyConfig['tiers'][0], value: string | number) {
    setConfig(c => ({
      ...c,
      tiers: c.tiers.map((t, i) => i === idx ? { ...t, [field]: field === 'name' ? value : Number(value) } : t),
    }));
  }

  function addTier() {
    setConfig(c => ({ ...c, tiers: [...c.tiers, { name: 'New Tier', minPoints: 0, multiplier: 1 }] }));
  }

  function removeTier(idx: number) {
    setConfig(c => ({ ...c, tiers: c.tiers.filter((_, i) => i !== idx) }));
  }

  const filtered = customers.filter(c =>
    !searchTerm || c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone?.includes(searchTerm)
  );

  const totalPoints = customers.reduce((s, c) => s + (c.points || 0), 0);
  const totalCustomers = customers.length;

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" /> Loyalty & Memberships
          </h1>
          <p className="text-gray-500 text-sm mt-1">Reward repeat customers with points and tiers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: totalCustomers.toString(), icon: <Users className="w-5 h-5 text-blue-500" /> },
            { label: 'Points in Circulation', value: totalPoints.toLocaleString(), icon: <Gift className="w-5 h-5 text-yellow-500" /> },
            { label: 'Points per ₹1', value: config.pointsPerRupee.toString(), icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
            { label: '1 Point = ₹', value: config.pointsValue.toString(), icon: <Star className="w-5 h-5 text-purple-500" /> },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">{stat.icon}<p className="text-xs text-gray-500">{stat.label}</p></div>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['customers', 'config'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'customers' ? <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />Customers</span> : <span className="flex items-center gap-1.5"><Settings className="w-4 h-4" />Config</span>}
            </button>
          ))}
        </div>

        {/* Customers tab */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Search by name or phone…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <span className="text-sm text-gray-400">{filtered.length} customers</span>
            </div>

            {customersLoading ? (
              <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No loyalty customers yet</p>
                <p className="text-xs mt-1">Points are automatically added when customers checkout at POS</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Tier</th>
                      <th className="pb-3 pr-4 text-right">Current Points</th>
                      <th className="pb-3 pr-4 text-right">Total Earned</th>
                      <th className="pb-3 text-right">Total Redeemed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const tier = getTier(c.points, config.tiers);
                      const tierColors: Record<string, string> = {
                        Silver: 'bg-gray-100 text-gray-600',
                        Gold: 'bg-yellow-100 text-yellow-700',
                        Platinum: 'bg-purple-100 text-purple-700',
                      };
                      return (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-800">{c.name || '—'}</p>
                            <p className="text-xs text-gray-400">{c.phone || c.id}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[tier] || 'bg-gray-100 text-gray-600'}`}>
                              {tier}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-gray-800">
                            {(c.points || 0).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 text-right text-gray-600">
                            {(c.totalEarned || 0).toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-gray-600">
                            {(c.totalRedeemed || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Config tab */}
        {activeTab === 'config' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Earning & Redemption Rules</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Enable Loyalty</span>
                  <div
                    onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
                    className={`w-10 h-5 rounded-full transition-colors ${config.enabled ? 'bg-blue-600' : 'bg-gray-200'} relative cursor-pointer`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Points per ₹1 Spent</label>
                  <input
                    type="number" min={0.1} step={0.1}
                    value={config.pointsPerRupee}
                    onChange={e => setConfig(c => ({ ...c, pointsPerRupee: parseFloat(e.target.value) || 1 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">₹ Value per Point (Redemption)</label>
                  <input
                    type="number" min={0.01} step={0.01}
                    value={config.pointsValue}
                    onChange={e => setConfig(c => ({ ...c, pointsValue: parseFloat(e.target.value) || 0.25 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Points to Redeem</label>
                  <input
                    type="number" min={1} step={1}
                    value={config.minRedeemPoints}
                    onChange={e => setConfig(c => ({ ...c, minRedeemPoints: parseInt(e.target.value) || 100 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Membership Tiers</h3>
                <button onClick={addTier} className="text-sm text-blue-600 font-medium hover:underline">+ Add Tier</button>
              </div>
              <div className="space-y-3">
                {config.tiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Tier name"
                      value={tier.name}
                      onChange={e => updateTier(idx, 'name', e.target.value)}
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Min pts:</span>
                      <input
                        type="number" min={0}
                        className="w-20 border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={tier.minPoints}
                        onChange={e => updateTier(idx, 'minPoints', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Multiplier:</span>
                      <input
                        type="number" min={1} step={0.1}
                        className="w-16 border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={tier.multiplier}
                        onChange={e => updateTier(idx, 'multiplier', e.target.value)}
                      />
                    </div>
                    {config.tiers.length > 1 && (
                      <button onClick={() => removeTier(idx)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                disabled={savingConfig}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
