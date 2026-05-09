// Brief-named hook. Thin adapter over LocationContext exposing the GPS-relevant slice
// + a request() helper. The full context (manual picker, district, etc.) stays available
// via useLocation(); this is the minimal surface for product-search UIs.
import { useLocation } from '../LocationContext';
import type { GeoCoords } from '../utils/location';

export interface UserLocationState {
  coords: GeoCoords;
  label: string;
  source: 'gps' | 'manual' | 'default';
  loading: boolean;
  request: () => Promise<void>;
}

export function useUserLocation(): UserLocationState {
  const { location, requesting, requestGps } = useLocation();
  return {
    coords: { lat: location.lat, lng: location.lng },
    label: location.label,
    source: location.source,
    loading: requesting,
    request: requestGps,
  };
}
