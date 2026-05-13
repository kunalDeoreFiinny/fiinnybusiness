'use client';

import { ICONS } from '../constants';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { LatLng } from '../utils/haversine';
import { StoreWithDistance, filterStoresByQuery } from '../utils/nearby';
import { cacheLocation } from '../utils/geolocation';

// Dynamically import LeafletMap — SSR disabled since Leaflet needs `window`
const LeafletMap = dynamic(() => import('../../components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Loading Map…</span>
      </div>
    </div>
  ),
});

interface StoreLocatorViewProps {
  onBack: () => void;
  selectedStoreId?: string | null;
  stores?: StoreWithDistance[];
  userLocation?: LatLng;
  locationLabel?: string;
  onLocationChange?: (coords: LatLng, label: string) => void;
}

export default function StoreLocatorView({
  onBack,
  selectedStoreId: initialSelectedStoreId,
  stores = [],
  userLocation = { lat: 18.5204, lng: 73.8567 },
  locationLabel = 'Pune, Maharashtra',
  onLocationChange,
}: StoreLocatorViewProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(initialSelectedStoreId || null);
  const [storeSearch, setStoreSearch] = useState('');
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Filter stores by search query (matches name, city, district, villages from address)
  const displayedStores = useMemo(() => {
    return filterStoresByQuery(stores, storeSearch);
  }, [stores, storeSearch]);

  const focusedStore = displayedStores.find(s => s.id === selectedStoreId) || displayedStores[0] || null;

  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId);
  };

  const handleGetDirections = (store: StoreWithDistance) => {
    if (store.location?.lat && store.location?.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${store.location.lat},${store.location.lng}`,
        '_blank'
      );
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const label = `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`;
        cacheLocation(coords, label);
        onLocationChange?.(coords, label);
      },
      () => {
        // silently ignore — keep current location
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (stores.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <ICONS.Location className="w-12 h-12 text-outline" />
          <p className="text-lg font-bold text-on-surface">No stores found nearby</p>
          <p className="text-sm text-on-surface-variant">Try changing your location or expanding your search area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[400px] bg-white border-r border-surface-container flex flex-col z-20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-surface-container shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-surface-container-low rounded-full md:hidden">
              <ICONS.ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-on-surface">Nearby Stores</h2>
            {/* Mobile map toggle */}
            <button
              onClick={() => setShowMobileMap(!showMobileMap)}
              className="md:hidden ml-auto p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <ICONS.Location className="w-5 h-5" />
            </button>
          </div>

          {/* Location label */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleLocateMe}
              className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
            >
              <ICONS.MyPosition className="w-3.5 h-3.5" />
              {locationLabel}
            </button>
          </div>

          {/* Store search — matches name/city/district/villages */}
          <div className="flex items-center bg-surface-container-low rounded-2xl px-4 py-3 mb-4 border border-outline-variant group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <ICONS.Search className="w-4 h-4 text-outline mr-3 group-focus-within:text-primary transition-colors shrink-0" />
            <input
              type="text"
              value={storeSearch}
              onChange={e => setStoreSearch(e.target.value)}
              placeholder="Search shops, city, district..."
              className="bg-transparent border-none w-full focus:ring-0 focus:outline-none text-sm text-on-surface font-semibold placeholder:font-normal"
            />
            {storeSearch && (
              <button onClick={() => setStoreSearch('')} className="text-outline hover:text-on-surface transition-colors ml-2">
                <ICONS.Minus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
              <ICONS.Check className="w-4 h-4" /> Open Now
            </button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full border border-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container-low">
              Urea In-Stock
            </button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full border border-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container-low">
              NPK Fertilizer
            </button>
          </div>

          {/* Stores count */}
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {displayedStores.length} store{displayedStores.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-surface-container-lowest">
          {displayedStores.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => handleStoreClick(store.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.02] ${
                store.id === selectedStoreId
                  ? 'border-primary bg-primary/10 shadow-lg scale-[1.03]'
                  : store.isHot
                  ? 'border-primary/40 bg-primary/5 shadow-sm'
                  : 'border-surface-container bg-white hover:border-outline-variant shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`text-xl font-bold ${store.id === selectedStoreId || store.isHot ? 'text-primary' : 'text-on-surface'}`}>
                    {store.name}
                  </h3>
                  <p className="flex items-center gap-1 text-xs font-bold text-on-surface-variant mt-1">
                    <ICONS.Location className="w-3 h-3" /> {store.distanceLabel}
                  </p>
                </div>
                {(store.id === selectedStoreId || store.isHot) && (
                  <span className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {store.id === selectedStoreId ? 'Selected' : 'Closest'}
                  </span>
                )}
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${store.status?.includes('Open') ? 'bg-green-500' : 'bg-error'}`} />
                  <span className="text-xs font-bold text-on-surface-variant">{store.status}</span>
                </div>
                {store.address && (
                  <p className="text-[11px] text-on-surface-variant font-medium truncate">{store.address}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {store.stock?.map(item => (
                    <span key={item} className="px-2 py-0.5 rounded-lg bg-surface-container-high text-on-surface-variant text-[9px] font-black uppercase tracking-widest border border-surface-container-highest">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`flex gap-2 transition-all duration-300 ${store.id === selectedStoreId ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleGetDirections(store); }}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <ICONS.Directions className="w-4 h-4" /> Get Directions
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStoreClick(store.id); }}
                  className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-bold hover:bg-white transition-colors"
                >
                  Details
                </button>
              </div>
            </motion.div>
          ))}

          {displayedStores.length === 0 && storeSearch && (
            <div className="p-8 text-center">
              <ICONS.Search className="w-8 h-8 text-outline mx-auto mb-3" />
              <p className="text-sm font-bold text-on-surface-variant">No stores match "{storeSearch}"</p>
              <p className="text-xs text-outline mt-1">Try a different search term</p>
            </div>
          )}

          <div className="h-20" />
        </div>
      </div>

      {/* Mobile Map (togglable) */}
      {showMobileMap && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-surface-container bg-white">
            <h3 className="font-bold text-on-surface">Map View</h3>
            <button
              onClick={() => setShowMobileMap(false)}
              className="p-2 bg-surface-container rounded-full"
            >
              <ICONS.Minus className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[calc(100vh-60px)]">
            <LeafletMap
              userLocation={userLocation}
              stores={displayedStores}
              selectedStoreId={selectedStoreId}
              onStoreSelect={handleStoreClick}
            />
          </div>
        </div>
      )}

      {/* Desktop Map — Leaflet + OpenStreetMap */}
      <div className="hidden md:block flex-1 relative bg-surface-container-high overflow-hidden">
        <LeafletMap
          userLocation={userLocation}
          stores={displayedStores}
          selectedStoreId={selectedStoreId}
          onStoreSelect={handleStoreClick}
        />

        {/* Locate Me button overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
          <button
            onClick={handleLocateMe}
            className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary hover:scale-110 active:scale-90 transition-all border border-surface-container group"
            title="Detect my location"
          >
            <ICONS.MyPosition className="w-6 h-6 group-hover:animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
}
