import axios, { AxiosRequestConfig } from 'axios';
import {
  IS_DEMO,
  DEMO_SHOP,
  DEMO_SHOP_STATS,
  DEMO_PRODUCTS,
  DEMO_INVENTORY,
} from './demoMode';

const BASE = import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:3001';

export const api = axios.create({ baseURL: `${BASE}/api/v1` });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// In-memory mutable state so add/remove inventory feels real in demo
const inventoryStore = [...DEMO_INVENTORY];

function mockResponse(config: AxiosRequestConfig): unknown {
  const url = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

  if (method === 'post' && url === '/auth/login') {
    return { accessToken: 'demo-jwt', role: 'shop_owner', shopId: DEMO_SHOP.id };
  }
  if (method === 'get' && url === '/shops/me') return DEMO_SHOP;
  if (method === 'patch' && url === '/shops/me') return DEMO_SHOP;
  if (method === 'post' && url === '/shops') return DEMO_SHOP;

  if (method === 'get' && url === '/inventory/my-shop') return inventoryStore;
  if (method === 'get' && url === '/products') {
    return { products: DEMO_PRODUCTS, total: DEMO_PRODUCTS.length };
  }

  // PUT /inventory/:productId
  const putMatch = /^\/inventory\/([^/]+)$/.exec(url);
  if (method === 'put' && putMatch) {
    const productId = putMatch[1];
    const product = DEMO_PRODUCTS.find((p) => p.id === productId);
    if (product) {
      const existing = inventoryStore.findIndex((i) => i.productId === productId);
      const item = {
        id: `inv-${Date.now()}`,
        productId,
        price: data.price ?? 0,
        mrp: data.mrp ?? 0,
        quantity: data.quantity ?? 0,
        inStock: (data.quantity ?? 0) > 0,
        product,
      };
      if (existing >= 0) inventoryStore[existing] = item;
      else inventoryStore.push(item);
      return item;
    }
    return {};
  }

  // DELETE /inventory/:productId
  if (method === 'delete' && putMatch) {
    const productId = putMatch[1];
    const idx = inventoryStore.findIndex((i) => i.productId === productId);
    if (idx >= 0) inventoryStore.splice(idx, 1);
    return { ok: true };
  }

  // GET /analytics/shop/:id
  if (method === 'get' && /^\/analytics\/shop\/[^/]+$/.test(url)) {
    return DEMO_SHOP_STATS;
  }

  // POST /licenses
  if (method === 'post' && url === '/licenses') {
    return { id: `lic-${Date.now()}`, ...data };
  }
  if (method === 'get' && url === '/licenses/my-shop') {
    return [];
  }

  return {};
}

if (IS_DEMO) {
  api.interceptors.request.use((config) => {
    config.adapter = async () => ({
      data: mockResponse(config),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
    return config;
  });
}
