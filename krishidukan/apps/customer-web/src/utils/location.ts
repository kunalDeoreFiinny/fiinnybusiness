// Browser geolocation helpers. The high-level state is in LocationContext;
// these utilities are for one-shot direct access where context would be overkill.

export interface GeoCoords {
  lat: number;
  lng: number;
}

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';

export interface GeoResult {
  status: GeoStatus;
  coords?: GeoCoords;
  error?: string;
}

export function geolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

export function getCurrentPosition(timeoutMs = 8000): Promise<GeoResult> {
  if (!geolocationSupported()) {
    return Promise.resolve({ status: 'unavailable', error: 'Geolocation is not supported in this browser.' });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        status: 'granted',
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          resolve({ status: 'denied', error: 'Location permission was denied.' });
        } else {
          resolve({ status: 'error', error: err.message || 'Failed to get location.' });
        }
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}
