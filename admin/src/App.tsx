import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, Users, TrendingUp, Search, RefreshCw, Smartphone,
  Download, Zap, Globe, Hash, ChevronUp,
  ChevronDown, BarChart2, UserCheck, PieChart, CreditCard
} from 'lucide-react';
import './index.css';

// ─── Types ──────────────────────────────────────────────────────
interface FiinnyUser {
  phone: string; name: string; lastLogDate: string;
  lastLogAt: Timestamp | null; onboarded: boolean;
  country: string; language: string; createdAt: Timestamp | null;
}
interface ActivityLog { date: string; openCount: number; lastOpenAt: Timestamp | null; }
interface UserWithActivity extends FiinnyUser {
  daysActive: number; totalSessions: number; activityLoaded: boolean;
}
interface DAUEntry { date: string; count: number; users: FiinnyUser[]; }
interface ParsedMoneyReport {
  totalParsed: number;
  totalDebit: number;
  totalCredit: number;
  friendsMoney: number;
  expenseCount: number;
  incomeCount: number;
  totalCount: number;
  topTransactions?: {
    id: string;
    amount: number;
    date: string;
    type: "expense" | "income";
    userId: string;
    userName: string;
    userPhone: string;
    message: string;
  }[];
}
type View = 'overview' | 'dau' | 'users' | 'topusers' | 'retention' | 'parsed_money';
type Theme = 'dark' | 'light' | 'purple' | 'midnight' | 'saffron';
// ... (rest of types and helpers)
type SortDir = 'asc' | 'desc';

