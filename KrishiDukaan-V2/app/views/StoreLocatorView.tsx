'use client';

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
  const focusedStore = (stores.length > 0 ? (stores.find(s => s.id === selectedStoreId) || stores[0]) : null);
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

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Effect to pan map when store selection or user coords change
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
              value={location}
              onChange={handleLocationChange}
              placeholder="Enter your location..."
              className="bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface font-semibold placeholder:font-normal"
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

      {/* Map Content */}
      <div className="hidden md:block flex-1 relative bg-surface-container-high overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userCoords}
            zoom={13}
            onLoad={map => setMap(map)}
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
            {stores.map(store => {
              const lat = store.location?.lat || store.location?.latitude;
              const lng = store.location?.lng || store.location?.longitude;
              if (!lat || !lng) return null;
              
              return (
                <MarkerF
                  key={store.id}
                  position={{ lat: Number(lat), lng: Number(lng) }}
                  title={store.name}
                  onClick={() => {
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
          <div className="h-[calc(100vh-60px)]">
            <LeafletMap
              userLocation={userLocation}
              stores={displayedStores}
              selectedStoreId={selectedStoreId}
              onStoreSelect={handleStoreClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
