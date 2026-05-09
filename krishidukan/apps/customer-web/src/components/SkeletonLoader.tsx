// Skeleton loaders that mirror each card's exact footprint to avoid layout shift (F5).
import { CSSProperties } from 'react';

const SHIMMER_KEY = 'kd-shimmer';
const KEYFRAMES = `@keyframes ${SHIMMER_KEY} { 0% { background-position: -200px 0 } 100% { background-position: 200px 0 } }`;

const shimmer: CSSProperties = {
  background: 'linear-gradient(90deg, #f3f4f6 0px, #e5e7eb 60px, #f3f4f6 120px)',
  backgroundSize: '200px 100%',
  animation: `${SHIMMER_KEY} 1.2s linear infinite`,
  borderRadius: 6,
};

export function SkeletonStyle() {
  return <style>{KEYFRAMES}</style>;
}

export function ShopRowSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14 }}>
      <SkeletonStyle />
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...shimmer, width: 52, height: 52, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmer, width: '70%', height: 14, marginBottom: 8 }} />
          <div style={{ ...shimmer, width: '45%', height: 11 }} />
        </div>
        <div style={{ ...shimmer, width: 50, height: 14 }} />
      </div>
      <div style={{ ...shimmer, width: '85%', height: 11, marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ ...shimmer, flex: 1, height: 32, borderRadius: 8 }} />
        <div style={{ ...shimmer, flex: 1, height: 32, borderRadius: 8 }} />
        <div style={{ ...shimmer, flex: 1, height: 32, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function ProductRowSkeleton() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
      <SkeletonStyle />
      <div style={{ ...shimmer, width: 36, height: 36, borderRadius: 9 }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...shimmer, width: '60%', height: 13, marginBottom: 6 }} />
        <div style={{ ...shimmer, width: '40%', height: 10 }} />
      </div>
    </div>
  );
}

export function NearbyRowSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <SkeletonStyle />
      <div style={{ ...shimmer, width: 44, height: 44, borderRadius: 10 }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...shimmer, width: '70%', height: 13, marginBottom: 6 }} />
        <div style={{ ...shimmer, width: '50%', height: 11 }} />
      </div>
      <div style={{ ...shimmer, width: 48, height: 13 }} />
    </div>
  );
}