// Safe Timestamp to Date string conversion
const tsToDateStr = (ts: any): string => {
  try {
    if (!ts) return '';
    if (typeof ts.toDate === 'function') return ts.toDate().toISOString().split('T')[0];
    if (ts.seconds) return new Date(ts.seconds * 1000).toISOString().split('T')[0];
    return '';
  } catch { return ''; }
};
const fmtDate = (ts: any) => {
  if (!ts) return '—';
  try {
    const d = typeof ts.toDate === 'function' ? ts.toDate() : ts.seconds ? new Date(ts.seconds * 1000) : null;
    if (!d) return '—';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
};
const todayStr = () => new Date().toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
const datesBetween = (start: string, end: string) => {
  const dates: string[] = []; const cur = new Date(start); const last = new Date(end);
  while (cur <= last) { dates.push(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1); }
  return dates;
};
const fmtNum = (n: number) => !isFinite(n) || isNaN(n) ? '0' : n >= 1e7 ? `${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `${(n/1e5).toFixed(1)}L` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n);

// Animated counter hook
function useCounter(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    let start = 0; const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

// CSV export
const exportCSV = (data: UserWithActivity[], filename: string) => {
  const headers = ['Name', 'Phone', 'Last Active', 'Days Active', 'Sessions', 'Language', 'Country', 'Onboarded'];
  const rows = data.map(u => [u.name, u.phone, u.lastLogDate, u.daysActive, u.totalSessions, u.language, u.country, u.onboarded]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
};

// Themes config
const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'dark',     label: 'Dark',     color: '#7c3aed' },
  { id: 'light',    label: 'Light',    color: '#7c3aed' },
  { id: 'purple',   label: 'Aura',     color: '#a78bfa' },
  { id: 'midnight', label: 'Midnight', color: '#0ea5e9' },
  { id: 'saffron',  label: 'Saffron',  color: '#fb923c' },
];

const themeColors: Record<Theme, string> = {
  dark: '#7c3aed', light: '#7c3aed', purple: '#a78bfa', midnight: '#0ea5e9', saffron: '#fb923c'
};

// ─── Main App ────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('fa-theme') as Theme) || 'dark');
  const [view, setView] = useState<View>('overview');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<FiinnyUser[]>([]);
  const [userActivity, setUserActivity] = useState<Record<string, ActivityLog[]>>({});
  const [fetched, setFetched] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DAUEntry | null>(null);
  const [sortKey, setSortKey] = useState<keyof UserWithActivity>('totalSessions');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Parsed Money state
  const [report, setReport] = useState<ParsedMoneyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const getReport = httpsCallable(functions, 'getParsedMoneyReport');
      const res = await getReport({ startDate, endDate });
      setReport(res.data as ParsedMoneyReport);
    } catch (err) {
      console.error('fetchReport error:', err);
    } finally {
      setReportLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (view === 'parsed_money') fetchReport();
  }, [view, fetchReport]);


  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fa-theme', theme);
  }, [theme]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users: FiinnyUser[] = snap.docs.map(doc => {
        const d = doc.data() || {};
        return {
          phone: doc.id,
          name: (d.name as string) || '',
          lastLogDate: (d.lastLogDate as string) || '',
          lastLogAt: d.lastLogAt || null,
          onboarded: Boolean(d.onboarded),
          country: (d.country as string) || '',
          language: (d.language as string) || '',
          createdAt: d.createdAt || null
        };
      });
      setAllUsers(users);
      setFetched(true);
    } catch (err) {
      console.error('fetchUsers error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch activity logs for active users
  const fetchActivityLogs = useCallback(async (users: FiinnyUser[], start: string, end: string) => {
    const activePhones = users.filter(u => u.lastLogDate >= start && u.lastLogDate <= end).map(u => u.phone);
    if (!activePhones.length) return;
    setActivityLoading(true);
    const result: Record<string, ActivityLog[]> = {};
    const BATCH = 15;
    for (let i = 0; i < activePhones.length; i += BATCH) {
      await Promise.all(activePhones.slice(i, i + BATCH).map(async phone => {
        try {
          const snap = await getDocs(collection(db, 'users', phone, 'activityLog'));
          result[phone] = snap.docs.map(d => ({
            date: d.data().date || d.id, openCount: d.data().openCount || 1, lastOpenAt: d.data().lastOpenAt || null
          })).filter(l => l.date >= start && l.date <= end);
        } catch { result[phone] = []; }
      }));
    }
    setUserActivity(prev => ({ ...prev, ...result }));
    setActivityLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (allUsers.length) fetchActivityLogs(allUsers, startDate, endDate); }, [allUsers, startDate, endDate, fetchActivityLogs]);

  const refresh = () => { setUserActivity({}); fetchUsers(); };

  // Computed data
  const usersWithActivity = useMemo<UserWithActivity[]>(() => allUsers.map(u => {
    const logs = userActivity[u.phone] ?? null;
    const daysActive = logs ? logs.length : (u.lastLogDate >= startDate && u.lastLogDate <= endDate ? 1 : 0);
    const totalSessions = logs ? logs.reduce((s, l) => s + l.openCount, 0) : (daysActive > 0 ? 1 : 0);
    return { ...u, daysActive, totalSessions, activityLoaded: logs !== null };
  }), [allUsers, userActivity, startDate, endDate]);

  const activeUsers = useMemo(() => usersWithActivity.filter(u => u.lastLogDate >= startDate && u.lastLogDate <= endDate), [usersWithActivity, startDate, endDate]);

  const dauData = useMemo<DAUEntry[]>(() => {
    const map: Record<string, FiinnyUser[]> = {};
    datesBetween(startDate, endDate).forEach(d => { map[d] = []; });
    allUsers.forEach(u => { if (u.lastLogDate >= startDate && u.lastLogDate <= endDate) { if (!map[u.lastLogDate]) map[u.lastLogDate] = []; map[u.lastLogDate].push(u); } });
    return Object.entries(map).map(([date, users]) => ({ date, count: users.length, users })).sort((a, b) => a.date.localeCompare(b.date));
  }, [allUsers, startDate, endDate]);

  const chartData = useMemo(() => dauData.map(d => ({ date: d.date.slice(5), dau: d.count })), [dauData]);

  const totalDAU = useMemo(() => new Set(activeUsers.map(u => u.phone)).size, [activeUsers]);
  const peakDay = useMemo(() => [...dauData].sort((a, b) => b.count - a.count)[0] ?? null, [dauData]);
  const avgDAU = useMemo(() => dauData.length ? Math.round(dauData.reduce((s, d) => s + d.count, 0) / dauData.length) : 0, [dauData]);
  const totalSessions = useMemo(() => activeUsers.reduce((s, u) => s + u.totalSessions, 0), [activeUsers]);
  const newUsers = useMemo(() => {
    return allUsers.filter(u => {
      const ds = tsToDateStr(u.createdAt);
      return ds >= startDate && ds <= endDate;
    }).length;
  }, [allUsers, startDate, endDate]);

  // Sorted user list
  const sortedUsers = useMemo(() => {
    const filtered = activeUsers.filter(u => {
      if (!search) return true;
      return u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    });
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] as any; const vb = b[sortKey] as any;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [activeUsers, search, sortKey, sortDir]);

  const handleSort = (key: keyof UserWithActivity) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const SortIcon = ({ k }: { k: keyof UserWithActivity }) =>
    sortKey === k ? (sortDir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />) : null;

  // Language breakdown
  const langBreakdown = useMemo(() => {
    const m: Record<string, number> = {};
    activeUsers.forEach(u => { const l = u.language || 'unknown'; m[l] = (m[l] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [activeUsers]);

  // Country breakdown
  const countryBreakdown = useMemo(() => {
    const m: Record<string, number> = {};
    activeUsers.forEach(u => { const c = u.country || 'unknown'; m[c] = (m[c] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [activeUsers]);

  // Animated KPI values
  const aniDAU = useCounter(totalDAU);
  const aniSessions = useCounter(totalSessions);
  const aniAvg = useCounter(avgDAU);
  const aniTotal = useCounter(allUsers.length);
  const aniNew = useCounter(newUsers);

  const primaryColor = themeColors[theme];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <div className="ct-label">{label}</div>
        <div className="ct-value">{payload[0].value} users</div>
      </div>
    );
  };

  const navItems = [
    { id: 'overview',     label: 'Overview',      icon: <BarChart2 size={17} /> },
    { id: 'parsed_money', label: 'Parsed Money',  icon: <PieChart size={17} /> },
    { id: 'dau',          label: 'DAU Chart',     icon: <Activity size={17} /> },
    { id: 'users',        label: 'User Lookup',   icon: <Search size={17} /> },
    { id: 'topusers',     label: 'Top Users',     icon: <TrendingUp size={17} /> },
    { id: 'retention',    label: 'Retention',     icon: <UserCheck size={17} /> },
  ] as const;

  // Date preset handler
  const setPreset = (days: number | null) => {
    if (days === null) { setStartDate(todayStr()); setEndDate(todayStr()); }
    else { setStartDate(daysAgo(days - 1)); setEndDate(todayStr()); }
  };

  return (
    <div className="shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Smartphone size={17} color="#fff" />
          </div>
          <span className="logo-text">Fiinny <span>Admin</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Analytics</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id as View)}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: '0.5rem' }}>Data</div>
          <button className="nav-item" onClick={() => exportCSV(sortedUsers, `fiinny-users-${todayStr()}.csv`)}>
            <Download size={17} /> Export CSV
          </button>
          <button className="nav-item" onClick={refresh} disabled={loading || activityLoading}>
            <RefreshCw size={17} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* Theme switcher */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: '0.5rem' }}>Theme</div>
            <div className="theme-picker">
              {THEMES.map(t => (
                <div
                  key={t.id}
                  className={`theme-dot ${theme === t.id ? 'active' : ''}`}
                  style={{ background: t.color }}
                  title={t.label}
                  onClick={() => setTheme(t.id)}
                />
              ))}
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.5rem' }}>
            {fetched ? `${allUsers.length} users loaded` : 'Loading…'}
          </div>
        </div>
      </aside>

      {/* ── MAIN COLUMN ── */}
      <div className="main-col">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">
            {navItems.find(n => n.id === view)?.label ?? 'Dashboard'}
            {(loading || activityLoading || reportLoading) && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 400 }}>
                <RefreshCw size={11} className="spin" style={{ display: 'inline', marginRight: 4 }} />
                {loading ? 'Fetching users' : activityLoading ? 'Loading sessions' : 'Calculating money'}…
              </span>
            )}
          </div>
          <div className="topbar-right">
            {/* Date controls */}
            <label className="ctrl-label">From</label>
            <input type="date" value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)} />
            <label className="ctrl-label">To</label>
            <input type="date" value={endDate} max={todayStr()} min={startDate} onChange={e => setEndDate(e.target.value)} />
            <button className="btn btn-ghost" onClick={() => setPreset(1)}>Today</button>
            <button className="btn btn-ghost" onClick={() => setPreset(7)}>7d</button>
            <button className="btn btn-ghost" onClick={() => setPreset(30)}>300d</button>
            <button className="btn btn-ghost" onClick={() => { setStartDate('2023-01-01'); setEndDate(todayStr()); }}>Till Date</button>
          </div>
        </header>

        {/* Content */}
        <div className="content">

          {/* ── OVERVIEW ── */}
          {view === 'overview' && (
            <div className="fade-up">
              {/* KPI row */}
              <div className="kpi-row">
                {[
                  { label: 'Active Users', value: aniDAU, sub: 'in date range', color: primaryColor, icon: <Users size={18} color={primaryColor} /> },
                  { label: 'Total Sessions', value: aniSessions, sub: 'app opens', color: 'var(--green)', icon: <Zap size={18} color="var(--green)" /> },
                  { label: 'Avg DAU / day', value: aniAvg, sub: 'daily average', color: 'var(--accent)', icon: <Activity size={18} color="var(--accent)" /> },
                  { label: 'New Users', value: aniNew, sub: 'joined in range', color: 'var(--pink)', icon: <UserCheck size={18} color="var(--pink)" /> },
                  { label: 'Total Registered', value: aniTotal, sub: 'all time', color: 'var(--amber)', icon: <Globe size={18} color="var(--amber)" /> },
                ].map(k => (
                  <div className="kpi" key={k.label}>
                    <div className="kpi-glow" style={{ background: k.color }} />
                    <div className="kpi-icon" style={{ background: `${k.color}22` }}>{k.icon}</div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{fmtNum(k.value)}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Chart + breakdowns */}
              <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-header">
                    <div className="dot" style={{ background: primaryColor }} />
                    <h2>Daily Active Users Trend</h2>
                    <span className="card-meta">{datesBetween(startDate, endDate).length} days</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="dau" stroke={primaryColor} strokeWidth={2.5} fill="url(#dauGrad)" dot={false} activeDot={{ r: 5, fill: primaryColor }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Language breakdown */}
                  <div className="card" style={{ flex: 1 }}>
                    <div className="card-header">
                      <div className="dot" style={{ background: 'var(--accent)' }} />
                      <h2>Language</h2>
                    </div>
                    {langBreakdown.slice(0, 6).map(([lang, cnt]) => (
                      <div key={lang} className="bar-row">
                        <div className="bar-label">{lang}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${(cnt / (langBreakdown[0]?.[1] ?? 1)) * 100}%`, background: 'var(--accent)' }} />
                        </div>
                        <div className="bar-count" style={{ color: 'var(--accent)' }}>{cnt}</div>
                      </div>
                    ))}
                  </div>

                  {/* Country breakdown */}
                  <div className="card" style={{ flex: 1 }}>
                    <div className="card-header">
                      <div className="dot" style={{ background: 'var(--green)' }} />
                      <h2>Country</h2>
                    </div>
                    {countryBreakdown.map(([country, cnt]) => (
                      <div key={country} className="bar-row">
                        <div className="bar-label">{country || 'unknown'}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${(cnt / (countryBreakdown[0]?.[1] ?? 1)) * 100}%`, background: 'var(--green)' }} />
                        </div>
                        <div className="bar-count" style={{ color: 'var(--green)' }}>{cnt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Peak day + stats strip */}
              <div className="card">
                <div className="card-header"><div className="dot" style={{ background: 'var(--amber)' }} /><h2>Range Summary</h2></div>
                <div className="stat-strip">
                  {[
                    { num: totalDAU, lbl: 'Unique Users', color: primaryColor },
                    { num: peakDay?.count ?? 0, lbl: `Peak (${peakDay?.date ?? '—'})`, color: 'var(--amber)' },
                    { num: avgDAU, lbl: 'Daily Avg', color: 'var(--green)' },
                    { num: totalSessions, lbl: 'Total Sessions', color: 'var(--accent)' },
                    { num: newUsers, lbl: 'New Users', color: 'var(--pink)' },
                    { num: allUsers.filter(u => u.onboarded && u.lastLogDate >= startDate && u.lastLogDate <= endDate).length, lbl: 'Onboarded Active', color: 'var(--green)' },
                  ].map(({ num, lbl, color }) => (
                    <div key={lbl} className="stat-item">
                      <div className="stat-num" style={{ color }}>{fmtNum(num)}</div>
                      <div className="stat-lbl">{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PARSED MONEY ── */}
          {view === 'parsed_money' && (
            <div className="fade-up">
              <div className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(124, 58, 237, 0.05) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="kpi-icon" style={{ background: 'var(--purple-soft)', width: 48, height: 48 }}>
                    <Smartphone size={24} color="var(--purple)" />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Total Money Parsed</h1>
                    <p style={{ color: 'var(--text3)', margin: 0, fontSize: '0.85rem' }}>Investor Report — Aggregated platform volume</p>
                  </div>
                  <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={fetchReport} disabled={reportLoading}>
                    <RefreshCw size={14} className={reportLoading ? 'spin' : ''} /> Recalculate
                  </button>
                </div>

                <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div className="kpi">
                    <div className="kpi-glow" style={{ background: 'var(--purple)' }} />
                    <div className="kpi-label">Total Volume</div>
                    <div className="kpi-value" style={{ color: 'var(--purple)', fontSize: '2.2rem' }}>
                      ₹{fmtNum(report?.totalParsed ?? 0)}
                    </div>
                    <div className="kpi-sub">processed till date</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-glow" style={{ background: 'var(--amber)' }} />
                    <div className="kpi-label">Shared with Friends</div>
                    <div className="kpi-value" style={{ color: 'var(--amber)' }}>
                      ₹{fmtNum(report?.friendsMoney ?? 0)}
                    </div>
                    <div className="kpi-sub">split transactions</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-glow" style={{ background: 'var(--purple-soft)' }} />
                    <div className="kpi-label">Total Transactions</div>
                    <div className="kpi-value">
                      {fmtNum(report?.totalCount ?? 0)}
                    </div>
                    <div className="kpi-sub">events monitored</div>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-header">
                    <div className="dot" style={{ background: 'var(--pink)' }} />
                    <h2>Expenses (Debits)</h2>
                  </div>
                  <div style={{ padding: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Total Amount</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pink)' }}>₹{report?.totalDebit.toLocaleString('en-IN') ?? 0}</span>
                    </div>
                    <div className="bar-track" style={{ height: 12 }}>
                      <div className="bar-fill" style={{ width: '100%', background: 'var(--pink)' }} />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-shell)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Count</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{report?.expenseCount ?? 0}</div>
                      </div>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-shell)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Avg Ticket</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{Math.round((report?.totalDebit ?? 0) / (report?.expenseCount || 1))}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <div className="dot" style={{ background: 'var(--green)' }} />
                    <h2>Incomes (Credits)</h2>
                  </div>
                  <div style={{ padding: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Total Amount</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>₹{report?.totalCredit.toLocaleString('en-IN') ?? 0}</span>
                    </div>
                    <div className="bar-track" style={{ height: 12 }}>
                      <div className="bar-fill" style={{ width: '100%', background: 'var(--green)' }} />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-shell)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Count</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{report?.incomeCount ?? 0}</div>
                      </div>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-shell)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Avg Ticket</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{Math.round((report?.totalCredit ?? 0) / (report?.incomeCount || 1))}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: '1.25rem' }}>
                <div className="card-header">
                  <div className="dot" style={{ background: 'var(--purple)' }} />
                  <h2>Achievement Breakdown</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', padding: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="kpi-icon" style={{ background: 'var(--purple-soft)' }}><CreditCard size={18} color="var(--purple)" /></div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Financial Ingestors</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Monitoring {report?.totalCount ?? 0} source points including SMS and Gmail parsers.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="kpi-icon" style={{ background: 'var(--amber-soft)' }}><Users size={18} color="var(--amber)" /></div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Social Economy</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>₹{fmtNum(report?.friendsMoney ?? 0)} handled via peer-to-peer sharing and group settlements.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="kpi-icon" style={{ background: 'var(--green-soft)' }}><TrendingUp size={18} color="var(--green)" /></div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Retention Driver</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Users have tracked an average of ₹{fmtNum((report?.totalParsed ?? 0) / (allUsers.length || 1))} each.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── TOP 10 VERIFICATION TABLE ── */}
              {report?.topTransactions && report.topTransactions.length > 0 && (
                <div className="card" style={{ marginTop: '1.25rem' }}>
                  <div className="card-header">
                    <div className="dot" style={{ background: 'var(--amber)' }} />
                    <h2>Top 10 High-Volume Transactions</h2>
                    <span className="card-meta">Data Verification List</span>
                  </div>
                  <div className="table-wrap">
                    <table style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                      <thead style={{ background: 'var(--bg-shell)', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                          <th style={{ borderRadius: '8px 0 0 8px' }}>Amount</th>
                          <th>User Details</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th style={{ borderRadius: '0 8px 8px 0' }}>Raw Message / Memo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.topTransactions.map((tx) => (
                          <tr key={tx.id} style={{ background: 'var(--bg-shell)', transition: 'transform 0.2s' }}>
                            <td style={{ padding: '1rem', borderLeft: `4px solid ${tx.type === 'expense' ? 'var(--pink)' : 'var(--green)'}`, borderRadius: '8px 0 0 8px' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: tx.type === 'expense' ? 'var(--pink)' : 'var(--green)' }}>
                                ₹{tx.amount.toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 700 }}>{tx.userName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }} className="mono">{tx.userPhone}</div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                              {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className={`badge ${tx.type === 'expense' ? 'badge-pink' : 'badge-green'}`} style={{ textTransform: 'capitalize' }}>
                                {tx.type}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', maxWidth: '350px' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text2)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.message}>
                                {tx.message}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text3)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                    Only top 10 items are shown to ensure performance.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DAU CHART VIEW ── */}
          {view === 'dau' && (
            <div className="fade-up">
              <div style={{ display: 'grid', gridTemplateColumns: selectedDay ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                <div className="card">
                  <div className="card-header">
                    <div className="dot" style={{ background: primaryColor }} />
                    <h2>Daily Active Users</h2>
                    <span className="card-meta">{dauData.length} days — click a bar to drill down</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                      onClick={(e) => {
                        if (e?.activeLabel) {
                          const full = dauData.find(d => d.date.slice(5) === e.activeLabel);
                          setSelectedDay(full ?? null);
                        }
                      }}>
                      <defs>
                        <linearGradient id="dauGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="dau" stroke={primaryColor} strokeWidth={2.5} fill="url(#dauGrad2)" dot={{ r: 4, fill: primaryColor, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Bar list below chart */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: 220, overflowY: 'auto' }}>
                    {[...dauData].reverse().map(d => (
                      <div key={d.date} className="bar-row" style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedDay(selectedDay?.date === d.date ? null : d)}>
                        <div className="bar-label" style={{ color: selectedDay?.date === d.date ? 'var(--amber)' : undefined }}>{d.date}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${(d.count / Math.max(...dauData.map(x => x.count), 1)) * 100}%`, background: selectedDay?.date === d.date ? 'var(--amber)' : primaryColor }} />
                        </div>
                        <div className="bar-count">{d.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDay && (
                  <div className="card fade-up">
                    <div className="card-header">
                      <div className="dot" style={{ background: 'var(--amber)' }} />
                      <h2>{selectedDay.date} — {selectedDay.count} users</h2>
                      <button className="btn-icon" onClick={() => setSelectedDay(null)} style={{ marginLeft: 'auto' }}>✕</button>
                    </div>
                    <div className="table-wrap" style={{ maxHeight: 500, overflowY: 'auto' }}>
                      <table>
                        <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Last Seen</th></tr></thead>
                        <tbody>
                          {selectedDay.users.map((u, i) => (
                            <tr key={u.phone}>
                              <td className="rank-cell">{i + 1}</td>
                              <td><strong>{u.name || '—'}</strong></td>
                              <td className="mono">{u.phone}</td>
                              <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{fmtDate(u.lastLogAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── USER LOOKUP ── */}
          {view === 'users' && (
            <div className="card fade-up">
              <div className="card-header">
                <div className="dot" style={{ background: 'var(--green)' }} />
                <h2>User Lookup</h2>
                <span className="card-meta">{sortedUsers.length} users</span>
                <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => exportCSV(sortedUsers, `users-${todayStr()}.csv`)}>
                  <Download size={13} /> Export
                </button>
              </div>
              <div className="search-bar" style={{ marginBottom: '1rem', maxWidth: 340 }}>
                <Search size={15} color="var(--text3)" />
                <input placeholder="Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <span style={{ cursor: 'pointer', color: 'var(--text3)' }} onClick={() => setSearch('')}>✕</span>}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className={sortKey === 'name' ? 'sort-active' : ''} onClick={() => handleSort('name')}>Name <SortIcon k="name" /></th>
                      <th>Phone</th>
                      <th className={sortKey === 'daysActive' ? 'sort-active' : ''} onClick={() => handleSort('daysActive')}>Days Active <SortIcon k="daysActive" /></th>
                      <th className={sortKey === 'totalSessions' ? 'sort-active' : ''} onClick={() => handleSort('totalSessions')}><Hash size={11} style={{ display: 'inline' }} /> Sessions <SortIcon k="totalSessions" /></th>
                      <th className={sortKey === 'lastLogDate' ? 'sort-active' : ''} onClick={() => handleSort('lastLogDate')}>Last Active <SortIcon k="lastLogDate" /></th>
                      <th>Time</th>
                      <th>Lang</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.length === 0 ? (
                      <tr><td colSpan={9} className="empty">{search ? 'No users match' : 'No active users in this range'}</td></tr>
                    ) : sortedUsers.map((u, i) => (
                      <tr key={u.phone}>
                        <td className="rank-cell">{i + 1}</td>
                        <td><strong>{u.name || '—'}</strong></td>
                        <td className="mono">{u.phone}</td>
                        <td><span className="badge badge-blue">{u.daysActive}d</span></td>
                        <td><span className={`badge ${u.totalSessions >= 5 ? 'badge-green' : 'badge-amber'}`}>{u.activityLoaded ? `${u.totalSessions}×` : '1×'}</span></td>
                        <td><span className="badge badge-purple">{u.lastLogDate}</span></td>
                        <td style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{fmtDate(u.lastLogAt)}</td>
                        <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{u.language || '—'}</td>
                        <td><span className={`badge ${u.onboarded ? 'badge-green' : 'badge-amber'}`}>{u.onboarded ? '✓ Active' : 'Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text3)' }}>
                Click column headers to sort. Sessions powered by <code>activityLog</code> subcollection — shows 1× for users before app update.
              </p>
            </div>
          )}

          {/* ── TOP USERS ── */}
          {view === 'topusers' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card">
                <div className="card-header">
                  <div className="dot" style={{ background: 'var(--amber)' }} />
                  <h2>Top Users by Sessions</h2>
                  <span className="card-meta">top {Math.min(activeUsers.length, 50)}</span>
                  <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => exportCSV(sortedUsers.slice(0,50), `top-users-${todayStr()}.csv`)}>
                    <Download size={13} /> Export
                  </button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Rank</th><th>Name</th><th>Phone</th><th>Days Active</th><th>Sessions</th><th>Last Active</th><th>Country</th><th>Lang</th></tr>
                    </thead>
                    <tbody>
                      {[...activeUsers].sort((a,b) => b.totalSessions - a.totalSessions).slice(0,50).map((u, i) => {
                        const maxSess = activeUsers.reduce((m,x) => Math.max(m, x.totalSessions), 1);
                        return (
                          <tr key={u.phone}>
                            <td className="rank-cell">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</td>
                            <td><strong>{u.name||'—'}</strong></td>
                            <td className="mono">{u.phone}</td>
                            <td><span className="badge badge-blue">{u.daysActive}d</span></td>
                            <td>
                              <div className="bar-row" style={{ gap: '0.5rem', margin: 0 }}>
                                <div className="bar-track" style={{ maxWidth: 70 }}>
                                  <div className="bar-fill" style={{ width: `${(u.totalSessions/maxSess)*100}%`, background: 'var(--amber)' }} />
                                </div>
                                <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.85rem' }}>{u.totalSessions}×</span>
                              </div>
                            </td>
                            <td><span className="badge badge-purple">{u.lastLogDate}</span></td>
                            <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{u.country||'—'}</td>
                            <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{u.language||'—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><div className="dot" style={{ background: 'var(--accent)' }} /><h2>Language Breakdown</h2></div>
                  {langBreakdown.map(([lang, cnt]) => (
                    <div key={lang} className="bar-row">
                      <div className="bar-label">{lang}</div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${(cnt/(langBreakdown[0]?.[1]??1))*100}%`, background: 'var(--accent)' }} /></div>
                      <div className="bar-count" style={{ color: 'var(--accent)' }}>{cnt}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-header"><div className="dot" style={{ background: 'var(--green)' }} /><h2>Country Breakdown</h2></div>
                  {countryBreakdown.map(([country, cnt]) => (
                    <div key={country} className="bar-row">
                      <div className="bar-label">{country||'unknown'}</div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${(cnt/(countryBreakdown[0]?.[1]??1))*100}%`, background: 'var(--green)' }} /></div>
                      <div className="bar-count" style={{ color: 'var(--green)' }}>{cnt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RETENTION ── */}
          {view === 'retention' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="kpi-row">
                {[
                  { label: 'Onboarded Users', value: allUsers.filter(u=>u.onboarded).length, color: 'var(--green)', sub: 'completed onboarding' },
                  { label: 'Onboarding Rate', value: Math.round((allUsers.filter(u=>u.onboarded).length / Math.max(allUsers.length,1)) * 100), color: primaryColor, sub: '% of all users', suffix: '%' },
                  { label: 'Active / Registered', value: Math.round((totalDAU / Math.max(allUsers.length,1))*100), color: 'var(--accent)', sub: 'activity rate in range', suffix: '%' },
                  { label: 'Peak DAU', value: peakDay?.count ?? 0, color: 'var(--amber)', sub: peakDay?.date ?? '—' },
                ].map(k => (
                  <div className="kpi" key={k.label}>
                    <div className="kpi-glow" style={{ background: k.color }} />
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color }}>{fmtNum(k.value)}{(k as any).suffix ?? ''}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-header"><div className="dot" style={{ background: primaryColor }} /><h2>Engagement Trend</h2></div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="dauGrad3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="dau" stroke={primaryColor} strokeWidth={2.5} fill="url(#dauGrad3)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cohort-style new vs returning */}
              <div className="card">
                <div className="card-header"><div className="dot" style={{ background: 'var(--pink)' }} /><h2>New vs Returning</h2></div>
                {[
                  { label: 'New Users (joined in range)', val: newUsers, color: 'var(--pink)' },
                  { label: 'Returning Users', val: Math.max(totalDAU - newUsers, 0), color: 'var(--green)' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bar-row" style={{ marginBottom: '0.5rem' }}>
                    <div className="bar-label" style={{ minWidth: 220, color: 'var(--text2)' }}>{label}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(val / Math.max(totalDAU, 1)) * 100}%`, background: color }} />
                    </div>
                    <div className="bar-count" style={{ color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
