// Shop discovery service. Provides progressive-radius search (F4) over the mock dataset.
// All public functions return Promises so the call sites don't change when a real backend lands.
import { distanceM } from '../demoData';
import type { Retailer } from '../demoData';
import { RETAILERS_EXTENDED, type RetailerExtended } from '../data/retailers';
import { isLiveBackend, api, isNetworkError } from './api';
import { cacheGet, cacheSet, CACHE_KEYS } from './cache';

export interface NearbyRetailer {
  retailer: RetailerExtended;
  distanceM: number;
}

export interface NearbyResult {
  shops: NearbyRetailer[];
  radiusKm: number;
  scope: 'radius' | 'district' | 'state';
  fromCache: boolean;
  cachedAt?: number;
}

// Progressive search bands. The function expands until at least one shop is found
// or the state-wide band is reached. Farmers must never see a "No results" dead end (F4).
const RADIUS_BANDS_KM = [5, 10, 20];

function within(retailers: RetailerExtended[], lat: number, lng: number, km: number): NearbyRetailer[] {
  const m = km * 1000;
  return retailers
    .map((r) => ({ retailer: r, distanceM: distanceM(lat, lng, r.lat, r.lng) }))
    .filter((x) => x.distanceM <= m)
    .sort((a, b) => a.distanceM - b.distanceM);
}

function nearestDistrict(lat: number, lng: number): string | null {
  let bestDistrict: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  RETAILERS_EXTENDED.forEach((r) => {
    const d = distanceM(lat, lng, r.lat, r.lng);
    if (d < bestDistance) {
      bestDistance = d;
      bestDistrict = r.district;
    }
  });
  return bestDistrict;
}

function progressiveSearch(retailers: RetailerExtended[], lat: number, lng: number): Omit<NearbyResult, 'fromCache' | 'cachedAt'> {
  for (const km of RADIUS_BANDS_KM) {
    const hit = within(retailers, lat, lng, km);
    if (hit.length > 0) return { shops: hit, radiusKm: km, scope: 'radius' };
  }
  const district = nearestDistrict(lat, lng);
  if (district) {
    const inDistrict = retailers
      .filter((r) => r.district === district)
      .map((r) => ({ retailer: r, distanceM: distanceM(lat, lng, r.lat, r.lng) }))
      .sort((a, b) => a.distanceM - b.distanceM);
    if (inDistrict.length > 0) return { shops: inDistrict, radiusKm: 0, scope: 'district' };
  }
  // State-wide fallback: every retailer (sorted by distance).
  const all = retailers
    .map((r) => ({ retailer: r, distanceM: distanceM(lat, lng, r.lat, r.lng) }))
    .sort((a, b) => a.distanceM - b.distanceM);
  return { shops: all, radiusKm: 0, scope: 'state' };
}

export async function fetchNearbyShops(lat: number, lng: number): Promise<NearbyResult> {
  const cacheKey = CACHE_KEYS.shopsByLocation(lat, lng);

  if (isLiveBackend) {
    try {
      const res = await api.get<{ shops: RetailerExtended[] }>('/shops/nearby', { params: { lat, lng } });
      const computed = progressiveSearch(res.data.shops, lat, lng);
      await cacheSet(cacheKey, { shops: res.data.shops });
      return { ...computed, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = await cacheGet<{ shops: RetailerExtended[] }>(cacheKey);
        if (cached) {
          const computed = progressiveSearch(cached.value.shops, lat, lng);
          return { ...computed, fromCache: true, cachedAt: cached.savedAt };
        }
      }
      // fall through to mock
    }
  }

  const computed = progressiveSearch(RETAILERS_EXTENDED, lat, lng);
  // Save mock data to cache so true offline mode still has something to read
  await cacheSet(cacheKey, { shops: RETAILERS_EXTENDED });
  return { ...computed, fromCache: false };
}

export async function fetchRetailerById(id: string): Promise<RetailerExtended | null> {
  if (isLiveBackend) {
    try {
      const res = await api.get<RetailerExtended>(`/shops/${id}`);
      return res.data;
    } catch (err) {
      if (!isNetworkError(err)) return null;
      // network down → fall through to mock
    }
  }
  return RETAILERS_EXTENDED.find((r) => r.id === id) ?? null;
}

// Re-export the existing Retailer type for downstream code
export type { Retailer };
