import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { useLocation } from '../LocationContext';
import { useNearbyShops } from '../hooks/useNearbyShops';
import { NearbyRowSkeleton } from '../components/SkeletonLoader';
import { formatDistance } from '../demoData';
import { motion } from 'motion/react';
import { useState } from 'react';
import { RetailerMap } from '../components/RetailerMap';
import type { Retailer } from '../demoData';
import type { StockResult } from '../demoData';

export function ShopsPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { data, loading } = useNearbyShops(location.lat, location.lng);
  const shops = data?.shops ?? [];
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [locationQuery, setLocationQuery] = useState(location.label);

  const results: StockResult[] = shops.map(({ retailer, distanceM: d }) => ({
    retailer,
    stock: { inStock: true, price: 0, mrp: 0, quantity: 0, retailerId: retailer.id, productId: '__any__' },
    distanceM: d,
  }));

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[400px] bg-white border-r border-surface-container flex flex-col z-20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-surface-container shrink-0">
          <h2 className="text-2xl font-bold text-on-surface mb-4">Nearby Stores</h2>
          <div className="flex items-center bg-surface-container-low rounded-2xl px-4 py-3 mb-4 border border-outline-variant group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <MapPin className="w-4 h-4 text-outline mr-3 group-focus-within:text-primary transition-colors shrink-0" />
            <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Enter your location..."
              className="bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface font-semibold placeholder:font-normal outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Open Now
            </button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full border border-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container-low transition-colors">Fertilizers</button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full border border-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container-low transition-colors">Seeds</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-surface-container-lowest">
          {data && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline px-2 opacity-60">
              {data.scope === 'radius' && data.radiusKm > 0 && `Shops within ${data.radiusKm}KM of ${location.label.split(',')[0]}`}
              {data.scope === 'district' && 'Shops in your district'}
              {data.scope === 'state' && 'Shops across the state'}
            </p>
          )}
          {loading && !data ? (
            <>
              <NearbyRowSkeleton />
              <NearbyRowSkeleton />
              <NearbyRowSkeleton />
            </>
          ) : shops.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant text-sm font-bold opacity-50">No stores found nearby.</div>
          ) : (
            shops.map(({ retailer, distanceM: d }, i) => (
              <motion.div key={retailer.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.02] ${
                  selectedRetailer?.id === retailer.id ? 'border-primary bg-primary/10 shadow-lg scale-[1.03]' : 'border-surface-container bg-white hover:border-outline-variant shadow-sm'
                }`}
                onClick={() => { setSelectedRetailer(selectedRetailer?.id === retailer.id ? null : retailer); navigate(`/retailer/${retailer.id}`); }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`text-xl font-bold ${selectedRetailer?.id === retailer.id ? 'text-primary' : 'text-on-surface'}`}>{retailer.businessName}</h3>
                    <p className="flex items-center gap-1 text-xs font-bold text-on-surface-variant mt-1">
                      <MapPin size={12} className="text-secondary" /> {formatDistance(d)}
                    </p>
                  </div>
                  {selectedRetailer?.id === retailer.id && (
                    <span className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-on-surface-variant">Open Now</span>
                  </div>
                </div>
                <div className={`flex gap-2 transition-all duration-300 ${selectedRetailer?.id === retailer.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${retailer.lat},${retailer.lng}`, '_blank'); }}
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Navigation size={14} /> Directions
                  </button>
                  <button 
                    onClick={() => navigate(`/retailer/${retailer.id}`)}
                    className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container transition-colors active:scale-95"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
          <div className="h-20" />
        </div>
      </div>

      {/* Map */}
      <div className="hidden md:flex flex-1 relative bg-surface-container-high overflow-hidden">
        <RetailerMap
          results={results}
          userLat={location.lat}
          userLng={location.lng}
          onSelect={setSelectedRetailer}
          selected={selectedRetailer}
        />
      </div>
    </div>
  );
}
