import { getDistance } from 'geolib';

/** Straight-line distance in metres between two WGS-84 coordinates (via geolib). */
export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return getDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 },
  );
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
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
