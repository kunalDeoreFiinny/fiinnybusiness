// Find retailers for a product (F3+F4+F7).
import { useEffect, useRef, useState } from 'react';
import { findRetailersForProduct, RetailersForProductResult } from '../services/productService';

const RETRY_INTERVAL_MS = 30_000;

interface State {
  data: RetailersForProductResult | null;
  loading: boolean;
  error: string | null;
}

export function useRetailersForProduct(productId: string | undefined, lat: number, lng: number) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!productId) { setState({ data: null, loading: false, error: null }); return; }
    const myReq = ++reqIdRef.current;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    async function load() {
      try {
        const data = await findRetailersForProduct(productId!, lat, lng);
        if (cancelled || myReq !== reqIdRef.current) return;
        setState({ data, loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Failed to load' }));
      }
    }

    load();
    const interval = setInterval(() => { if (!cancelled && myReq === reqIdRef.current) load(); }, RETRY_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [productId, lat, lng]);

  return state;
}
