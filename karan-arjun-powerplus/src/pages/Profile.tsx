import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { arrayUnion, collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { Icons } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';

interface OrderRecord {
  id: string;
  createdAt?: { seconds?: number };
  status?: string;
  totalAmount?: number;
  items?: Array<{ name: string; quantity: number }>;
}

interface TicketRecord {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  date?: string;
  createdAt?: { seconds?: number };
  messages: Array<{
    id: string;
    sender: 'admin' | 'customer';
    text: string;
    createdAt: number;
  }>;
}

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [grievances, setGrievances] = useState<TicketRecord[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || profile?.role === 'admin') {
      return;
    }

    const ordersQuery = query(collection(db, 'orders'), where('uid', '==', user.uid));
    const grievancesQuery = query(collection(db, 'grievances'), where('uid', '==', user.uid));

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const list = snapshot.docs
        .map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as Omit<OrderRecord, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setOrders(list);
    });

    const unsubscribeGrievances = onSnapshot(grievancesQuery, (snapshot) => {
      const list = snapshot.docs
        .map((docItem) => {
          const data = docItem.data();
          const messages = Array.isArray(data.messages)
            ? data.messages
                .map((item) => ({
                  id: String(item?.id ?? ''),
                  sender: (item?.sender === 'customer' ? 'customer' : 'admin') as 'admin' | 'customer',
                  text: String(item?.text ?? ''),
                  createdAt: Number(item?.createdAt ?? 0),
                }))
                .filter((item) => item.id && item.text)
                .sort((a, b) => a.createdAt - b.createdAt)
            : [];
          return {
            id: docItem.id,
            ticketId: String(data.ticketId ?? `GRV-${docItem.id.slice(0, 8).toUpperCase()}`),
            subject: String(data.subject ?? ''),
            description: String(data.description ?? ''),
            status: (data.status as TicketRecord['status']) ?? 'Pending',
            date: String(data.date ?? '-'),
            createdAt: data.createdAt as TicketRecord['createdAt'],
            messages,
          };
        })
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setGrievances(list);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeGrievances();
    };
  }, [user, profile?.role]);

  const initials = useMemo(() => {
    const value = profile?.name ?? user?.displayName ?? 'User';
    return value
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [profile?.name, user?.displayName]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-primary font-sans font-semibold">
        Loading account...
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!user) {
      setError('Please sign in again.');
      return;
    }

    setSubmitting(true);
    try {
      const grievanceRef = doc(collection(db, 'grievances'));
      const ticketId = `GRV-${grievanceRef.id.slice(0, 8).toUpperCase()}`;
      await setDoc(grievanceRef, {
        ticketId,
        uid: user.uid,
        userName: profile?.name ?? user.displayName ?? 'Power Plus User',
        subject: subject.trim(),
        description: description.trim(),
        status: 'Pending',
        date: new Date().toLocaleDateString('en-IN'),
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubject('');
      setDescription('');
      setInfo(`Your ticket has been submitted successfully. Ticket ID: ${ticketId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerReply = async (ticket: TicketRecord) => {
    const replyText = (replyDrafts[ticket.id] ?? '').trim();
    if (!user || !replyText) return;
    setSendingReplyId(ticket.id);
    try {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await updateDoc(doc(db, 'grievances', ticket.id), {
        messages: arrayUnion({
          id: messageId,
          sender: 'customer',
          text: replyText,
          createdAt: Date.now(),
        }),
        updatedAt: serverTimestamp(),
      });
      setReplyDrafts((prev) => ({ ...prev, [ticket.id]: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply.');
    } finally {
      setSendingReplyId(null);
    }
  };

  return (
    <div className="flex flex-col py-24 px-8 max-w-5xl mx-auto gap-12 min-h-screen relative">
      <header className="mb-2 relative z-10 text-center">
        <h1 className="font-sans text-4xl font-extrabold text-primary mb-2 tracking-tight">Your Profile</h1>
        <p className="text-on-surface-variant font-serif">Manage your account, orders, and support tickets.</p>
      </header>

      <div className="flex flex-col gap-10 relative z-10">
        <div className="glass-panel-dark rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="w-32 h-32 shrink-0 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_20px_rgba(250,204,21,0.15)] flex items-center justify-center bg-gradient-to-br from-primary-container to-primary">
            <span className="text-4xl font-sans font-bold text-secondary-container">{initials || 'U'}</span>
          </div>

          <div className="flex flex-col flex-1 items-center md:items-start w-full">
            <h1 className="font-sans text-3xl font-bold text-white mb-1">{profile?.name ?? user?.displayName ?? 'Power Plus User'}</h1>
            <p className="text-white/60 mb-6 text-sm font-medium tracking-wide capitalize">{profile?.role ?? 'customer'} account</p>

            <div className="flex flex-col sm:flex-row gap-6 text-sm text-white/80 font-sans w-full justify-center md:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Icons.Mail className="w-5 h-5 text-secondary-container" />
                </div>
                <span className="font-medium text-lg">{profile?.email ?? user?.email ?? '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Icons.Phone className="w-5 h-5 text-secondary-container" />
                </div>
                <span className="font-medium text-lg">{profile?.phone || 'Not added yet'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-[2.5rem] p-10 border border-black/5 shadow-sm">
          <h2 className="font-sans text-2xl font-bold text-primary tracking-tight mb-8">Order History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Items</th>
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="py-4 text-right text-primary/60 font-semibold uppercase tracking-wider text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const date = order.createdAt?.seconds
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN')
                    : '-';
                  const productLabel = order.items?.map((item) => `${item.name} x${item.quantity}`).join(', ') ?? '-';
                  return (
                    <tr key={order.id} className="border-b border-primary/5 hover:bg-white/60 transition-colors">
                      <td className="py-5 font-semibold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-5 text-on-surface-variant font-medium">{date}</td>
                      <td className="py-5 font-semibold text-primary max-w-[260px] truncate">{productLabel}</td>
                      <td className="py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                          <Icons.Truck className="w-3.5 h-3.5" />
                          {order.status ?? 'Placed'}
                        </span>
                      </td>
                      <td className="py-5 text-right font-bold text-primary">
                        ₹{Number(order.totalAmount ?? 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td className="py-6 text-on-surface-variant" colSpan={5}>
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <h2 className="font-sans text-2xl font-bold text-primary tracking-tight mb-2">Support & Grievances</h2>
              <p className="text-on-surface-variant font-serif text-sm mb-8">Submit a ticket and our support team will get back to you.</p>
              {error && <p className="text-sm font-sans font-semibold text-red-600 mb-3">{error}</p>}
              {info && <p className="text-sm font-sans font-semibold text-emerald-700 mb-3">{info}</p>}
              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g., Order delay, Product damage..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-secondary-container px-6 py-3 rounded-xl font-sans font-bold text-sm w-full hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>

            <div className="flex-1">
              <h3 className="font-sans text-xl font-bold text-primary tracking-tight mb-6">Your Tickets</h3>
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                {grievances.map((ticket) => (
                  <div key={ticket.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-sans font-bold text-primary text-sm">{ticket.subject}</h4>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-primary/60 mt-1">{ticket.ticketId}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${
                          ticket.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ticket.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="font-serif text-xs text-on-surface-variant line-clamp-2">{ticket.description}</p>
                    {ticket.messages.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {ticket.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-lg px-3 py-2 border ${
                              message.sender === 'admin'
                                ? 'bg-primary/5 border-primary/10'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <p className="font-sans text-[10px] uppercase tracking-wider text-primary/60 mb-1">
                              {message.sender === 'admin' ? 'Admin Reply' : 'Your Message'}
                            </p>
                            <p className="font-sans text-xs text-primary/90">{message.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {ticket.status === 'Resolved' ? (
                      <p className="font-sans text-[11px] text-emerald-600 font-semibold mt-1">
                        Ticket closed — this issue has been resolved.
                      </p>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={replyDrafts[ticket.id] ?? ''}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') void handleCustomerReply(ticket); }}
                          placeholder="Reply to this ticket..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-sans bg-white focus:outline-none focus:border-primary/30"
                        />
                        <button
                          onClick={() => void handleCustomerReply(ticket)}
                          disabled={sendingReplyId === ticket.id || !(replyDrafts[ticket.id] ?? '').trim()}
                          className="px-4 py-2 rounded-xl bg-primary text-secondary-container text-xs font-sans font-bold hover:bg-primary-container transition-colors disabled:opacity-50"
                        >
                          {sendingReplyId === ticket.id ? 'Sending...' : 'Reply'}
                        </button>
                      </div>
                    )}
                    <span className="font-sans text-[10px] text-slate-400">{ticket.date ?? '-'}</span>
                  </div>
                ))}
                {grievances.length === 0 && (
                  <p className="text-sm font-serif text-slate-400">You have no past tickets.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
