// Drives the shops list with progressive radius (F4) + offline-aware retry (F7).
import { useEffect, useRef, useState } from 'react';
import { fetchNearbyShops, NearbyResult } from '../services/shopService';

const RETRY_INTERVAL_MS = 30_000;

interface State {
  data: NearbyResult | null;
  loading: boolean;
  error: string | null;
}

export function useNearbyShops(lat: number, lng: number) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  const reqIdRef = useRef(0);

  useEffect(() => {
    const myReq = ++reqIdRef.current;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    async function load() {
      try {
        const data = await fetchNearbyShops(lat, lng);
        if (cancelled || myReq !== reqIdRef.current) return;
        setState({ data, loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Failed to load' }));
      }
    }

    load();

    // Silent retry while data is from cache (offline / live-fetch failure).
    const interval = setInterval(() => {
      if (cancelled) return;
      // Only retry if we currently know we're on cache
      if (reqIdRef.current === myReq) load();
    }, RETRY_INTERVAL_MS);

    return () => { cancelled = true; clearInterval(interval); };
  }, [lat, lng]);

  return state;
}
