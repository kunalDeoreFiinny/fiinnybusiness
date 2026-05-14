'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ICONS } from '../../app/constants';
import { auth, getUserProfile } from '../../app/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { reverseGeocodeToDisplay } from '../../app/utils/geolocation';

type View = 'home' | 'market' | 'hub' | 'product' | 'map' | 'about' | 'profile' | 'login' | 'signup' | 'subscription';

interface NavbarProps {
  currentView?: View;
  onNavigate?: (view: View) => void;
  productSearch?: string;
  setProductSearch?: (search: string) => void;
  isDashboard?: boolean;
  locationQuery?: string;
  onLocationChange?: (location: string, coordinates?: { lat: number, lng: number }) => void;
}

export function Navbar({ 
  currentView, 
  onNavigate, 
  productSearch = '', 
  setProductSearch,
  isDashboard = false,
  locationQuery = 'Pune, Maharashtra',
  onLocationChange
}: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('customer');
  const [userProfile, setUserProfile] = useState<any>({ isPaid: false });
  const [language, setLanguage] = useState('EN');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      if (onLocationChange) onLocationChange('Geolocation not supported');
      return;
    }

    setIsFetchingLocation(true);
    if (onLocationChange) onLocationChange('Locating...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };

        try {
          const label = await reverseGeocodeToDisplay(
            latitude,
            longitude,
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          );
          if (onLocationChange) onLocationChange(label, coords);
        } catch {
          const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          if (onLocationChange) onLocationChange(label, coords);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        if (onLocationChange) onLocationChange('Location access denied');
        setIsFetchingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (isDashboard) return;
    const shouldAutoLocate =
      locationQuery === 'Pune, Maharashtra' ||
      locationQuery === 'Address not found' ||
      locationQuery === 'Error fetching address';

    if (shouldAutoLocate) {
      void fetchLocation();
    }
  }, [locationQuery, isDashboard]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileData = await getUserProfile(firebaseUser.uid);
        if (profileData) {
          setUserRole(profileData.role);
          setUserProfile({
            isPaid: profileData.isPaid || false
          });
        }
      } else {
        setUser(null);
        setUserRole('customer');
        setUserProfile({ isPaid: false });
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
  const canAccessDashboard = (userRole === 'retailer' || userRole === 'manufacturer') && userProfile.isPaid && !isDashboard;

  return (
    <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-surface-container shadow-sm px-4 md:px-6 py-2 transition-colors">
      <div className="flex justify-between items-center gap-4">
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
          {/* Desktop Product Search Bar */}
          {!isDashboard && setProductSearch && (
            <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex-1 max-w-sm">
              <ICONS.Search className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors shrink-0 ml-3" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface px-2 py-2 placeholder-on-surface-variant font-medium"
              />
            </div>
          )}
        </div>
          
        <div className="flex items-center gap-2 shrink-0">
          {/* Current Location Display */}
          <div 
            onClick={fetchLocation}
            className={`hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-surface-container transition-colors group ${isFetchingLocation ? 'opacity-70' : ''}`}
            title="Click to refresh location"
          >
            <ICONS.Location className={`w-3.5 h-3.5 text-primary shrink-0 ${isFetchingLocation ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="text-xs text-on-surface font-semibold truncate max-w-[120px] md:max-w-[220px]" title={locationQuery}>
              {locationQuery}
            </span>
          </div>

          <button
            className={`p-1.5 hover:bg-surface-container rounded-full transition-colors text-primary md:hidden ${isFetchingLocation ? 'animate-pulse' : ''}`}
            onClick={fetchLocation}
            title="Detect current location"
          >
            <ICONS.Location className="w-5 h-5" />
          </button>

          <div className="relative group">
            <button
              className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-surface-container-highest transition-all"
              aria-label="Open account menu"
            >
              Account
              <ICONS.ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </button>

            <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-surface-container rounded-2xl shadow-ambient p-2 hidden group-hover:block group-focus-within:block">
              <div className="px-2 py-1.5 border-b border-surface-container mb-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full bg-surface-container-low border border-outline-variant rounded-lg px-2 py-1.5 text-xs font-semibold text-on-surface focus:ring-0"
                  aria-label="Select language"
                >
                  <option value="EN">EN</option>
                  <option value="HI">HI</option>
                  <option value="MR">MR</option>
                </select>
              </div>

              {user ? (
                <>
                  {canAccessDashboard && (
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full text-left px-2.5 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => navigate('profile')}
                    className="w-full text-left px-2.5 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2.5 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('login')}
                  className="w-full text-left px-2.5 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isDashboard && setProductSearch && (
        <div className="md:hidden mt-2">
          <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <ICONS.Search className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors shrink-0 ml-3" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-xs text-on-surface px-2 py-2.5 placeholder-on-surface-variant font-medium"
            />
          </div>
        </div>
      )}
    </header>
  );
}
