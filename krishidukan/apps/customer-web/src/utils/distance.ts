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
}
