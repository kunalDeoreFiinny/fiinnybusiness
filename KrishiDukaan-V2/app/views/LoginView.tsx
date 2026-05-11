import { useState } from 'react';
import { ICONS } from '../constants';
import { motion } from 'framer-motion';

interface LoginViewProps {
  onBack: () => void;
  onNavigateToSignup: () => void;
}

export default function LoginView({ onBack, onNavigateToSignup }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for login will go here
    console.log('Login attempt:', { email, password });
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            Don't have an account? 
            <button onClick={onNavigateToSignup} className="text-primary font-bold ml-1 hover:underline">Create Account</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
