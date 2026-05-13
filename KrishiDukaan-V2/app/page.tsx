/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client'

import { useEffect, useState, useMemo, useCallback } from 'react';
import { ICONS, PRODUCTS, STORES, INVENTORY } from './constants';
import HomeView from './views/HomeView';
import MarketView from './views/MarketView';
import HubView from './views/HubView';
import ProductDetailView from './views/ProductDetailView';
import StoreLocatorView from './views/StoreLocatorView';
import ProfileView from './views/ProfileView';
import AboutView from './views/AboutView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import SubscriptionView from './views/SubscriptionView';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, fetchMarketplaceProducts, fetchStores, syncInitialData, getUserProfile } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { MarketplaceProduct } from '../types/product';
import { useRouter } from 'next/navigation';
import { LatLng } from './utils/haversine';
import { getUserLocation, DEFAULT_LOCATION, DEFAULT_LOCATION_LABEL, GeoResult } from './utils/geolocation';
import { computeStoreDistances, selectNearbyStores, sortProductsByAvailability, StoreWithDistance } from './utils/nearby';

import { Navbar } from '../components/shared/navbar';

type View = 'home' | 'market' | 'hub' | 'product' | 'map' | 'about' | 'profile' | 'login' | 'signup' | 'subscription';
type UserRole = 'customer' | 'retailer' | 'manufacturer';
type UserProfile = {
  name: string;
  phone: string;
  email: string;
  isPaid?: boolean;
};

