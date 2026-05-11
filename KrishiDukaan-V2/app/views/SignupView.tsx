import { useState } from 'react';
import { ICONS } from '../constants';
import { motion } from 'framer-motion';

interface SignupViewProps {
  onBack: () => void;
  onNavigateToLogin: () => void;
}

export default function SignupView({ onBack, onNavigateToLogin }: SignupViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'retailer' | 'manufacturer'>('retailer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for signup will go here
    console.log('Signup attempt:', { name, email, password, role });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-ambient w-full max-w-md border border-surface-container"
      >
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-primary font-bold hover:translate-x-1 transition-transform">
          <ICONS.ChevronRight className="w-4 h-4 rotate-180" /> Back to Store
        </button>

        <h1 className="text-3xl font-bold text-on-surface mb-2">Create Account</h1>
        <p className="text-on-surface-variant mb-8 font-medium">Join KrishiDukan to manage your agricultural business.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-surface-container-low p-1 rounded-2xl border border-outline-variant mb-6">
            <button 
              type="button"
              onClick={() => setRole('retailer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'retailer' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Retailer / Shop
            </button>
            <button 
              type="button"
              onClick={() => setRole('manufacturer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'manufacturer' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Distributor / Mfg
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

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
              placeholder="Min. 8 characters"
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            Already have an account? 
            <button onClick={onNavigateToLogin} className="text-primary font-bold ml-1 hover:underline">Sign In</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
