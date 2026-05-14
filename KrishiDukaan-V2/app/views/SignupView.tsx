import { useState } from 'react';
import { ICONS } from '../constants';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, saveUserProfile } from '../firebase';
import { useI18n } from '../i18n/I18nContext';

interface SignupViewProps {
  onBack: () => void;
  onNavigateToLogin: () => void;
  onSuccess: (user: any, profile: any) => void;
}

export default function SignupView({ onBack, onNavigateToLogin, onSuccess }: SignupViewProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'retailer' | 'manufacturer'>('retailer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const profile = { name, email, role };
      await saveUserProfile(user.uid, profile);
      
      onSuccess(user, profile);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-ambient w-full max-w-md border border-surface-container"
      >
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-primary font-bold hover:translate-x-1 transition-transform">
          <ICONS.ChevronRight className="w-4 h-4 rotate-180" /> {t('backToStore')}
        </button>

        <h1 className="text-3xl font-bold text-on-surface mb-2">{t('createAccountTitle')}</h1>
        <p className="text-on-surface-variant mb-8 font-medium">{t('signupSubtitle')}</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant mb-6">
            <button 
              type="button"
              disabled={loading}
              onClick={() => setRole('retailer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'retailer' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {t('retailerShop')}
            </button>
            <button 
              type="button"
              disabled={loading}
              onClick={() => setRole('manufacturer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'manufacturer' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {t('distributorMfg')}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('fullName')}</label>
            <input 
              type="text" 
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('emailAddress')}</label>
            <input 
              type="email" 
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">{t('password')}</label>
            <input 
              type="password" 
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            {t('alreadyHaveAccount')} 
            <button onClick={onNavigateToLogin} className="text-primary font-bold ml-1 hover:underline">{t('signIn')}</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