export default function App() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('Pune, Maharashtra');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [language, setLanguage] = useState('EN');
  
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', phone: '', email: '', isPaid: false });
  
  const [allProducts, setAllProducts] = useState<MarketplaceProduct[]>([]);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Geolocation state ---
  const [userLocation, setUserLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION_LABEL);
  const [locationSource, setLocationSource] = useState<'browser' | 'cached' | 'default'>('default');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      console.log('Fetching products and stores...');
      let products = await fetchMarketplaceProducts();
      let stores = await fetchStores();

      if (products.length === 0 || stores.length === 0) {
        console.log('Firebase data incomplete, attempting sync...', { 
          productsCount: products.length, 
          storesCount: stores.length 
        });
        await syncInitialData(PRODUCTS, STORES, INVENTORY);
        // Fetch again after sync
        products = await fetchMarketplaceProducts();
        stores = await fetchStores();
      }

      console.log('Data loaded successfully:', { 
        products: products.length, 
        stores: stores.length 
      });
      setAllProducts(products);
      setAllStores(stores);
      
      if (products.length === 0) {
        setErrorMsg('No products found in database even after sync. Please check your Firestore rules.');
      }
    } catch (error: any) {
      console.error('Failed to load data from Firebase:', error);
      setErrorMsg(`Firebase Connection Error: ${error.message || 'Unknown error'}. Check your browser console for details.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileData = await getUserProfile(firebaseUser.uid);
        if (profileData) {
          setUserRole(profileData.role as UserRole);
          const isPaid = profileData.isPaid || false;
          setUserProfile({
            name: profileData.name || '',
            email: profileData.email || firebaseUser.email || '',
            phone: profileData.phone || '',
            isPaid: isPaid
          });

          // Paywall logic: if retailer/manufacturer and NOT paid, force subscription view
          if ((profileData.role === 'retailer' || profileData.role === 'manufacturer') && !isPaid) {
            setCurrentView('subscription');
          }
        }
      } else {
        setUser(null);
        setUserRole('customer');
        setUserProfile({ name: '', phone: '', email: '', isPaid: false });
      }
    });

    void loadData();

    // Detect user location
    getUserLocation().then((result: GeoResult) => {
      setUserLocation(result.coords);
      setLocationLabel(result.label);
      setLocationSource(result.source);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (firebaseUser: any, profile: any) => {
    setUser(firebaseUser);
    setUserRole(profile.role);
    const isPaid = profile.isPaid || false;
    setUserProfile({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      isPaid: isPaid
    });

    if ((profile.role === 'retailer' || profile.role === 'manufacturer') && !isPaid) {
      setCurrentView('subscription');
    } else {
      setCurrentView('home');
    }
  };

  const handleSubscriptionSuccess = async () => {
    if (user) {
      const profileData = await getUserProfile(user.uid);
      if (profileData) {
        setUserProfile(prev => ({ ...prev, isPaid: true }));
        setCurrentView('profile');
      }
    }
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // --- Computed nearby stores with distances ---
  const storesWithDistance: StoreWithDistance[] = useMemo(() => {
    if (allStores.length === 0) return [];
    return computeStoreDistances(allStores, userLocation);
  }, [allStores, userLocation]);

  const nearbyStores: StoreWithDistance[] = useMemo(() => {
    return selectNearbyStores(storesWithDistance, userLocation);
  }, [storesWithDistance, userLocation]);

  const filteredProducts = useMemo(() => {
    const base = allProducts.filter(p => {
      const matchesSearch = !productSearch.trim() || 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    // Sort by in-stock first, then distance
    return sortProductsByAvailability(base, storesWithDistance);
  }, [allProducts, productSearch, selectedCategory, storesWithDistance]);

  const navigate = (view: View) => {
    if ((userRole === 'retailer' || userRole === 'manufacturer') && !userProfile.isPaid && 
        view !== 'home' && view !== 'about' && view !== 'subscription' && view !== 'login' && view !== 'signup') {
      setCurrentView('subscription');
      return;
    }
    setCurrentView(view);
  };

  const navigateToProduct = (id: string) => {
    setSelectedProductId(id);
    navigate('product');
  };

  const navigateToMap = (storeId?: string) => {
    setSelectedStoreId(storeId || null);
    navigate('map');
  };

  const renderView = () => {
    if (loading) return (
      <div className="p-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="font-bold text-primary">Connecting to Firebase...</p>
      </div>
    );

    if (errorMsg) return (
      <div className="p-20 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto">
          <h3 className="text-xl font-bold mb-2">Data Loading Issue</h3>
          <p className="mb-4">{errorMsg}</p>
          <button 
            onClick={loadData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );

    switch (currentView) {
      case 'home':
        return <HomeView products={filteredProducts} onProductClick={navigateToProduct} onHubClick={() => navigate('hub')} />;
      case 'market':
        return (
          <MarketView 
            products={filteredProducts} 
            onProductClick={navigateToProduct} 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        );
      case 'hub':
        return <HubView />;
      case 'product':
        return <ProductDetailView products={allProducts} productId={selectedProductId} onBack={() => navigate('market')} onStoreClick={navigateToMap} storesWithDistance={storesWithDistance} />;
      case 'map':
        return <StoreLocatorView onBack={() => navigate('home')} selectedStoreId={selectedStoreId} stores={nearbyStores} userLocation={userLocation} locationLabel={locationLabel} onLocationChange={(coords, label) => { setUserLocation(coords); setLocationLabel(label); }} />;
      case 'profile':
        return (
          <ProfileView
            role={userRole}
            profile={userProfile}
            onRoleChange={setUserRole}
            onProfileSave={handleProfileSave}
            onRetailerProductSaved={loadData}
          />
        );
      case 'login':
        return <LoginView onBack={() => navigate('home')} onNavigateToSignup={() => navigate('signup')} onSuccess={handleAuthSuccess} />;
      case 'signup':
        return <SignupView onBack={() => navigate('home')} onNavigateToLogin={() => navigate('login')} onSuccess={handleAuthSuccess} />;
      case 'subscription':
        return <SubscriptionView user={user} onSuccess={handleSubscriptionSuccess} onLogout={handleLogout} />;
      case 'about':
        return <AboutView />;
      default:
        return <HomeView products={filteredProducts} onProductClick={navigateToProduct} onHubClick={() => navigate('hub')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar 
        currentView={currentView} 
        onNavigate={navigate} 
        productSearch={productSearch} 
        setProductSearch={setProductSearch} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-surface-container flex items-center justify-around px-4 z-50">
        {[
          { id: 'home', icon: ICONS.Home, label: 'Home' },
          { id: 'market', icon: ICONS.Market, label: 'Market' },
          { id: 'hub', icon: ICONS.Hub, label: 'Hub' },
          { id: 'map', icon: ICONS.Location, label: 'Stores' },
          { id: 'about', icon: ICONS.Info, label: 'About' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentView === item.id ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {currentView === item.id && (
              <motion.div 
                layoutId="activeBubble" 
                className="absolute -z-10 w-12 h-12 bg-primary-container/20 rounded-full"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
