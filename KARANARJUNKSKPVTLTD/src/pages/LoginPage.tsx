import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(t('auth.error_google'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Shorthand for default admin
        let finalEmail = email;
        if (email === 'arjutanpure' || email === 'arjuntanpure') {
            finalEmail = 'arjutanpure@karanarjun.com';
        }

        try {
            if (isLogin) {
                try {
                    await signInWithEmailAndPassword(auth, finalEmail, password);
                } catch (err: any) {
                    // Special case: If it's the default admin and doesn't exist, create it
                    const defaultAdminEmail = 'arjutanpure@karanarjun.com';
                    if (
                        finalEmail === defaultAdminEmail &&
                        password === '1829203' &&
                        (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')
                    ) {
                        await createUserWithEmailAndPassword(auth, finalEmail, password);
                    } else {
                        throw err;
                    }
                }
            } else {
                await createUserWithEmailAndPassword(auth, finalEmail, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError(t('auth.error_invalid'));
            } else if (err.code === 'auth/email-already-in-use') {
                setError(t('auth.error_exists'));
            } else if (err.code === 'auth/weak-password') {
                setError(t('auth.error_weak'));
            } else {
                setError(t('auth.error_generic'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('auth.title')}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('auth.subtitle')}</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', background: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="btn btn-secondary animate-pulse"
                    style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#333' }}
                    disabled={loading}
                >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    {t('auth.google_signin')}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
                    <span style={{ padding: '0 1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{t('auth.or')}</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">{t('auth.email_user_label')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                required
                                type="text"
                                id="email"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder={t('auth.email_user_placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '2rem' }}>
                        <label htmlFor="password">{t('auth.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                required
                                type="password"
                                id="password"
                                className="input-field"
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder={t('auth.password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary animate-pulse"
                        style={{ width: '100%', marginBottom: '1.5rem' }}
                        disabled={loading}
                    >
                        {loading ? t('auth.authenticating') : (isLogin ? t('auth.signin_button') : t('auth.signup_button'))}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? t('auth.no_account') + " " : t('auth.have_account') + " "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 600, cursor: 'pointer', padding: 0, font: 'inherit' }}
                        >
                            {isLogin ? t('auth.signup_link') : t('auth.login_link')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
