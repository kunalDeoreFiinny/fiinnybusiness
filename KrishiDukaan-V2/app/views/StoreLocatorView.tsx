import { ICONS } from '../constants';
import { motion } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface StoreLocatorViewProps {
  onBack: () => void;
  selectedStoreId?: string | null;
  stores?: any[];
  location?: string;
  onLocationChange?: (location: string, coordinates?: { lat: number, lng: number }) => void;
  userCoords?: { lat: number, lng: number };
}

export default function StoreLocatorView({
  onBack,
  selectedStoreId,
  stores = [],
  location = 'Pune, Maharashtra',
  onLocationChange,
  userCoords = { lat: 18.5204, lng: 73.8567 }
}: StoreLocatorViewProps) {
  const [storeSearch, setStoreSearch] = useState('');
  const [detailStore, setDetailStore] = useState<any | null>(null);

  const filteredStores = storeSearch.trim()
    ? stores.filter(store => {
        const searchable = [
          store.name || '',
          store.shopName || '',
          store.ownerName || '',
          store.address || '',
          ...(Array.isArray(store.stock) ? store.stock : [])
        ].join(' ').toLowerCase();
        return searchable.includes(storeSearch.toLowerCase());
      })
    : stores;

  const [activeStoreId, setActiveStoreId] = useState<string | null>(selectedStoreId || (stores[0]?.id ?? null));
  const focusedStore = filteredStores.length > 0 ? (filteredStores.find((s) => s.id === activeStoreId) || filteredStores[0]) : null;
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  // Calculate center: use focusedStore if available, else userCoords
  const getCenter = () => {
    if (focusedStore) {
      const lat = focusedStore.location?.lat || focusedStore.location?.latitude;
      const lng = focusedStore.location?.lng || focusedStore.location?.longitude;
      if (lat && lng) return { lat: Number(lat), lng: Number(lng) };
    }
    return userCoords;
  };

  const center = getCenter();

  useEffect(() => {
    if (selectedStoreId) {
      setActiveStoreId(selectedStoreId);
      return;
    }

    if (!stores.some((store) => store.id === activeStoreId)) {
      setActiveStoreId(stores[0]?.id ?? null);
    }
  }, [selectedStoreId, stores, activeStoreId]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Effect to pan map when store selection or user coords change
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  if (!focusedStore && stores.length === 0) {
    return <div className="p-20 text-center">No stores found.</div>;
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onLocationChange) onLocationChange(e.target.value);
  };

  const handleLocationSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && location) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;
          if (onLocationChange) onLocationChange(formattedAddress, { lat, lng });
        }
      } catch (error) {
        console.error('Manual geocoding error:', error);
      }
    }
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  return (
    <>
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[400px] bg-white border-r border-surface-container flex flex-col z-20 shadow-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-surface-container shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-surface-container-low rounded-full md:hidden">
              <ICONS.ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-on-surface">Nearby Stores</h2>
          </div>

          {/* Location search */}
          <div className="flex items-center bg-surface-container-low rounded-2xl px-4 py-3 mb-3 border border-outline-variant group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <ICONS.Location className="w-4 h-4 text-outline mr-3 group-focus-within:text-primary transition-colors shrink-0" />
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              onKeyDown={handleLocationSubmit}
              placeholder="Enter your location..."
              className="bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface font-semibold placeholder:font-normal"
            />
          </div>

          {/* Store name / product search */}
          <div className="flex items-center bg-surface-container-low rounded-2xl px-4 py-3 mb-4 border border-outline-variant group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <ICONS.Search className="w-4 h-4 text-outline mr-3 group-focus-within:text-primary transition-colors shrink-0" />
            <input
              type="text"
              value={storeSearch}
              onChange={e => setStoreSearch(e.target.value)}
              placeholder="Search stores or products..."
              className="bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface font-semibold placeholder:font-normal"
            />
            {storeSearch && (
              <button onClick={() => setStoreSearch('')} className="text-outline hover:text-on-surface transition-colors ml-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
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

          <div className="md:hidden h-52 rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-low">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                onLoad={(instance) => setMap(instance)}
                onUnmount={onUnmount}
                options={mapOptions}
              >
                <MarkerF
                  position={userCoords}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: '#3B82F6',
                    fillOpacity: 1,
                    strokeWeight: 4,
                    strokeColor: '#FFFFFF',
                    scale: 7
                  }}
                />
                {filteredStores.map((store) => {
                  const lat = store.location?.lat || store.location?.latitude;
                  const lng = store.location?.lng || store.location?.longitude;
                  if (!lat || !lng) return null;

                  return (
                    <MarkerF
                      key={store.id}
                      position={{ lat: Number(lat), lng: Number(lng) }}
                      title={store.name}
                      onClick={() => setActiveStoreId(store.id)}
                    />
                  );
                })}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 bg-surface-container-lowest">
          {filteredStores.length === 0 && storeSearch.trim() ? (
            <div className="py-12 text-center text-on-surface-variant">
              <ICONS.Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">No stores found</p>
              <p className="text-xs mt-1">Try a different name or product</p>
            </div>
          ) : filteredStores.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveStoreId(store.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.02] ${
                store.id === activeStoreId ? 'border-primary bg-primary/10 shadow-lg scale-[1.03]' : (store.isHot ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-surface-container bg-white hover:border-outline-variant shadow-sm')
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`text-xl font-bold ${store.id === activeStoreId || store.isHot ? 'text-primary' : 'text-on-surface'}`}>{store.name}</h3>
                  <p className="flex items-center gap-1 text-xs font-bold text-on-surface-variant mt-1">
                    <ICONS.Location className="w-3 h-3" /> {store.distance}
                  </p>
                </div>
                {(store.id === activeStoreId || store.isHot) && (
                  <span className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {store.id === activeStoreId ? 'Selected' : 'Closest'}
                  </span>
                )}
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(store.status || '').includes('Open') ? 'bg-green-500' : 'bg-error'}`} />
                  <span className="text-xs font-bold text-on-surface-variant">{store.status || 'Active'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(store.stock || []).map((item: string) => (
                    <span key={item} className="px-2 py-0.5 rounded-lg bg-surface-container-high text-on-surface-variant text-[9px] font-black uppercase tracking-widest border border-surface-container-highest">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`flex gap-2 transition-all duration-300 ${store.id === selectedStoreId ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <button className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <ICONS.Directions className="w-4 h-4" /> Get Directions
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDetailStore(store); }}
                  className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-bold hover:bg-white transition-colors"
                >
                  Details
                </button>
              </div>
            </motion.div>
          ))}
          <div className="h-20" />
        </div>
      </div>

      {/* Map Content */}
      <div className="hidden md:block flex-1 relative bg-surface-container-high overflow-hidden">
        {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                onLoad={(instance) => setMap(instance)}
                onUnmount={onUnmount}
                options={mapOptions}
              >
            {/* User Location Marker */}
            <MarkerF
              position={userCoords}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeWeight: 4,
                strokeColor: '#FFFFFF',
                scale: 8
              }}
            />

            {/* Store Markers */}
            {filteredStores.map(store => {
              const lat = store.location?.lat || store.location?.latitude;
              const lng = store.location?.lng || store.location?.longitude;
              if (!lat || !lng) return null;

              return (
                <MarkerF
                  key={store.id}
                  position={{ lat: Number(lat), lng: Number(lng) }}
                  title={store.name}
                  onClick={() => {
                    setActiveStoreId(store.id);
                    if (map) {
                      map.panTo({ lat: Number(lat), lng: Number(lng) });
                      map.setZoom(15);
                    }
                  }}
                />
              );
            })}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        
        {/* Map UI */}
        <div className="absolute top-10 right-10 flex flex-col gap-4 z-10">
          <button 
            onClick={() => map?.panTo(userCoords)}
            className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary hover:scale-110 active:scale-90 transition-all border border-surface-container group"
          >
            <ICONS.MyPosition className="w-6 h-6 group-hover:animate-pulse" />
          </button>
          <div className="flex flex-col bg-white rounded-3xl shadow-xl border border-surface-container overflow-hidden">
            <button 
              onClick={() => map?.setZoom((map.getZoom() || 13) + 1)}
              className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors border-b border-surface-container"
            >
              <ICONS.Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={() => map?.setZoom((map.getZoom() || 13) - 1)}
              className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <ICONS.Minus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Store Details Modal */}
    {detailStore && (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => setDetailStore(null)}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{detailStore.name || detailStore.shopName}</h2>
                {detailStore.ownerName && (
                  <p className="text-sm text-on-surface-variant mt-1">Owner: {detailStore.ownerName}</p>
                )}
              </div>
              <button
                onClick={() => setDetailStore(null)}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors ml-2 shrink-0"
              >
                <svg className="w-5 h-5 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              {detailStore.address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ICONS.Location className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Address</p>
                    <p className="text-sm text-on-surface font-semibold">{detailStore.address}</p>
                    {(detailStore.city || detailStore.state) && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {[detailStore.city, detailStore.state, detailStore.pincode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {detailStore.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.04 6.04l1.86-1.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Phone</p>
                    <a href={`tel:${detailStore.phone}`} className="text-sm font-semibold text-green-600 hover:underline">{detailStore.phone}</a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${(detailStore.status || '').includes('Open') ? 'bg-green-500' : 'bg-amber-500'}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Status</p>
                  <p className="text-sm font-semibold text-on-surface">{detailStore.status || 'Active'}</p>
                </div>
              </div>

              {(detailStore.stock || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Products in Stock</p>
                  <div className="flex flex-wrap gap-2">
                    {(detailStore.stock || []).map((item: string) => (
                      <span key={item} className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {detailStore.location?.lat && detailStore.location?.lng && (detailStore.location.lat !== 0 || detailStore.location.lng !== 0) && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${detailStore.location.lat},${detailStore.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <ICONS.Directions className="w-4 h-4" /> Get Directions
                </a>
              )}
              {detailStore.phone && (
                <a
                  href={`tel:${detailStore.phone}`}
                  className="flex-1 border border-outline-variant text-on-surface py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                >
                  Call Store
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
