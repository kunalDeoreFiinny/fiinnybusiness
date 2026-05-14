// Standalone retailer card for the MVP search flow. Shows shop, product, stock, distance,
// and the three core farmer actions: Call / WhatsApp / Directions.
import { Phone, MessageCircle, Navigation, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Retailer, RetailerStock, Product } from '../demoData';
import { ShopIcon, productIcon } from './icons';
import { formatKm } from '../utils/distance';

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

type Tone = { color: string; bg: string; border: string };
function stockTone(qty: number, inStock: boolean): Tone {
  if (!inStock || qty <= 0) return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  if (qty <= 10)            return { color: '#b45309', bg: '#fffbeb', border: '#fde68a' };
  return                          { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' };
}

export function RetailerCard({ data, rank, onClick }: Props) {
  const { t } = useTranslation();
  const { retailer, product, stock, distanceKm } = data;
  const ProductIcon = productIcon(product.id);
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
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #eef0f3', borderRadius: 16,
        padding: 14, cursor: onClick ? 'pointer' : 'default', position: 'relative',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {rank === 1 && (
        <span style={{
          position: 'absolute', top: -8, left: 14,
          background: '#16a34a', color: '#fff',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
          textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999,
          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
        }}>
          ★ {t('common.nearest')}
        </span>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShopIcon size={22} color="#16a34a" strokeWidth={1.9} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {retailer.businessName}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <Star size={11} fill="#f59e0b" stroke="none" />
            <span style={{ fontWeight: 700, color: '#374151' }}>{retailer.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{retailer.city}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>{formatKm(distanceKm)}</div>
          {stock.inStock && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>₹{stock.price}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f9fafb', borderRadius: 12, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${product.imageColor}15, ${product.imageColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ProductIcon size={18} color={product.imageColor} strokeWidth={1.9} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.shortName}
          </div>
          <span style={{
            display: 'inline-block', marginTop: 3,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.02em',
            color: tone.color, background: tone.bg,
            border: `1px solid ${tone.border}`,
            borderRadius: 999, padding: '2px 8px',
          }}>
            {badgeLabel}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={`tel:${retailer.phone}`}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}
        >
          <Phone size={13} strokeWidth={2.2} /> {t('actions.call')}
        </a>
        {retailer.whatsapp && (
          <a
            href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 10px', background: '#f0fff4', border: '1px solid #86efac', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}
          >
            <MessageCircle size={13} strokeWidth={2.2} /> {t('actions.whatsapp')}
          </a>
        )}
        <button
          onClick={openMaps}
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}
        >
          <Navigation size={13} strokeWidth={2.2} /> {t('actions.directions')}
        </button>
      </div>
    </div>
  );
}
