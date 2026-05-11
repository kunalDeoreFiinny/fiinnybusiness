import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star, Clock, MessageCircle, ShoppingCart, ChevronRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RETAILERS, getRetailerProducts, formatDistance, distanceM } from '../demoData';
import { useLocation } from '../LocationContext';
import { motion, AnimatePresence } from 'motion/react';

export function RetailerPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location } = useLocation();

  const retailer = RETAILERS.find((r) => r.id === id);
  const products = useMemo(() => (id ? getRetailerProducts(id) : []), [id]);

  if (!retailer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-error font-bold mb-4">{t('retailer.notFound')}</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const r = retailer;
  const d = distanceM(location.lat, location.lng, r.lat, r.lng);

  function openMaps() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`, '_blank');
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-screen bg-surface-container-lowest md:bg-transparent">
      {/* Sticky Sub-Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-container px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-surface-container rounded-full transition-colors md:bg-white md:shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-on-surface truncate tracking-tight">{retailer.businessName}</h1>
      </div>

      <section className="bg-white p-6 md:rounded-3xl md:mt-4 md:shadow-sm md:border border-surface-container">
        <div className="flex gap-6 items-start mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <ShoppingCart size={40} className="text-white opacity-90" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black text-on-surface mb-2 tracking-tight leading-tight">{retailer.businessName}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-secondary/5 px-2 py-1 rounded-lg">
                <Star size={14} fill="#f59e0b" className="text-harvest" />
                <span className="text-sm font-black text-on-surface">{retailer.rating.toFixed(1)}</span>
                <span className="text-xs font-bold text-outline">({retailer.totalRatings})</span>
              </div>
              <span className="text-outline-variant">·</span>
              <div className="flex items-center gap-1 text-primary font-black text-sm uppercase tracking-tight">
                <MapPin size={14} />
                <span>{formatDistance(d)} {t('retailer.away')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-2xl border border-transparent hover:border-outline-variant transition-colors">
            <MapPin size={18} className="text-secondary mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-on-surface">{retailer.addressLine}</div>
              <div className="text-xs font-semibold text-on-surface-variant mt-0.5">{retailer.city}, {retailer.state} — {retailer.pincode}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-transparent hover:border-outline-variant transition-colors">
            <Clock size={18} className="text-secondary shrink-0" />
            <div>
              <div className="text-sm font-bold text-on-surface uppercase tracking-wider text-[10px] text-outline mb-0.5">Opening Hours</div>
              <div className="text-sm font-bold text-on-surface-variant">{retailer.openHours}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href={`tel:${retailer.phone}`} 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 no-underline"
          >
            <Phone size={16} /> {t('actions.call')}
          </a>
          {retailer.whatsapp && (
            <a 
              href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-secondary/20 no-underline"
            >
              <MessageCircle size={16} /> {t('actions.whatsapp')}
            </a>
          )}
          <button 
            onClick={openMaps} 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-surface-container-high text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-surface-container-highest active:scale-95"
          >
            <Navigation size={16} /> {t('actions.directions')}
          </button>
        </div>
      </section>

      <section className="p-6 pb-20 md:pb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          <h2 className="text-sm font-black text-outline uppercase tracking-widest">{t('retailer.productsHere')}</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-surface-container">
            <ShoppingCart size={48} className="mx-auto text-outline-variant mb-4" />
            <p className="text-on-surface-variant font-bold">{t('retailer.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(({ product, stock }) => (
              <motion.button
                key={product.id}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className={`flex items-center gap-4 bg-white border border-surface-container rounded-3xl p-4 transition-all hover:shadow-ambient hover:border-primary text-left group ${!stock.inStock && 'opacity-60 grayscale'}`}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                  <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={product.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{product.shortName}</h3>
                  <div className="mt-1">
                    {stock.inStock ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>{t('product.inStockUnits', { count: stock.quantity })}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-error">{t('common.outOfStock')}</div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-secondary">₹{stock.price}</div>
                  {stock.mrp > stock.price && (
                    <div className="text-[10px] text-outline line-through font-bold tracking-tighter">₹{stock.mrp}</div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Trust Banner */}
      <section className="px-6 mb-10 md:mb-20">
        <div className="bg-primary-container/10 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
            <Zap className="text-primary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface mb-1">Authenticity Guaranteed</h3>
            <p className="text-on-surface-variant text-sm">Every shop on Krishidukan is a verified partner stocking 100% original products.</p>
          </div>
          <button className="md:ml-auto px-6 py-2.5 bg-white text-primary text-xs font-black uppercase tracking-widest rounded-full shadow-sm hover:bg-surface transition-colors">
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
}
