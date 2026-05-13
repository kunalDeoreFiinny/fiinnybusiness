/**
 * Geolocation helper: browser getCurrentPosition with fallback.
 * Persists last known location to localStorage.
 */

import { LatLng } from './haversine';

/** Default fallback: Pune, Maharashtra */
export const DEFAULT_LOCATION: LatLng = { lat: 18.5204, lng: 73.8567 };
export const DEFAULT_LOCATION_LABEL = 'Pune, Maharashtra';

const STORAGE_KEY = 'krishidukaan_user_location';
const LABEL_STORAGE_KEY = 'krishidukaan_user_location_label';
const CACHE_TTL_MS = 10 * 60 * 1000;

export type GeoResult = {
  coords: LatLng;
  label: string;
  source: 'browser' | 'cached' | 'default';
};

type CachedLocationPayload = {
  coords: LatLng;
  label?: string;
  timestamp?: number;
};

function isValidLatLng(coords: LatLng | undefined | null): coords is LatLng {
  if (!coords) return false;
  if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return false;
  if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return false;
  return Math.abs(coords.lat) <= 90 && Math.abs(coords.lng) <= 180;
}

function isFreshTimestamp(timestamp?: number): boolean {
  if (typeof timestamp !== 'number') return false;
  return Date.now() - timestamp <= CACHE_TTL_MS;
}

/** Try to load a previously persisted location from localStorage */
export function getCachedLocation(): GeoResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const label = localStorage.getItem(LABEL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LatLng | CachedLocationPayload | null;

      if (parsed && typeof parsed === 'object' && 'coords' in parsed) {
        const coords = parsed.coords as LatLng;
        const cachedLabel = parsed.label || label || DEFAULT_LOCATION_LABEL;
        if (isValidLatLng(coords) && isFreshTimestamp(parsed.timestamp)) {
          return { coords, label: cachedLabel, source: 'cached' };
        }
        return null;
      }

      if (isValidLatLng(parsed as LatLng)) {
        // Legacy cache format without timestamp is treated as stale.
        return null;
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

/** Persist a location to localStorage */
export function cacheLocation(coords: LatLng, label: string): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedLocationPayload = {
      coords,
      label,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(LABEL_STORAGE_KEY, label);
  } catch {
    // storage full or blocked — ignore
  }
}

/**
 * Request the user's location via the browser Geolocation API.
 * Falls back to cached → default if denied/unavailable.
 */
export function getUserLocation(): Promise<GeoResult> {
  return new Promise((resolve) => {
    // Check for cached location first as an immediate fallback
    const cached = getCachedLocation();

    if (!navigator.geolocation) {
      // Geolocation not supported
      resolve(cached || { coords: DEFAULT_LOCATION, label: DEFAULT_LOCATION_LABEL, source: 'default' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: LatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const label = `${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`;
        cacheLocation(coords, label);
        resolve({ coords, label, source: 'browser' });
      },
      (_error) => {
        // Permission denied or error — use cached or default
        resolve(cached || { coords: DEFAULT_LOCATION, label: DEFAULT_LOCATION_LABEL, source: 'default' });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
