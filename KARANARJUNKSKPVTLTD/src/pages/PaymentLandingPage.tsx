import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, CheckCircle2, Loader2, AlertCircle, IndianRupee } from 'lucide-react';

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentLandingPage() {
  const { token } = useParams<{ token: string }>();
  const [linkData, setLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    loadRazorpayScript();
    // Query across all tenants for this token
    const q = query(collection(db, 'paymentLinks_public'), where('token', '==', token));
    // Fallback: scan through sub-collections isn't easy without knowing tenant.
    // We store a 'paymentLinks_public' top-level collection mirrored when creating.
    getDocs(q).then(snap => {
      if (!snap.empty) {
        setLinkData({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setError('Payment link not found or has expired.');
      }
      setLoading(false);
    }).catch(() => {
      setError('Could not load payment details.');
      setLoading(false);
    });
  }, [token]);

  const handlePay = async () => {
    if (!linkData) return;
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { setError('Could not load payment gateway. Check internet connection.'); setPaying(false); return; }

      // Create order via your SaaS backend
      // Since this is client-side, we use the existing createSaaSOrder pattern
      // but for payment links we use a simpler direct Razorpay approach with a public key
      // The key_id is embedded in the link data (set when creating)
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: linkData.keyId || 'rzp_live_placeholder', // Set when creating the link
          amount: linkData.amount * 100,
          currency: 'INR',
          name: 'KaranArjun Pay',
          description: linkData.description,
          prefill: {
            name: linkData.customerName,
          },
          theme: { color: '#10b981' },
          modal: { ondismiss: () => reject(new Error('cancelled')) },
          handler: async (response: any) => {
            try {
              // Mark as paid in Firestore
              await updateDoc(doc(db, 'paymentLinks_public', linkData.id), {
                status: 'paid',
                paidAt: serverTimestamp(),
                razorpayPaymentId: response.razorpay_payment_id,
              });
              resolve();
            } catch (e) { reject(e); }
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      setPaid(true);
    } catch (e: any) {
      if (!e.message?.includes('cancelled')) {
        setError('Payment failed: ' + (e.message || 'Unknown error'));
      }
    } finally {
      setPaying(false);
    }
  };

  const gradientBg = { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Inter', sans-serif" };

  if (loading) return (
    <div style={gradientBg}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ opacity: 0.7 }}>Loading payment details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={gradientBg}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', textAlign: 'center', color: '#fff' }}>
        <AlertCircle size={52} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Link Unavailable</h2>
        <p style={{ opacity: 0.6 }}>{error}</p>
      </div>
    </div>
  );

  if (paid) return (
    <div style={gradientBg}>
      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', textAlign: 'center', color: '#fff' }}>
        <CheckCircle2 size={64} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Payment Successful! 🎉</h2>
        <p style={{ opacity: 0.7 }}>₹{linkData.amount.toLocaleString('en-IN')} received for {linkData.description}</p>
        <p style={{ opacity: 0.5, marginTop: '1rem', fontSize: '0.85rem' }}>A receipt will be sent to you. You can close this window.</p>
      </div>
    </div>
  );

  if (linkData?.status === 'paid') return (
    <div style={gradientBg}>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', textAlign: 'center', color: '#fff' }}>
        <CheckCircle2 size={52} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
        <h2>Already Paid</h2>
        <p style={{ opacity: 0.6 }}>This payment link has already been settled. Thank you!</p>
      </div>
    </div>
  );

  return (
    <div style={gradientBg}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem' }}>
            💳 KaranArjun Pay
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>Secure payment powered by Razorpay</div>
        </div>

        {/* Payment Card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Amount to Pay</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <IndianRupee size={32} />
              {linkData.amount.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Paying to</span>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>KaranArjun</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>From</span>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{linkData.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Invoice</span>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{linkData.invoiceNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Description</span>
              <span style={{ color: '#fff', fontSize: '0.85rem', maxWidth: '200px', textAlign: 'right' }}>{linkData.description}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={paying}
            style={{
              width: '100%', padding: '1rem', background: paying ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '14px',
              cursor: paying ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '1.1rem', font: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
            }}
          >
            {paying ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <>Pay ₹{linkData.amount.toLocaleString('en-IN')} →</>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
            <Shield size={12} /> 256-bit SSL encrypted · PCI-DSS compliant
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
          Powered by Razorpay · KARAN ARJUN KSK PVT LTD
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
