import { useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Star, Clock3, Truck, ShieldCheck, Tag,
  ArrowRight, ChevronRight, Navigation,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, RETAILER_STOCK, formatDistance } from '../demoData';
import { useLocation } from '../LocationContext';
import { useNearbyShops } from '../hooks/useNearbyShops';
import { NearbyRowSkeleton } from '../components/SkeletonLoader';
import { relativeTime } from '../hooks/useFormatTime';
import { productIcon, categoryIcon, ShopIcon } from '../components/icons';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location, requestGps } = useLocation();
  const { data, loading } = useNearbyShops(location.lat, location.lng);
  const nearby = (data?.shops ?? []).slice(0, 4);

  return (
    <div>
      {/* Hero — modern delivery-promise card */}
      <section
        style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          padding: '28px 16px 36px',
          color: '#fff',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 14 }}>
          <Clock3 size={12} strokeWidth={2.4} /> {t('home.hero.tag')}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
          {t('common.appName')}
        </h1>
        <p style={{ fontSize: 14, opacity: 0.92, marginBottom: 18, lineHeight: 1.55, maxWidth: 480 }}>
          {t('home.hero.tagline')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
          {[
            { icon: Truck, label: t('home.hero.trustSameDay') },
            { icon: ShieldCheck, label: t('home.hero.trustGenuine') },
            { icon: Tag, label: t('home.hero.trustPrices') },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <Icon size={18} color="#fff" strokeWidth={2.1} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.95, lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>

        {location.source === 'default' && (
          <button
            onClick={requestGps}
            style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#15803d', border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            <Navigation size={13} strokeWidth={2.3} /> {t('home.hero.enableGps')}
          </button>
        )}
      </section>

      {/* Categories — horizontal rail */}
      <section style={{ padding: '20px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>{t('home.categoriesTitle')}</h2>
        </div>
        <div
          className="kd-hide-scrollbar"
          style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4 }}
        >
          {CATEGORIES.map((c) => {
            const Icon = categoryIcon(c.id);
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/search?category=${c.id}`)}
                style={{
                  flex: '0 0 96px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                  background: '#fff', border: '1px solid #eef0f3', borderRadius: 16,
                  padding: '14px 8px 12px', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                }}
              >
                <span style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${c.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Icon size={26} color={c.color} strokeWidth={1.9} />
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.3 }}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products grid */}
      <section style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>{t('home.bestSellersTitle')}</h2>
          <button onClick={() => navigate('/search')} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {t('common.seeAll')} <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {PRODUCTS.map((p) => {
            const Icon = productIcon(p.id);
            const stocking = RETAILER_STOCK.filter((i) => i.productId === p.id && i.inStock).length;
            const prices = RETAILER_STOCK.filter((i) => i.productId === p.id).map((i) => i.price);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                style={{
                  background: '#fff', border: '1px solid #eef0f3', borderRadius: 16,
                  padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{
                  height: 120,
                  background: `linear-gradient(135deg, ${p.imageColor}12, ${p.imageColor}28)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <Icon size={48} color={p.imageColor} strokeWidth={1.7} />
                  {stocking > 0 && (
                    <span style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#16a34a', color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}>
                      <Clock3 size={10} strokeWidth={2.5} /> {t('common.today')}
                    </span>
                  )}
                </div>
                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {p.categoryLabel}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 34 }}>
                    {p.shortName}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                    {p.packSizes.slice(0, 2).join(' · ')}
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                        {minPrice > 0 ? `₹${minPrice}` : '—'}
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{t('home.shopsCount', { count: stocking })}</div>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      background: '#f0fdf4', color: '#15803d',
                      border: '1px solid #bbf7d0', borderRadius: 8,
                      fontSize: 12, fontWeight: 700, padding: '6px 10px',
                    }}>
                      {t('home.add')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Nearby shops */}
      <section style={{ padding: '16px 16px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>{t('home.nearbyShopsTitle')}</h2>
          <button onClick={() => navigate('/retailers')} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {t('common.seeAll')} <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        {data && (
          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
            {data.scope === 'radius' && data.radiusKm > 0 && t('home.nearbyScopeRadius', { km: data.radiusKm, label: location.label })}
            {data.scope === 'district' && t('home.nearbyScopeDistrict')}
            {data.scope === 'state' && t('home.nearbyScopeState')}
            {data.fromCache && data.cachedAt && (
              <span style={{ marginLeft: 6, color: '#92400e' }}>· {t('home.lastUpdated', { when: relativeTime(data.cachedAt) })}</span>
            )}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading && !data ? (
            <>
              <NearbyRowSkeleton />
              <NearbyRowSkeleton />
              <NearbyRowSkeleton />
            </>
          ) : nearby.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #eef0f3', borderRadius: 14, padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
              {t('home.nearbyEmpty')}
            </div>
          ) : (
            nearby.map(({ retailer, distanceM: d }) => (
              <button
                key={retailer.id}
                onClick={() => navigate(`/retailer/${retailer.id}`)}
                style={{
                  background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
                  padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShopIcon size={22} color="#16a34a" strokeWidth={1.9} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{retailer.businessName}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Star size={11} fill="#f59e0b" stroke="none" />
                    <span style={{ fontWeight: 700, color: '#374151' }}>{retailer.rating.toFixed(1)}</span>
                    <span>·</span>
                    <span>{retailer.city}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>{formatDistance(d)}</div>
                  <a href={`tel:${retailer.phone}`} onClick={(e) => e.stopPropagation()} style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none', fontWeight: 600 }}>
                    <Phone size={11} strokeWidth={2.2} /> {t('home.callShort')}
                  </a>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ padding: '0 16px 28px' }}>
        <div style={{ background: '#fff', border: '1px solid #eef0f3', borderRadius: 16, padding: 18, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: ShieldCheck, title: t('home.trust.genuineTitle'), body: t('home.trust.genuineBody') },
              { icon: MapPin, title: t('home.trust.stockTitle'), body: t('home.trust.stockBody') },
              { icon: Phone, title: t('home.trust.callTitle'), body: t('home.trust.callBody') },
              { icon: Truck, title: t('home.trust.navTitle'), body: t('home.trust.navBody') },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#16a34a" strokeWidth={2.1} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/retailers')}
            style={{
              marginTop: 16, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '12px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
            }}
          >
            {t('home.browseAllRetailers')} <ArrowRight size={15} strokeWidth={2.3} />
          </button>
        </div>
      </section>
    </div>
  );
}
