'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ICONS } from '../../app/constants';
import { auth, getUserProfile } from '../../app/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

type View = 'home' | 'market' | 'hub' | 'product' | 'map' | 'about' | 'profile' | 'login' | 'signup' | 'subscription';

interface NavbarProps {
  currentView?: View;
  onNavigate?: (view: View) => void;
  productSearch?: string;
  setProductSearch?: (search: string) => void;
  isDashboard?: boolean;
}

export function Navbar({ 
  currentView, 
  onNavigate, 
  productSearch = '', 
  setProductSearch,
  isDashboard = false 
}: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('customer');
  const [userProfile, setUserProfile] = useState<any>({ name: '', isPaid: false });
  const [language, setLanguage] = useState('EN');
  const [locationQuery] = useState('Pune, Maharashtra');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileData = await getUserProfile(firebaseUser.uid);
        if (profileData) {
          setUserRole(profileData.role);
          setUserProfile({
            name: profileData.name || '',
            isPaid: profileData.isPaid || false
          });
        }
      } else {
        setUser(null);
        setUserRole('customer');
        setUserProfile({ name: '', isPaid: false });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onNavigate) {
        onNavigate('home');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigate = (view: View) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      router.push('/');
      // Note: This won't automatically set the view on the home page unless we use query params or state management
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'market', label: 'Market' },
    { id: 'hub', label: 'Hub' },
    { id: 'map', label: 'Stores' }
  ];

  return (
    <header className="sticky top-0 z-[60] h-16 bg-white/80 backdrop-blur-md border-b border-surface-container shadow-sm px-4 md:px-6 flex justify-between items-center transition-colors gap-4">
      <div 
        className="font-bold text-xl text-primary tracking-tight cursor-pointer hover:scale-105 transition-transform shrink-0"
        onClick={() => navigate('home')}
      >
        Krishidukan
      </div>
      
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id as View)}
            className={`text-xs font-semibold transition-colors hover:text-primary whitespace-nowrap ${
              currentView === item.id ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {item.label}
            {currentView === item.id && (
              <motion.div layoutId="activeTab" className="h-0.5 bg-primary mt-0.5 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Product Search Bar */}
        {!isDashboard && setProductSearch && (
          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex-1 max-w-sm">
            <ICONS.Search className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors shrink-0 ml-3" />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface px-2 py-2 placeholder-on-surface-variant font-medium"
            />
          </div>
        )}
      </div>
        
      <div className="flex items-center gap-2 shrink-0">
        {/* Current Location Display */}
        <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm px-2 py-1.5 gap-1.5">
          <ICONS.Location className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs text-on-surface font-semibold truncate max-w-[120px]">{locationQuery}</span>
        </div>

        <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl px-2 py-1">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-on-surface focus:ring-0 pr-5 cursor-pointer"
            aria-label="Select language"
          >
            <option value="EN">EN</option>
            <option value="HI">HI</option>
            <option value="MR">MR</option>
          </select>
        </div>

        <button
          className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-primary md:hidden"
          onClick={() => navigate('map')}
        >
          <ICONS.Location className="w-5 h-5" />
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            {(userRole === 'retailer' || userRole === 'manufacturer') && userProfile.isPaid && !isDashboard && (
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95"
              >
                Dashboard
              </button>
            )}
            <button 
              onClick={() => navigate('profile')}
              className="bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2 rounded-xl hover:bg-surface-container-highest transition-all"
            >
              {userProfile.name || 'Profile'}
            </button>
            <button 
              onClick={handleLogout}
              className="bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/20 transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('login')}
            className="bg-primary text-white text-xs font-bold px-5 py-2 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
