import { Phone, MessageCircle, Navigation, Star, ShoppingCart, MapPin, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Retailer, RetailerStock, Product } from '../demoData';
import { formatKm } from '../utils/distance';
import { motion } from 'motion/react';

export interface RetailerCardData {
  retailer: Retailer;
  product: Product;
  stock: RetailerStock;
  distanceKm: number;
}

interface Props {
  data: RetailerCardData;
  rank?: number;          // 1-indexed badge for "nearest" highlight
  onClick?: () => void;
}

type Tone = { text: string; bg: string; border: string; bullet: string };
function stockTone(qty: number, inStock: boolean): Tone {
  if (!inStock || qty <= 0) return { text: 'text-error', bg: 'bg-error/5', border: 'border-error/20', bullet: 'bg-error' };
  if (qty <= 10)            return { text: 'text-harvest', bg: 'bg-harvest/5', border: 'border-harvest/20', bullet: 'bg-harvest' };
  return                          { text: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20', bullet: 'bg-primary' };
}

export function RetailerCard({ data, rank, onClick }: Props) {
  const { t } = useTranslation();
  const { retailer, product, stock, distanceKm } = data;
  const tone = stockTone(stock.quantity, stock.inStock);
  const badgeLabel =
    !stock.inStock || stock.quantity <= 0
      ? t('common.outOfStock')
      : stock.quantity <= 10
        ? `${t('common.lowStock')} · ${stock.quantity}`
        : `${t('common.inStock')} · ${stock.quantity}`;

  function openMaps(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${retailer.lat},${retailer.lng}`, '_blank');
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`relative bg-white border border-surface-container rounded-3xl p-5 transition-all hover:shadow-ambient group cursor-pointer ${rank === 1 ? 'border-primary ring-1 ring-primary/10' : ''}`}
    >
      {rank === 1 && (
        <span className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-primary/20 flex items-center gap-1">
          <Star size={10} fill="currentColor" /> {t('common.nearest')}
        </span>
      )}

      <div className="flex gap-4 items-start mb-5">
        <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
          <ShoppingCart size={24} className="text-primary opacity-60" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors leading-tight">
            {retailer.businessName}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={12} fill="#f57c00" className="text-harvest" />
              <span className="text-xs font-black text-on-surface">{retailer.rating.toFixed(1)}</span>
            </div>
            <span className="text-outline-variant">·</span>
            <div className="flex items-center gap-1 text-xs font-bold text-on-surface-variant">
              <MapPin size={12} />
              <span>{retailer.city}</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-black text-primary uppercase tracking-tighter">{formatKm(distanceKm)}</div>
        </div>
      </div>

      <div className={`flex items-center gap-3 p-3 rounded-2xl border mb-5 transition-colors ${tone.bg} ${tone.border}`}>
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-on-surface truncate">{product.shortName}</div>
          <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-black uppercase tracking-widest ${tone.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone.bullet}`} />
            <span>{badgeLabel}</span>
          </div>
        </div>
        {stock.inStock && (
          <div className="text-right">
            <div className="text-lg font-black text-secondary">₹{stock.price}</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <a
          href={`tel:${retailer.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary/5 text-primary rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-primary/10 no-underline"
        >
          <Phone size={14} strokeWidth={2.5} /> {t('actions.call')}
        </a>
        {retailer.whatsapp && (
          <a
            href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary/5 text-secondary rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-secondary/10 no-underline"
          >
            <MessageCircle size={14} strokeWidth={2.5} /> WA
          </a>
        )}
        <button
          onClick={openMaps}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-surface-container-high text-on-surface rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-surface-container-highest"
        >
          <Navigation size={14} strokeWidth={2.5} /> {t('actions.directions')}
        </button>
      </div>
    </motion.div>
  );
}
