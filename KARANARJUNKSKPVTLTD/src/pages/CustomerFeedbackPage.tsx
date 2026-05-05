import { useState, useEffect } from 'react';
import { MessageSquare, Star, TrendingUp, Loader2, Copy, CheckCircle } from 'lucide-react';
import { query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';

interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  customerName?: string;
  phone?: string;
  orderId?: string;
  createdAt?: any;
}

const RATING_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
const RATING_COLORS = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
const RATING_BG = ['', 'bg-red-50', 'bg-orange-50', 'bg-yellow-50', 'bg-blue-50', 'bg-green-50'];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </span>
  );
}

export default function CustomerFeedbackPage() {
  const { tenantId } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [period, setPeriod] = useState<'all' | '7d' | '30d'>('30d');

  if (!tenantId) return null;

  const feedbackLink = `${window.location.origin}/feedback-submit?tid=${tenantId}`;

  function copyLink() {
    navigator.clipboard.writeText(feedbackLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  useEffect(() => {
    const col = getTenantCollection(db, tenantId!, 'feedback');
    let q = query(col, orderBy('createdAt', 'desc'), limit(200));

    if (period !== 'all') {
      const days = period === '7d' ? 7 : 30;
      const cutoff = Timestamp.fromDate(new Date(Date.now() - days * 86400_000));
      q = query(col, where('createdAt', '>=', cutoff), orderBy('createdAt', 'desc'), limit(200));
    }

    setLoading(true);
    const unsub = onSnapshot(q, snap => {
      setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback)));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [tenantId, period]);

  const visible = filterRating ? feedbacks.filter(f => f.rating === filterRating) : feedbacks;

  // Stats
  const total = feedbacks.length;
  const avg = total > 0 ? feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total : 0;
  const dist = [1, 2, 3, 4, 5].map(r => ({
    rating: r,
    count: feedbacks.filter(f => f.rating === r).length,
    pct: total > 0 ? (feedbacks.filter(f => f.rating === r).length / total) * 100 : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-500" /> Customer Feedback
            </h1>
            <p className="text-gray-500 text-sm mt-1">Collect and track customer satisfaction</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Feedback link card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800 mb-1">Share feedback link with customers</p>
            <p className="text-xs text-blue-600 font-mono truncate">{feedbackLink}</p>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shrink-0"
          >
            {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {linkCopied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Total Responses</p>
            <p className="text-2xl font-bold text-gray-800">{total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-800">{avg.toFixed(1)} ★</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">5-Star Reviews</p>
            <p className="text-2xl font-bold text-green-600">{feedbacks.filter(f => f.rating === 5).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Needs Attention (1-2★)</p>
            <p className="text-2xl font-bold text-red-500">{feedbacks.filter(f => f.rating <= 2).length}</p>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Rating Distribution
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(r => {
              const d = dist.find(x => x.rating === r)!;
              return (
                <button
                  key={r}
                  onClick={() => setFilterRating(filterRating === r ? null : r)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition ${filterRating === r ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <span className="flex gap-0.5 w-20 shrink-0">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{d.count}</span>
                </button>
              );
            })}
          </div>
          {filterRating && (
            <button onClick={() => setFilterRating(null)} className="mt-2 text-xs text-blue-600 hover:underline">
              Clear filter
            </button>
          )}
        </div>

        {/* Feedback list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">
            {filterRating ? `${RATING_LABELS[filterRating]} Reviews (${visible.length})` : `All Feedback (${visible.length})`}
          </h3>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No feedback yet</p>
              <p className="text-xs mt-1">Share the feedback link with your customers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map(fb => (
                <div key={fb.id} className={`p-4 rounded-xl border ${RATING_BG[fb.rating] || 'bg-gray-50'} border-gray-100`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay rating={fb.rating} />
                        <span className={`text-xs font-semibold ${RATING_COLORS[fb.rating] || 'text-gray-600'}`}>
                          {RATING_LABELS[fb.rating] || fb.rating}
                        </span>
                      </div>
                      {fb.comment && (
                        <p className="text-sm text-gray-700 mt-1">"{fb.comment}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-gray-700">{fb.customerName || 'Anonymous'}</p>
                      {fb.phone && <p className="text-xs text-gray-400">{fb.phone}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fb.createdAt?.toDate?.()?.toLocaleDateString() || ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
