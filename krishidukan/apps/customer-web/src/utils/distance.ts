// Distance helpers. Wraps the existing haversine in demoData so call-sites can think in km.
import { distanceM } from '../demoData';

export interface LatLng {
  lat: number;
  lng: number;
}

export function getDistanceKm(a: LatLng, b: LatLng): number {
  return distanceM(a.lat, a.lng, b.lat, b.lng) / 1000;
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
