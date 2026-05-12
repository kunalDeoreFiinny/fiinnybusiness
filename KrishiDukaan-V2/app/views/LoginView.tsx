import { useState } from 'react';
import { ICONS } from '../constants';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, getUserProfile } from '../firebase';

interface LoginViewProps {
  onBack: () => void;
  onNavigateToSignup: () => void;
  onSuccess: (user: any, profile: any) => void;
}

export default function LoginView({ onBack, onNavigateToSignup, onSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const profile = await getUserProfile(user.uid);
      if (profile) {
        onSuccess(user, profile);
      } else {
        // Fallback if profile doesn't exist for some reason
        onSuccess(user, { name: user.displayName || 'User', email: user.email, role: 'customer' });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-ambient w-full max-w-md border border-surface-container"
      >
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-primary font-bold hover:translate-x-1 transition-transform">
          <ICONS.ChevronRight className="w-4 h-4 rotate-180" /> Back to Store
        </button>

        <h1 className="text-3xl font-bold text-on-surface mb-2">Welcome Back</h1>
        <p className="text-on-surface-variant mb-8 font-medium">Log in to manage your shop or track your activity.</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
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
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
            <input 
              type="password" 
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            Don&apos;t have an account? 
            <button onClick={onNavigateToSignup} className="text-primary font-bold ml-1 hover:underline">Create Account</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
