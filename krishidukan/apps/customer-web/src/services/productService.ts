// Product service. Lists products and finds where they're stocked, with progressive radius (F4)
// and offline cache fallback (F7).
import {
  PRODUCTS, RETAILER_STOCK, distanceM,
  type Product, type RetailerStock, type StockResult,
} from '../demoData';
import { RETAILERS_EXTENDED, type RetailerExtended } from '../data/retailers';
import { isLiveBackend, api, isNetworkError } from './api';
import { cacheGet, cacheSet, CACHE_KEYS } from './cache';

export interface ProductListItem {
  product: Product;
  inStockRetailerCount: number;
  minPrice: number;
}

export interface RetailersForProductResult {
  product: Product;
  results: StockResult[];
  radiusKm: number;
  scope: 'radius' | 'district' | 'state';
  fromCache: boolean;
  cachedAt?: number;
}

const RADIUS_BANDS_KM = [5, 10, 20];

function buildStockResults(productId: string, retailers: RetailerExtended[], lat: number, lng: number): StockResult[] {
  const results: StockResult[] = [];
  retailers.forEach((r) => {
    const stock = RETAILER_STOCK.find((s) => s.retailerId === r.id && s.productId === productId);
    if (!stock) return;
    results.push({ retailer: r, stock, distanceM: distanceM(lat, lng, r.lat, r.lng) });
  });
  results.sort((a, b) => {
    if (a.stock.inStock !== b.stock.inStock) return a.stock.inStock ? -1 : 1;
    return a.distanceM - b.distanceM;
  });
  return results;
}

function nearestDistrict(lat: number, lng: number): string | null {
  let bestDistrict: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  RETAILERS_EXTENDED.forEach((r) => {
    const d = distanceM(lat, lng, r.lat, r.lng);
    if (d < bestDistance) {
      bestDistance = d;
      bestDistrict = r.district;
    }
  });
  return bestDistrict;
}

function progressiveSearch(productId: string, lat: number, lng: number): { results: StockResult[]; radiusKm: number; scope: 'radius' | 'district' | 'state' } {
  for (const km of RADIUS_BANDS_KM) {
    const radiusM = km * 1000;
    const filtered = RETAILERS_EXTENDED.filter((r) => distanceM(lat, lng, r.lat, r.lng) <= radiusM);
    const hits = buildStockResults(productId, filtered, lat, lng);
    if (hits.length > 0) return { results: hits, radiusKm: km, scope: 'radius' };
  }
  const district = nearestDistrict(lat, lng);
  if (district) {
    const inDistrict = RETAILERS_EXTENDED.filter((r) => r.district === district);
    const hits = buildStockResults(productId, inDistrict, lat, lng);
    if (hits.length > 0) return { results: hits, radiusKm: 0, scope: 'district' };
  }
  return { results: buildStockResults(productId, RETAILERS_EXTENDED, lat, lng), radiusKm: 0, scope: 'state' };
}

export async function listProducts(): Promise<Product[]> {
  if (isLiveBackend) {
    try {
      const res = await api.get<Product[]>('/products');
      await cacheSet('products:all', res.data);
      return res.data;
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = await cacheGet<Product[]>('products:all');
        if (cached) return cached.value;
      }
    }
  }
  return PRODUCTS;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (isLiveBackend) {
    try {
      const res = await api.get<Product>(`/products/${id}`);
      return res.data;
    } catch { /* fall through */ }
  }
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function listProductsForLocation(lat: number, lng: number): Promise<ProductListItem[]> {
  const cacheKey = CACHE_KEYS.productsByLocation(lat, lng);

  if (isLiveBackend) {
    try {
      const res = await api.get<ProductListItem[]>('/products/for-location', { params: { lat, lng } });
      await cacheSet(cacheKey, res.data);
      return res.data;
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = await cacheGet<ProductListItem[]>(cacheKey);
        if (cached) return cached.value;
      }
    }
  }

  const items: ProductListItem[] = PRODUCTS.map((p) => {
    const stocks: RetailerStock[] = RETAILER_STOCK.filter((s) => s.productId === p.id);
    const inStockRetailerCount = stocks.filter((s) => s.inStock).length;
    const prices = stocks.map((s) => s.price).filter((n) => n > 0);
    return { product: p, inStockRetailerCount, minPrice: prices.length ? Math.min(...prices) : 0 };
  });
  await cacheSet(cacheKey, items);
  return items;
}

export async function findRetailersForProduct(productId: string, lat: number, lng: number): Promise<RetailersForProductResult> {
  const cacheKey = CACHE_KEYS.retailersForProduct(productId, lat, lng);
  const product = await fetchProduct(productId);
  if (!product) {
    return { product: PRODUCTS[0]!, results: [], radiusKm: 0, scope: 'state', fromCache: false };
  }

  if (isLiveBackend) {
    try {
      const res = await api.get<{ results: StockResult[]; radiusKm: number; scope: 'radius' | 'district' | 'state' }>(
        `/products/${productId}/retailers`, { params: { lat, lng } },
      );
      await cacheSet(cacheKey, res.data);
      return { product, ...res.data, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = await cacheGet<{ results: StockResult[]; radiusKm: number; scope: 'radius' | 'district' | 'state' }>(cacheKey);
        if (cached) return { product, ...cached.value, fromCache: true, cachedAt: cached.savedAt };
      }
    }
  }

  const computed = progressiveSearch(productId, lat, lng);
  await cacheSet(cacheKey, computed);
  return { product, ...computed, fromCache: false };
}
