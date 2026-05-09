import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { IS_DEMO } from '../demoMode';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { Bell, AlertTriangle, Package, Star, User, CheckCheck } from 'lucide-react';
import { timeAgo } from '../utils/formatters';
import type { NotificationDoc, NotificationType } from '../types/firebase';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  low_stock: <AlertTriangle size={16} />,
  inquiry: <User size={16} />,
  review: <Star size={16} />,
  system: <Bell size={16} />,
  profile: <Package size={16} />,
};

const typeColors: Record<NotificationType, string> = {
  low_stock: 'var(--kd-amber-500)',
  inquiry: 'var(--kd-blue-500)',
  review: 'var(--kd-purple-500)',
  system: 'var(--kd-gray-500)',
  profile: 'var(--kd-green-500)',
};

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Array<{ id: string } & NotificationDoc>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const uid = user && 'uid' in user ? user.uid : '';

  useEffect(() => {
    if (IS_DEMO || !uid) { setLoading(false); return; }
    getNotifications(uid, 50).then(setNotifs).catch(() => null).finally(() => setLoading(false));
  }, [uid]);

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function handleMarkAll() {
    if (!uid) return;
    await markAllAsRead(uid);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const filtered = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <AppShell title="Notifications" subtitle={`${unreadCount} unread`} headerActions={
      unreadCount > 0 ? <Button variant="outline" size="sm" onClick={handleMarkAll} icon={<CheckCheck size={14} />}>Mark All Read</Button> : undefined
    }>
      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'unread'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 20, border: filter === f ? '1px solid var(--kd-primary)' : '1px solid var(--kd-border)',
            background: filter === f ? 'var(--kd-primary-light)' : 'var(--kd-surface)', color: filter === f ? 'var(--kd-green-700)' : 'var(--kd-text-secondary)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--kd-font)', textTransform: 'capitalize',
          }}>
            {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--kd-text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell size={28} />}
            title={filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            description="You'll receive alerts for low stock, new inquiries, and reviews here."
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((n) => (
            <Card key={n.id} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${typeColors[n.type]}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: typeColors[n.type], flexShrink: 0,
                }}>
                  {typeIcons[n.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: 'var(--kd-text-primary)' }}>{n.title}</span>
                    {!n.read && <Badge variant="info" dot>New</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--kd-text-secondary)', lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: 'var(--kd-text-muted)' }}>{n.createdAt ? timeAgo(n.createdAt) : ''}</span>
                  {!n.read && (
                    <button onClick={() => void handleMarkRead(n.id)} style={{ fontSize: 11, color: 'var(--kd-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--kd-font)', fontWeight: 500 }}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
