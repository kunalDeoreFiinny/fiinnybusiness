// Thin async cache wrapper around idb-keyval with timestamped envelopes.
// Falls back to localStorage if IndexedDB is unavailable (private mode, very old browsers).
import { get, set, del } from 'idb-keyval';

interface Envelope<T> {
  value: T;
  savedAt: number; // ms epoch
}

const LS_PREFIX = 'kd_cache:';

function lsAvailable(): boolean {
  try {
    const k = '__kd_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  const envelope: Envelope<T> = { value, savedAt: Date.now() };
  try {
    await set(key, envelope);
  } catch {
    if (lsAvailable()) localStorage.setItem(LS_PREFIX + key, JSON.stringify(envelope));
  }
}

export async function cacheGet<T>(key: string): Promise<{ value: T; savedAt: number } | null> {
  try {
    const idb = (await get(key)) as Envelope<T> | undefined;
    if (idb) return idb;
  } catch { /* fall through */ }

  if (lsAvailable()) {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw) {
      try { return JSON.parse(raw) as Envelope<T>; } catch { /* corrupted */ }
    }
  }
  return null;
}

export async function cacheDelete(key: string): Promise<void> {
  try { await del(key); } catch { /* ignore */ }
  if (lsAvailable()) localStorage.removeItem(LS_PREFIX + key);
}

export const CACHE_KEYS = {
  productsByLocation: (lat: number, lng: number) => `products:${lat.toFixed(2)}:${lng.toFixed(2)}`,
  shopsByLocation: (lat: number, lng: number) => `shops:${lat.toFixed(2)}:${lng.toFixed(2)}`,
  retailersForProduct: (productId: string, lat: number, lng: number) =>
    `retailersFor:${productId}:${lat.toFixed(2)}:${lng.toFixed(2)}`,
} as const;
