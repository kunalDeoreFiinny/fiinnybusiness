import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useModule } from '../hooks/useModule';

interface ModuleGateProps {
    moduleId: string;
    moduleName: string;
    children: React.ReactNode;
    /** 'replace' = show paywall card in place of feature (default)
     *  'overlay' = blur children with lock overlay
     *  'badge'   = render children with a small upgrade badge */
    paywallVariant?: 'replace' | 'overlay' | 'badge';
}

interface ModuleInfo {
    name: string;
    tagline: string;
    monthlyPrice: number;
    icon: string;
}

export default function ModuleGate({ moduleId, moduleName, children, paywallVariant = 'replace' }: ModuleGateProps) {
    const { enabled, loading } = useModule(moduleId);
    const navigate = useNavigate();
    const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null);

    useEffect(() => {
        if (enabled || loading) return;
        getDoc(doc(db, 'posModules', moduleId)).then(snap => {
            if (snap.exists()) setModuleInfo(snap.data() as ModuleInfo);
        }).catch(() => {});
    }, [moduleId, enabled, loading]);

    if (loading) return null;
    if (enabled) return <>{children}</>;

    const goToMarketplace = () => navigate(`/modules?highlight=${moduleId}`);

    if (paywallVariant === 'badge') {
        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                {children}
                <button
                    onClick={goToMarketplace}
                    title={`Unlock ${moduleName}`}
                    style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        background: 'var(--secondary-dark)', color: 'white',
                        border: 'none', borderRadius: '10px', padding: '2px 7px',
                        fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                        lineHeight: 1.4, zIndex: 10,
                    }}
                >
                    ⭐ Pro
                </button>
            </div>
        );
    }

    if (paywallVariant === 'overlay') {
        return (
            <div style={{ position: 'relative' }}>
                <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
                    {children}
                </div>
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    background: 'rgba(255,255,255,0.85)', borderRadius: '12px',
                }}>
                    <Lock size={28} color="var(--primary)" />
                    <p style={{ fontWeight: 700, margin: 0 }}>{moduleName}</p>
                    {moduleInfo && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                            ₹{moduleInfo.monthlyPrice}/mo
                        </p>
                    )}
                    <button onClick={goToMarketplace} className="btn"
                        style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1.25rem' }}>
                        Unlock Module
                    </button>
                </div>
            </div>
        );
    }

    // 'replace' variant — full paywall card
    return (
        <div style={{
            background: 'white', border: '2px dashed var(--surface-border)',
            borderRadius: '16px', padding: '2rem', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        }}>
            <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'hsla(152,60%,40%,0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <Lock size={24} color="var(--primary)" />
            </div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>{moduleInfo?.name || moduleName}</h4>
            {moduleInfo?.tagline && (
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                    {moduleInfo.tagline}
                </p>
            )}
            {moduleInfo && (
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{moduleInfo.monthlyPrice}/mo &nbsp;·&nbsp; ₹{Math.round(moduleInfo.monthlyPrice * 10 * 0.85)}/yr
                </p>
            )}
            <button onClick={goToMarketplace} className="btn"
                style={{ background: 'var(--primary)', color: 'white', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Zap size={16} /> Unlock This Feature
            </button>
        </div>
    );
}
