'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ICONS } from '../constants';
import { getUserProfile, updateSubscriptionStatus } from '../firebase';

interface SubscriptionViewProps {
  user: any;
  role: 'customer' | 'retailer' | 'manufacturer';
  onSuccess: () => void;
  onLogout: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PremiumRole = 'retailer' | 'manufacturer';

const PREMIUM_CONTENT: Record<
  PremiumRole,
  {
    badge: string;
    title: string;
    subtitle: string;
    benefits: string[];
  }
> = {
  retailer: {
    badge: 'Retailer Premium',
    title: 'Retailer Listing Access',
    subtitle: 'Get discovered by nearby farmers and grow your in-store sales with verified listing access.',
    benefits: [
      'Farmers can locate your products with a single click',
      'Break distributor monopoly — no longer dependent on a single source',
      'Drive higher footfall to your physical store',
      'Increase overall revenue through digital visibility'
    ]
  },
  manufacturer: {
    badge: 'Manufacturer Premium',
    title: 'Manufacturer Network Access',
    subtitle: 'Launch your products across local retailer networks with stronger distribution visibility.',
    benefits: [
      'Exponential increase in product visibility',
      'Direct connection with a wide network of local retailers',
      'Reduce traditional marketing spend',
      'Increase revenue through stronger distribution reach'
    ]
  }
};

export default function SubscriptionView({ user, role, onSuccess, onLogout }: SubscriptionViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const premiumRole: PremiumRole = role === 'manufacturer' ? 'manufacturer' : 'retailer';
  const content = PREMIUM_CONTENT[premiumRole];
  const accent = premiumRole === 'manufacturer' ? 'text-secondary' : 'text-primary';

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Payment gateway is not ready. Please refresh and try again.');
      }

      // 1. Create order on server
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 21 }),
      });

      if (!response.ok) {
        throw new Error('Unable to start payment right now. Please try again.');
      }

      const order = await response.json();

      if (order.error) throw new Error(order.error);

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'KrishiDukan',
        description: 'Membership Subscription',
        order_id: order.id,
        handler: async function (paymentResponse: any) {
          try {
            // 3. Verify payment on server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.status !== 'ok') {
              throw new Error('Payment verification failed. Please contact support.');
            }

            // 4. Update Firestore
            const updateResult = await updateSubscriptionStatus(user.uid, 'paid', {
              orderId: paymentResponse.razorpay_order_id,
              paymentId: paymentResponse.razorpay_payment_id,
            });

            if (!updateResult.paymentLogged && updateResult.paymentLogError) {
              console.warn('Continuing after non-blocking payment log error:', updateResult.paymentLogError);
            }

            await onSuccess();
          } catch (err: any) {
            const latestProfile = await getUserProfile(user.uid);
            if (latestProfile?.isPaid) {
              await onSuccess();
              return;
            }
            setError(err.message || 'Payment completed but profile update failed. Please refresh.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#154212',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setLoading(false);
        setError('Payment was not completed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-start md:items-center justify-center px-3 md:px-4 py-4 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 md:p-8 rounded-3xl shadow-ambient w-full max-w-xl border border-surface-container text-center relative overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-24 md:h-36 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div className="relative z-10 w-14 h-14 md:w-20 md:h-20 bg-white border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-primary/10">
          <ICONS.Star className="w-7 h-7 md:w-10 md:h-10 text-primary" />
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-3 md:px-4 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3 md:mb-4">
          <ICONS.Trust className={`w-4 h-4 ${accent}`} />
          <span className={`text-[11px] font-black uppercase tracking-widest ${accent}`}>{content.badge}</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1.5 md:mb-2">{content.title}</h1>
        <p className="text-xs md:text-base text-on-surface-variant mb-4 md:mb-8 font-medium max-w-xl mx-auto">
          {content.subtitle}
        </p>

        <div className="bg-surface-container-low rounded-2xl p-4 md:p-6 mb-4 md:mb-8 border border-outline-variant text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Plan</span>
            <span className={`font-black uppercase tracking-widest text-xs ${accent}`}>{content.badge}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Price</span>
            <div className="text-right">
              <span className="text-xl md:text-2xl font-black text-on-surface">₹21.00</span>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase">One-time listing fee</p>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-4 bg-primary text-white text-xs md:text-sm font-black uppercase tracking-widest py-3 md:py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? 'Processing...' : `Pay ₹21 & Unlock ${premiumRole === 'retailer' ? 'Retailer' : 'Manufacturer'} Access`}
          </button>

          <h3 className={`mt-4 md:mt-6 text-[11px] md:text-xs font-black uppercase tracking-widest mb-2 md:mb-3 ${accent}`}>Included benefits</h3>
          <ul className="space-y-2 md:space-y-3">
            {content.benefits.map((feature, i) => (
              <li
                key={i}
                className={`items-start gap-2.5 text-xs md:text-sm font-medium text-on-surface leading-snug ${i > 1 ? 'hidden md:flex' : 'flex'}`}
              >
                <ICONS.Check className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 ${accent}`} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onLogout}
            className="text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
          >
            Logout and go back
          </button>
        </div>

        <p className="mt-4 md:mt-8 text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">
          Secure payment via Razorpay
        </p>
      </motion.div>
    </div>
  );
}
