import React, { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const { user, profile, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from ?? '/profile';
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    if (profile?.role === 'admin') {
      return '/admin';
    }
    return fromPath;
  }, [profile, fromPath]);

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, name.trim());
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your email first, then click Forgot Password.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setInfo('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send password reset email.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-end p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida/ADBb0uiMg-b-JQP8eneEtUBoN3nthy1tdhBSG6_gAOctHTN3w73JYJrce4dcRnzHjlE8MJWXueBD5BFZALu1jxxRhIcfqdsJtctncGh-V-W8VtRZLPLUYkNgXK111GJ9RDa_MiKEpE4s3Jm7NBMflQUjX2UycDh9XjfpJJt1SkFrZ52t95rfWV3vqHG_vIEWadkgoQHiPk8v4sf5p9GAAV0XqfmR4FDO9ckc6UUKKcwdPb0PUBjG4ISlLkmwxMI5tUUVx-mTYWFm_15TH-o"
            alt="Agri"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container to-transparent" />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="font-sans text-4xl font-extrabold mb-6 leading-tight">
            Trust with tradition, one step toward modernity.
          </h2>
          <p className="font-serif text-white/80 leading-relaxed text-lg">
            Sign in to manage orders, tickets, and your Power Plus account from anywhere.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="font-sans text-3xl font-extrabold text-primary mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="font-serif text-on-surface-variant">
              {mode === 'signin' ? 'Sign in to access your dashboard' : 'Join the official Power Plus portal'}
            </p>
          </div>

          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-3 px-4 rounded-xl font-sans font-bold transition-all ${
                mode === 'signin' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 px-4 rounded-xl font-sans font-bold transition-all ${
                mode === 'signup' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && <p className="mb-4 text-sm font-sans font-semibold text-red-600">{error}</p>}
          {info && <p className="mb-4 text-sm font-sans font-semibold text-emerald-700">{info}</p>}

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-8 font-sans font-bold text-primary disabled:opacity-60"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2G12m3xsHHzz0Zs52jjHypEvXWHOgM1mdK3BDoO_xRmGaDgLoHRYsC_0oXdbaWKD4bv8C3k6dgMl9jME2LIPeu8Inrk_-oC5UQGdGCS5stwFL33m5DO_TEEEvRgqtaa38BEqN-E1F18lp2q4A0MDwQFtv_-Q3jlQZdes4eLG7JQnxZNacr1_lLGn9cNqJDsLy_2CBeZ4Ovx9yjwuryIKnj30lNniBxoH0wURjzpnyzFkXDgCw4uE00aVYSA6lHMI4h6p1701TvRBl"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-100" />
            <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-sans font-bold uppercase tracking-widest">
              or continue with email
            </span>
            <div className="flex-grow border-t border-slate-100" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="block font-sans font-bold text-primary text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rajesh Patil"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-serif"
                />
              </div>
            )}
            <div>
              <label className="block font-sans font-bold text-primary text-sm mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-serif"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-sans font-bold text-primary text-sm">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-sans font-bold text-secondary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-serif"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-white font-sans font-bold rounded-xl hover:shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'} <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-xs font-sans font-bold text-primary/60 hover:text-primary transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
