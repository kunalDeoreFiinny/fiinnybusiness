'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ICONS } from '../constants';
import { getUserProfile, updateSubscriptionStatus } from '../firebase';
import { useI18n } from '../i18n/I18nContext';

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

export default function SubscriptionView({ user, role, onSuccess, onLogout }: SubscriptionViewProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [seatCount, setSeatCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const premiumRole: PremiumRole = role === 'manufacturer' ? 'manufacturer' : 'retailer';
  
  const content = {
    badge: premiumRole === 'retailer' ? t('retailerPremiumBadge') : t('manufacturerPremiumBadge'),
    title: premiumRole === 'retailer' ? t('retailerPremiumTitle') : t('manufacturerPremiumTitle'),
    subtitle: premiumRole === 'retailer' ? t('retailerPremiumSubtitle') : t('manufacturerPremiumSubtitle'),
    benefits: premiumRole === 'retailer' ? [
      t('retailerBenefit1'),
      t('retailerBenefit2'),
      t('retailerBenefit3'),
      t('retailerBenefit4')
    ] : [
      t('manufacturerBenefit1'),
      t('manufacturerBenefit2'),
      t('manufacturerBenefit3'),
      t('manufacturerBenefit4')
    ]
  };
  
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
        body: JSON.stringify({ seatCount, userId: user.uid }),
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
        description: `Purchase ${seatCount} Product Listing Seat(s)`,
        order_id: order.id,
        handler: async function (paymentResponse: any) {
          setVerifying(true);
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

            // 4. Update Firestore with verified seatCount
            const updateResult = await updateSubscriptionStatus(user.uid, 'paid', {
              orderId: paymentResponse.razorpay_order_id,
              paymentId: paymentResponse.razorpay_payment_id,
            }, verifyData.seatCount || seatCount);

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
            setVerifying(false);
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
    <>
    {verifying && (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="font-bold text-primary text-base">{t('verifyingPayment')}</p>
        <p className="text-on-surface-variant text-sm mt-1 font-medium">{t('settingUpAccount')}</p>
      </div>
    )}
    <div className="min-h-[calc(100vh-64px)] flex items-start md:items-center justify-center px-2 md:px-4 py-2 md:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-3 md:p-6 rounded-3xl shadow-ambient w-full max-w-lg max-h-[calc(100vh-84px)] md:max-h-none overflow-y-auto border border-surface-container text-center relative"
      >
        <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 bg-white border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-lg shadow-primary/10">
          <ICONS.Star className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2 md:mb-3">
          <ICONS.Trust className={`w-4 h-4 ${accent}`} />
          <span className={`text-[11px] font-black uppercase tracking-widest ${accent}`}>{content.badge}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-on-surface mb-1 md:mb-1.5">{content.title}</h1>
        <p className="text-[11px] md:text-sm text-on-surface-variant mb-3 md:mb-5 font-medium max-w-xl mx-auto">
          {content.subtitle}
        </p>

        <div className="bg-surface-container-low rounded-2xl p-3 md:p-4 mb-3 md:mb-5 border border-outline-variant text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">{t('plan')}</span>
            <span className={`font-black uppercase tracking-widest text-xs ${accent}`}>{content.badge}</span>
          </div>

          <div className="flex flex-col gap-3 pb-3 border-b border-outline-variant">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">{t('numberOfSeats')}</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  -
                </button>
                <span className="text-base font-bold w-6 text-center">{seatCount}</span>
                <button 
                  onClick={() => setSeatCount(seatCount + 1)}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">{t('totalPrice')}</span>
              <div className="text-right">
                <span className="text-lg md:text-xl font-black text-on-surface">₹{seatCount * 21}.00</span>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase">₹21 {t('perProductSeat')}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-3 bg-primary text-white text-[11px] md:text-sm font-black uppercase tracking-widest py-2.5 md:py-3 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? t('processing') : t('payUnlock', { amount: seatCount * 21, seats: seatCount })}
          </button>

          <h3 className={`mt-3 md:mt-4 text-[11px] md:text-xs font-black uppercase tracking-widest mb-2 ${accent}`}>{t('includedBenefits')}</h3>
          <ul className="space-y-1.5 md:space-y-2.5">
            {content.benefits.map((feature, i) => (
              <li
                key={i}
                className={`items-start gap-2 text-xs md:text-sm font-medium text-on-surface leading-snug ${i > 0 ? 'hidden md:flex' : 'flex'}`}
              >
                <ICONS.Check className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 ${accent}`} />
                {feature}
              </li>
            ))}
            <li className="flex items-start gap-2.5 text-xs md:text-sm font-medium text-on-surface leading-snug">
              <ICONS.Check className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 ${accent}`} />
              {t('listUpTo', { seats: seatCount })}
            </li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-2xl border border-red-100 mb-4 text-xs md:text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onLogout}
            className="text-on-surface-variant font-bold text-xs md:text-sm hover:text-primary transition-colors"
          >
            {t('logoutGoBack')}
          </button>
        </div>

        <p className="mt-3 md:mt-5 text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">
          {t('securePayment')}
        </p>
      </motion.div>
    </div>
    </>
  );
}
