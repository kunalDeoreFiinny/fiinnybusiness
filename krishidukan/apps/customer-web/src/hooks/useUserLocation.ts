import { useLocation } from '../LocationContext';

export interface UserLocationHook {
  lat: number;
  lng: number;
  label: string;
  source: 'gps' | 'manual' | 'default';
  requesting: boolean;
  needsLocation: boolean;
  requestGps: () => Promise<void>;
}

/**
 * Thin wrapper over LocationContext that exposes only the fields needed
 * for location-based product search.
 */
export function useUserLocation(): UserLocationHook {
  const { location, requesting, needsLocation, requestGps } = useLocation();
  return {
    lat: location.lat,
    lng: location.lng,
    label: location.label,
    source: location.source,
    requesting,
    needsLocation,
    requestGps,
  };
}
