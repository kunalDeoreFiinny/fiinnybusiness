import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { DEFAULT_LOCATION } from './demoData';
import type { LocationEntry } from './data/locationCatalog';

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  source: 'gps' | 'manual' | 'default';
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

interface LocationState {
  location: UserLocation;
  requesting: boolean;
  /** True until the user has explicitly chosen a GPS or manual location. */
  needsLocation: boolean;
  online: boolean;
  requestGps: () => Promise<void>;
  setManual: (lat: number, lng: number, label: string) => void;
  setManualEntry: (entry: LocationEntry) => void;
  /** Mark that the user dismissed the first-open prompt; we won't auto-show it again. */
  dismissPrompt: () => void;
  /** True if the first-open prompt should be auto-shown. */
  shouldAutoPrompt: boolean;
}

const LocationCtx = createContext<LocationState | null>(null);
const LS_KEY = 'kd_user_location';
const LS_DISMISSED = 'kd_location_prompt_dismissed';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {/* ignore */}
    return { ...DEFAULT_LOCATION, source: 'default' as const };
  });
  const [requesting, setRequesting] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem(LS_DISMISSED) === '1'; } catch { return false; }
  });
  const [online, setOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    function up() { setOnline(true); }
    function down() { setOnline(false); }
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const requestGps = useCallback((): Promise<void> => new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(); return; }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Your Location',
          source: 'gps',
        });
        setRequesting(false);
        resolve();
      },
      () => { setRequesting(false); resolve(); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }), []);

  const setManual = useCallback((lat: number, lng: number, label: string) => {
    setLocation({ lat, lng, label, source: 'manual' });
  }, []);

  const setManualEntry = useCallback((entry: LocationEntry) => {
    setLocation({
      lat: entry.lat,
      lng: entry.lng,
      label: `${entry.village}, ${entry.district}`,
      source: 'manual',
      village: entry.village,
      district: entry.district,
      state: entry.state,
      pincode: entry.pincode,
    });
  }, []);

  const dismissPrompt = useCallback(() => {
    try { localStorage.setItem(LS_DISMISSED, '1'); } catch {/* ignore */}
    setDismissed(true);
  }, []);

  const needsLocation = location.source === 'default';
  const shouldAutoPrompt = needsLocation && !dismissed;

  const value = useMemo<LocationState>(() => ({
    location, requesting, needsLocation, online,
    requestGps, setManual, setManualEntry, dismissPrompt, shouldAutoPrompt,
  }), [location, requesting, needsLocation, online, requestGps, setManual, setManualEntry, dismissPrompt, shouldAutoPrompt]);

  return <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationCtx);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
