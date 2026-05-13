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

export type GeoResult = {
  coords: LatLng;
  label: string;
  source: 'browser' | 'cached' | 'default';
};

/** Try to load a previously persisted location from localStorage */
export function getCachedLocation(): GeoResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const label = localStorage.getItem(LABEL_STORAGE_KEY);
    if (raw) {
      const coords = JSON.parse(raw) as LatLng;
      if (coords.lat && coords.lng) {
        return { coords, label: label || DEFAULT_LOCATION_LABEL, source: 'cached' };
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
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
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}
