import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
<<<<<<< Updated upstream
import { ArrowLeft, MapPin, List, Map, Heart } from 'lucide-react';
import { BRANDS, type StockResult } from '../demoData';
import { ArrowLeft, MapPin, Phone, Navigation, Star, List, Map, MessageCircle, ShoppingCart, Heart, Zap, Check } from 'lucide-react';
=======
import { MapPin, Phone, Navigation, Star, Heart, ShoppingCart, ChevronRight, CheckCircle2, Microscope, Droplets, Sprout, Plus, Minus, ArrowLeft } from 'lucide-react';
>>>>>>> Stashed changes
import { useTranslation } from 'react-i18next';
import { BRANDS, formatDistance } from '../demoData';
import type { StockResult } from '../demoData';
import { useLocation } from '../LocationContext';
<<<<<<< Updated upstream
import { RetailerMap } from '../components/RetailerMap';
import { RetailerCard } from '../components/RetailerCard';
=======
>>>>>>> Stashed changes
import { useRetailersForProduct } from '../hooks/useRetailersForProduct';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShopRowSkeleton } from '../components/SkeletonLoader';
<<<<<<< Updated upstream
import { relativeTime } from '../hooks/useFormatTime';
import { formatDistance } from '../utils/distance';
import { productIcon, ShopIcon } from '../components/icons';

type ViewMode = 'map' | 'list';
=======
import { motion, AnimatePresence } from 'motion/react';
>>>>>>> Stashed changes

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
    requireLogin(() => { addToCart(product.id, retailerId, quantity); navigate('/cart'); }, 'add-to-cart');
  }

  function handleWishlist() {
    if (!product) return;
    requireLogin(() => { toggleWishlist(product.id); }, 'wishlist');
  }

  if (loading && !data) return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8">
      <ShopRowSkeleton />
      <div className="h-4" />
      <ShopRowSkeleton />
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
      <p className="text-sm mb-4">{t('product.notFound')}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-container transition-colors">{t('product.backHome')}</button>
    </div>
  );

  const wishlisted = isWishlisted(product.id);
  const minPrice = inStock.length > 0 ? Math.min(...inStock.map(r => r.stock.price).filter(p => p > 0)) : 0;

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8 flex flex-col gap-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
        <button onClick={() => navigate(-1)} className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Market
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary">{product.shortName}</span>
      </nav>

      {/* Top grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left — Product visual */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-ambient border border-surface-container relative flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${product.imageColor}12, ${product.imageColor}28)` }}>
            <span style={{ fontSize: 120 }}>{product.emoji}</span>
            <div className="absolute top-6 left-6 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4" /> Verified Brand
            </div>
            <button onClick={handleWishlist} className={`absolute top-6 right-6 p-2 rounded-full bg-white shadow-md transition-colors ${wishlisted ? 'text-red-500' : 'text-on-surface-variant'}`}>
              <Heart className="w-5 h-5" fill={wishlisted ? '#ef4444' : 'none'} />
            </button>
          </div>
          {/* Benefits */}
          <div className="flex flex-wrap gap-2">
            {product.benefits.map((b) => (
              <span key={b} className="text-xs text-primary bg-primary/5 border border-primary/10 rounded-full px-3 py-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {b}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Store cards */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-on-surface uppercase tracking-widest text-xs">Available at {results.length} Stores</h3>
            {location.source !== 'gps' && (
              <button onClick={requestGps} disabled={requesting} className="text-xs text-primary font-semibold underline">
                {requesting ? 'Getting GPS...' : 'Use my GPS'}
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="p-6 rounded-2xl border-2 border-dashed border-surface-container text-center text-on-surface-variant text-sm">
              No stores found nearby. Try expanding your location.
            </div>
          ) : (
            results.map((result) => {
              const isExpanded = expandedRetailerId === result.retailer.id;
              return (
                <div key={result.retailer.id}
                  className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${isExpanded ? 'border-primary bg-white shadow-ambient' : 'border-surface-container bg-surface-container-low hover:border-outline-variant'}`}>
                  <button onClick={() => setExpandedRetailerId(isExpanded ? null : result.retailer.id)}
                    className="w-full flex items-center gap-4 p-4 text-left">
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
                      {result.stock.price > 0 && <span className="text-sm font-black text-secondary">₹{result.stock.price}</span>}
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${result.stock.inStock ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {result.stock.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-outline transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-surface-container">
                          <div className="pt-3 text-xs text-on-surface-variant">{result.retailer.addressLine}, {result.retailer.city} — {result.retailer.pincode}</div>
                          <div className="flex gap-2">
                            <a href={`tel:${result.retailer.phone}`}
                              className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5 no-underline">
                              <Phone className="w-3.5 h-3.5" /> Call
                            </a>
                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${result.retailer.lat},${result.retailer.lng}`, '_blank')}
                              className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all">
                              <Navigation className="w-3.5 h-3.5" /> Directions
                            </button>
                          </div>
                          {result.stock.inStock && (
                            <button onClick={() => handleAddToCart(result.retailer.id)}
                              className="w-full bg-secondary text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart — ₹{result.stock.price}
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

      {/* Product Details */}
      <div className="bg-white rounded-3xl border border-surface-container shadow-sm p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-secondary/20">
              {brand?.name ?? 'KaranArjun PowerPlus'}
            </span>
            <div className="flex items-center gap-1 text-secondary">
              <Star className="w-4 h-4 fill-secondary" />
              <span className="text-sm font-black">4.8 (124 Reviews)</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">{product.name}</h1>
          <p className="text-on-surface-variant leading-relaxed">{product.description}</p>
        </div>

        {/* Price + Quantity + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 border-t border-surface-container">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-extrabold text-secondary tracking-tight">
              {minPrice > 0 ? `₹${minPrice}` : 'Available in stores'}
            </span>
          </div>
          <div className="flex items-center gap-4 sm:ml-auto">
            <div className="flex items-center bg-surface-container-low border-2 border-surface-container rounded-2xl h-12 overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-surface-container transition-colors">
                <Minus className="w-4 h-4 text-on-surface" />
              </button>
              <span className="w-10 text-center font-black text-on-surface">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-surface-container transition-colors">
                <Plus className="w-4 h-4 text-on-surface" />
              </button>
            </div>
            {inStock.length > 0 ? (
              <button onClick={() => handleAddToCart(inStock[0].retailer.id)}
                className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            ) : (
              <button onClick={() => navigate('/retailers')}
                className="h-12 px-8 bg-surface-container text-on-surface font-black uppercase tracking-widest rounded-2xl hover:bg-surface-container-high transition-all flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Find Stores
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pack sizes */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-on-surface-variant font-semibold">Available in:</span>
        {product.packSizes.map((s) => (
          <span key={s} className="text-sm text-on-surface bg-surface-container border border-surface-container-highest rounded-lg px-3 py-1 font-semibold">{s}</span>
        ))}
      </div>

      {/* Product Insights */}
      <section>
        <h2 className="text-2xl font-bold text-on-surface mb-6">Product Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-secondary">
              <Microscope className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Category</h3>
            </div>
            <p className="text-on-surface font-bold">{product.categoryLabel}</p>
            <p className="text-on-surface-variant text-sm">{product.description}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Droplets className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Benefits</h3>
            </div>
            <div className="flex flex-col gap-2">
              {product.benefits.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {b}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-secondary">
              <Sprout className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Pack Sizes</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.packSizes.map((s) => (
                <span key={s} className="bg-surface-container px-4 py-2 rounded-full text-xs font-bold text-on-surface-variant border border-surface-container-highest">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
