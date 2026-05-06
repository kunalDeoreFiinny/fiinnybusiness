import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DEFAULT_LOCATION } from './demoData';

interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  source: 'gps' | 'manual' | 'default';
}

interface LocationState {
  location: UserLocation;
  requesting: boolean;
  requestGps: () => void;
  setManual: (lat: number, lng: number, label: string) => void;
}

const LocationContext = createContext<LocationState | null>(null);
const LS_KEY = 'kd_user_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {/* ignore */}
    return { ...DEFAULT_LOCATION, source: 'default' };
  });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(location));
  }, [location]);

  function requestGps() {
    if (!navigator.geolocation) return;
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
      },
      () => setRequesting(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }

  function setManual(lat: number, lng: number, label: string) {
    setLocation({ lat, lng, label, source: 'manual' });
  }

  return (
    <LocationContext.Provider value={{ location, requesting, requestGps, setManual }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
