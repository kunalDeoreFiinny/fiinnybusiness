'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ICONS } from '../constants';
import { updateSubscriptionStatus } from '../firebase';

interface SubscriptionViewProps {
  user: any;
  onSuccess: () => void;
  onLogout: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionView({ user, onSuccess, onLogout }: SubscriptionViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on server
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 21 }),
      });

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
        handler: async function (response: any) {
          // 3. Verify payment on server
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.status === 'ok') {
            // 4. Update Firestore
            await updateSubscriptionStatus(user.uid, 'paid', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
            });
            onSuccess();
          } else {
            setError('Payment verification failed. Please contact support.');
          }
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
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-ambient w-full max-w-xl border border-surface-container text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ICONS.Trust className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-on-surface mb-2">Platform Access</h1>
        <p className="text-on-surface-variant mb-8 font-medium">
          To sell your products and list your store on KrishiDukan, a one-time membership fee is required.
        </p>

        <div className="bg-surface-container-low rounded-2xl p-6 mb-8 border border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Plan</span>
            <span className="text-primary font-black uppercase tracking-widest text-xs">Standard Membership</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Price</span>
            <div className="text-right">
              <span className="text-2xl font-black text-on-surface">₹21.00</span>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase">One-time payment</p>
            </div>
          </div>
          
          <div className="mt-6 text-left space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3">For Retailers</h3>
              <ul className="space-y-3">
                {[
                  'Farmers can locate your products with a single click',
                  'Break distributor monopoly — no longer dependent on a single source',
                  'Increased footfall: Drive more visitors to your physical shop',
                  'Boosted overall revenue through digital visibility'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-on-surface leading-snug">
                    <ICONS.Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-3">For Manufacturers</h3>
              <ul className="space-y-3">
                {[
                  'Exponential increase in product visibility',
                  'Direct connection with a wide network of local retailers',
                  'Significant reduction in traditional marketing budgets',
                  'Higher overall revenue through optimized distribution'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-on-surface leading-snug">
                    <ICONS.Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? 'Processing...' : 'Pay ₹21 & Get Access'}
          </button>
          
          <button
            onClick={onLogout}
            className="text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
          >
            Logout and go back
          </button>
        </div>

        <p className="mt-8 text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">
          Secure payment via Razorpay
        </p>
      </motion.div>
    </div>
  );
}
