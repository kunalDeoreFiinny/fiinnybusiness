import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function CustomerFeedbackSubmitPage() {
  const [params] = useSearchParams();
  const tenantId = params.get('tid');

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
  const COLORS = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

  async function handleSubmit() {
    if (!tenantId) { setError('Invalid feedback link'); return; }
    if (rating === 0) { setError('Please select a rating'); return; }
    setError('');
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'tenants', tenantId, 'feedback'), {
        rating,
        comment: comment.trim() || null,
        customerName: name.trim() || null,
        phone: phone.trim() || null,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e: any) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Invalid feedback link</p>
          <p className="text-sm mt-1">Please ask the store for a valid link.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-500">Your feedback helps us improve. We appreciate your time!</p>
          <div className="mt-6 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-6 h-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Share Your Experience</h1>
          <p className="text-gray-500 text-sm mt-1">How was your visit? Your feedback matters!</p>
        </div>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  s <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <p className={`text-center text-sm font-semibold mb-6 ${COLORS[displayRating]}`}>
            {LABELS[displayRating]}
          </p>
        )}
        {displayRating === 0 && <div className="mb-6" />}

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Tell us more about your experience…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name (optional)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="mt-6 w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}
