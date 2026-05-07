import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';

function LanguageSwitcher() {
  const { language, setLanguage, languageNames } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = Object.entries(languageNames) as [Language, string][];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-sans font-bold hover:bg-white/20 transition-colors"
        title="Change language"
      >
        <Icons.Globe className="w-3.5 h-3.5" />
        <span>{languageNames[language]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col py-1 z-50 min-w-[130px]">
          {options.map(([code, name]) => (
            <button
              key={code}
              onClick={() => { setLanguage(code); setOpen(false); }}
              className={`px-4 py-2.5 text-left font-sans text-sm transition-colors ${
                language === code
                  ? 'bg-primary/5 text-primary font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile, signOutUser, loading } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };
  const showCustomerWhatsApp = !loading && Boolean(user && profile?.role !== 'admin');

  const links = [
    { name: t.nav_product, href: '/' },
    { name: t.nav_benefits, href: '/benefits' },
    { name: t.nav_shop, href: '/shop' },
    { name: t.nav_blog, href: '/blog' },
    { name: t.nav_about, href: '/about' },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[97%] max-w-7xl z-50">
      <nav className="bg-primary/90 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_8px_40px_rgba(10,25,19,0.3)] transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-4 md:px-6 lg:px-8 w-full gap-3">
          <Link to="/" className="text-lg md:text-xl font-extrabold text-white tracking-tight font-sans shrink-0">
            Karan Arjun Power Plus™
          </Link>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex gap-3 items-center font-sans font-medium text-sm tracking-wide">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`transition-all duration-300 px-4 py-2 rounded-full ${
                location.pathname === link.href 
                  ? 'bg-white/20 backdrop-blur-md text-white font-bold shadow-sm border border-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
          <button onClick={() => setIsCartOpen(true)} className="text-white/70 hover:text-white transition-colors p-2 relative">
            <Icons.ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          {!loading && (
            <>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden lg:flex items-center px-3 py-2 rounded-full bg-white/10 text-white text-xs font-sans font-bold hover:bg-white/20 transition-colors"
                >
                  {t.nav_admin}
                </Link>
              )}
              {user ? (
                <>
                  <Link to={profile?.role === 'admin' ? '/admin' : '/profile'} className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 p-2 rounded-full hidden sm:block">
                    <Icons.User className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={() => void handleSignOut()}
                    className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 p-2 rounded-full hidden sm:block"
                    title={t.nav_logout}
                  >
                    <Icons.LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:flex items-center px-3 py-2 rounded-full bg-white/10 text-white text-xs font-sans font-bold hover:bg-white/20 transition-colors"
                >
                  {t.nav_login}
                </Link>
              )}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
            </>
          )}
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col p-2 gap-1 z-50">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`px-4 py-3 rounded-xl font-sans font-medium text-base ${
                location.pathname === link.href
                  ? 'bg-primary/5 text-primary font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!loading && (
            <>
              {user ? (
                <Link
                  to={profile?.role === 'admin' ? '/admin' : '/profile'}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-sans font-medium text-base flex items-center gap-2 ${
                    (location.pathname === '/profile' || location.pathname.startsWith('/admin'))
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icons.User className="w-5 h-5" /> {profile?.role === 'admin' ? t.nav_admin_dashboard : t.nav_profile}
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-sans font-medium text-base flex items-center gap-2 ${
                    location.pathname === '/auth'
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icons.Lock className="w-5 h-5" /> {t.nav_login}
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-sans font-medium text-base flex items-center gap-2 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-primary/5 text-primary font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icons.LayoutDashboard className="w-5 h-5" /> {t.nav_admin}
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    void handleSignOut();
                  }}
                  className="px-4 py-3 rounded-xl font-sans font-medium text-base flex items-center gap-2 text-slate-600 hover:bg-slate-50"
                >
                  <Icons.LogOut className="w-5 h-5" /> {t.nav_logout}
                </button>
              )}
            </>
          )}
          <div className="px-2 pt-1 pb-2">
            <LanguageSwitcher />
          </div>
        </div>
      )}
      </nav>
      {showCustomerWhatsApp && (
        <a
          href="https://wa.me/919307199040"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:scale-105 transition-transform"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <Icons.MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const links = [t.footer_privacy, t.footer_terms, t.footer_contact, t.footer_shipping];

  return (
    <footer className="bg-primary w-full mt-auto border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col items-center py-24 px-6 max-w-7xl mx-auto gap-12 text-center relative z-10">
        <div className="text-3xl md:text-5xl font-extrabold text-white font-sans tracking-tight">
          Karan Arjun <span className="text-secondary-container">Power Plus™</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-white/80 font-sans text-sm max-w-5xl w-full text-center md:text-left bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="bg-white/10 p-4 rounded-2xl text-secondary-container"><Icons.MapPin className="w-7 h-7" /></div>
            <h4 className="font-bold text-white text-xl">{t.footer_hq_title}</h4>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">{t.footer_hq_address}</p>
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="bg-white/10 p-4 rounded-2xl text-secondary-container"><Icons.MessageCircle className="w-7 h-7" /></div>
            <h4 className="font-bold text-white text-xl">{t.footer_sales_title}</h4>
            <p className="text-white/70 leading-relaxed">{t.footer_sales_desc}<br/><span className="font-bold text-secondary-container text-xl block mt-1">+91 9307199040</span></p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="bg-white/10 p-4 rounded-2xl text-secondary-container"><Icons.Instagram className="w-7 h-7" /></div>
            <h4 className="font-bold text-white text-xl">{t.footer_community_title}</h4>
            <p className="text-white/70 leading-relaxed">{t.footer_community_desc}<br/><a href="#" className="font-bold text-white hover:text-secondary-container transition-colors">@karanarjun_ksk_priyanka_mall</a><br/><span className="inline-block mt-2 px-3 py-1 bg-secondary-container/20 text-secondary-container text-[10px] font-bold tracking-widest uppercase rounded-full">75.8K+ Followers</span></p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-sans text-[10px] sm:text-xs uppercase tracking-widest font-bold mt-8">
          {links.map((link) => (
            <a key={link} href="#" className="text-white/70 hover:text-secondary-container transition-colors">
              {link}
            </a>
          ))}
        </div>
        <div className="text-white/50 text-[10px] sm:text-xs font-sans max-w-md">
          © {new Date().getFullYear()} Karan Arjun Power Plus™. {t.footer_copyright}
        </div>
      </div>
    </footer>
  );
}
