import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Star, 
  Heart, 
  ShoppingCart, 
  ChevronRight, 
  CheckCircle2, 
  Microscope, 
  Droplets, 
  Sprout, 
  Plus, 
  Minus, 
  ArrowLeft 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRANDS, formatDistance } from '../demoData';
import { useLocation } from '../LocationContext';
import { useRetailersForProduct } from '../hooks/useRetailersForProduct';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShopRowSkeleton } from '../components/SkeletonLoader';
import { motion, AnimatePresence } from 'motion/react';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location, requestGps, requesting } = useLocation();
  const [expandedRetailerId, setExpandedRetailerId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { requireLogin } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { data, loading } = useRetailersForProduct(id, location.lat, location.lng);
  const { t } = useTranslation();
  
  const product = data?.product ?? null;
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;
  const results = data?.results ?? [];
  const inStock = results.filter((r) => r.stock.inStock);

  function handleAddToCart(retailerId: string) {
    if (!product) return;
    requireLogin(() => { 
      addToCart(product.id, retailerId, quantity); 
      navigate('/cart'); 
    }, 'add-to-cart');
  }

  function handleWishlist() {
    if (!product) return;
    requireLogin(() => { 
      toggleWishlist(product.id); 
    }, 'wishlist');
  }

  if (loading && !data) return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8">
      <div className="flex flex-col gap-6">
        <div className="h-64 bg-surface-container animate-pulse rounded-3xl" />
        <ShopRowSkeleton />
        <div className="h-4" />
        <ShopRowSkeleton />
      </div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
      <p className="text-sm mb-4">{t('product.notFound')}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-container transition-colors">
        {t('product.backHome')}
      </button>
    </div>
  );

  const wishlisted = isWishlisted(product.id);
  const minPrice = inStock.length > 0 ? Math.min(...inStock.map(r => r.stock.price).filter(p => p > 0)) : 0;

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8 flex flex-col gap-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1.5">
          <ArrowLeft size={10} /> Market
        </button>
        <ChevronRight size={8} className="text-outline-variant" />
        <span className="text-primary">{product.shortName}</span>
      </nav>

      {/* Top grid: visual left, stores right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left — Product visual */}
        <div className="flex flex-col gap-4">
          <motion.div
            layoutId={`prod-img-${product.id}`}
            className="aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-ambient border border-surface-container relative"
          >
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            <div className="absolute top-6 left-6 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4" />
              Verified Brand
            </div>
            <button 
              onClick={handleWishlist}
              className={`absolute top-6 right-6 p-2.5 rounded-full bg-white shadow-sm transition-all active:scale-90 ${wishlisted ? 'text-red-500' : 'text-on-surface-variant'}`}
            >
              <Heart className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </motion.div>
          
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl border-2 border-primary overflow-hidden cursor-pointer shadow-sm">
              <img src={product.image} className="w-full h-full object-cover" alt="thumb1" />
            </div>
            <div className="w-24 h-24 rounded-2xl border border-surface-container-highest overflow-hidden opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRy2KbS0xyVt7brjix_bSB7rxB4v7-foDeu7vBzhgbFNrZJwXRzXVQJIffFqGQN-xSvlGNa8GnrS4ej7VfxD6s7IdXzJbsi48RIR99heAy7LwMPJlXATrIo7Z_Hbh7nepdxevHns9C2UFx7XZ-MwcG8DQUEChNv7RfIr-Au9NoHXB1CkTBegc6gwZ6BjBVWrib4jdYGmBV6X1SNuftWfSkukjiJ1FjMfEfMp3RbOFzfiZ8wGfLGcxHfzWzeROMHKAh68-N5Oqavxuo" className="w-full h-full object-cover" alt="thumb2" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {product.benefits.map((b) => (
              <span key={b} className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> {b}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Store cards */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-on-surface uppercase tracking-widest text-[10px]">Available at {results.length} Stores</h3>
            {location.source !== 'gps' && (
              <button 
                onClick={requestGps} 
                disabled={requesting}
                className="text-[10px] text-primary font-bold uppercase tracking-widest underline decoration-2 underline-offset-4"
              >
                {requesting ? 'Getting GPS...' : 'Use my GPS'}
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="p-8 rounded-3xl border-2 border-dashed border-surface-container text-center text-on-surface-variant text-sm bg-surface-container-low">
              No stores found nearby with this product.
            </div>
          ) : (
            results.map((result) => {
              const isExpanded = expandedRetailerId === result.retailer.id;
              return (
                <div 
                  key={result.retailer.id}
                  className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                    isExpanded ? 'border-primary bg-white shadow-ambient' : 'border-surface-container bg-surface-container-low hover:border-outline-variant'
                  }`}
                >
                  <button 
                    onClick={() => setExpandedRetailerId(isExpanded ? null : result.retailer.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className={`p-2.5 rounded-xl transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-white shadow-sm text-on-surface-variant'}`}>
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-on-surface truncate">{result.retailer.businessName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{formatDistance(result.distanceM)}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${result.stock.inStock ? 'bg-green-500' : 'bg-red-400'}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {result.stock.price > 0 && <span className="text-sm font-bold text-secondary">₹{result.stock.price}</span>}
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        result.stock.inStock ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {result.stock.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-outline transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-surface-container">
                          <div className="pt-3 text-[11px] font-medium text-on-surface-variant leading-relaxed">
                            {result.retailer.addressLine}, {result.retailer.city} — {result.retailer.pincode}
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`tel:${result.retailer.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5 no-underline"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${result.retailer.lat},${result.retailer.lng}`, '_blank');
                              }}
                              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <Navigation className="w-3.5 h-3.5" /> Directions
                            </button>
                          </div>
                          {result.stock.inStock && (
                            <button 
                              onClick={() => handleAddToCart(result.retailer.id)}
                              className="w-full bg-secondary text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" /> Add to Cart — ₹{result.stock.price}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-3xl border border-surface-container shadow-sm p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-secondary/20">
              {brand?.name ?? 'Premium Agri Brand'}
            </span>
            <div className="flex items-center gap-1 text-secondary">
              <Star className="w-4 h-4 fill-secondary" />
              <span className="text-sm font-bold">4.8 (124 Reviews)</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">{product.name}</h1>
          <p className="text-on-surface-variant leading-relaxed max-w-3xl">{product.description}</p>
        </div>

        {/* Price + Quantity Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 border-t border-surface-container">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-secondary tracking-tight">
              {minPrice > 0 ? `₹${minPrice}` : 'Check Store Price'}
            </span>
            {minPrice > 0 && (
              <span className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Starting From</span>
            )}
          </div>

          <div className="flex items-center gap-4 sm:ml-auto">
            <div className="flex items-center bg-surface-container-low border-2 border-surface-container rounded-2xl h-12 overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <Minus className="w-4 h-4 text-on-surface" />
              </button>
              <span className="w-10 text-center font-bold text-on-surface">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <Plus className="w-4 h-4 text-on-surface" />
              </button>
            </div>
            {(() => {
              const firstInStock = inStock[0];
              return firstInStock ? (
                <button 
                  onClick={() => handleAddToCart(firstInStock.retailer.id)}
                  className="h-12 px-8 bg-primary text-white font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/retailers')}
                  className="h-12 px-8 bg-surface-container text-on-surface font-bold uppercase tracking-widest rounded-2xl hover:bg-surface-container-high transition-all flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" /> Find Stores
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Technical Insights */}
      <section>
        <h2 className="text-2xl font-bold text-on-surface mb-6">Technical Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-secondary">
              <Microscope className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Classification</h3>
            </div>
            <div>
              <p className="text-on-surface font-bold mb-1">{product.categoryLabel}</p>
              <p className="text-on-surface-variant text-xs leading-relaxed">{product.description.slice(0, 100)}...</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Droplets className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Key Benefits</h3>
            </div>
            <div className="flex flex-col gap-2">
              {product.benefits.slice(0, 3).map((b) => (
                <div key={b} className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {b}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-secondary">
              <Sprout className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-[10px]">Packaging</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.packSizes.map((s) => (
                <span key={s} className="bg-surface-container px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-surface-container-highest">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
