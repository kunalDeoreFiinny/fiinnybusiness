import axios, { AxiosRequestConfig } from 'axios';
import {
  IS_DEMO,
  DEMO_PENDING_SHOPS,
  DEMO_ACTIVE_SHOPS,
  DEMO_SHOP_LICENSES,
  DEMO_ANALYTICS,
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

const ALL_SHOPS = [...DEMO_PENDING_SHOPS, ...DEMO_ACTIVE_SHOPS];
const SHOP_DB: Record<string, any> = Object.fromEntries(
  ALL_SHOPS.map((s) => [
    s.id,
    {
      ...s,
      gst: '27AAACK1234L1Z5',
      adminNotes: null,
      licenses: DEMO_SHOP_LICENSES,
      _count: { inventory: Math.floor(Math.random() * 30) + 5, views: Math.floor(Math.random() * 200) + 20 },
    },
  ]),
);

function mockResponse(config: AxiosRequestConfig): unknown {
  const url = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();
  const params = (config.params ?? {}) as Record<string, string>;

  // GET /admin/shops?status=...
  if (method === 'get' && url === '/admin/shops') {
    const status = params.status;
    let list = ALL_SHOPS.map((s) => ({
      ...s,
      licenses: DEMO_SHOP_LICENSES.map((l) => ({ id: l.id })),
    }));
    if (status) list = list.filter((s) => s.status === status);
    return { shops: list, total: list.length };
  }

  // GET /admin/shops/:id
  const detailMatch = /^\/admin\/shops\/([^/]+)$/.exec(url);
  if (method === 'get' && detailMatch) {
    const id = detailMatch[1];
    return SHOP_DB[id] ?? SHOP_DB[ALL_SHOPS[0].id];
  }

  // POST /admin/shops/:id/approve
  if (method === 'post' && /^\/admin\/shops\/[^/]+\/approve$/.test(url)) {
    return { erpApiKey: 'kd_demo_' + Math.random().toString(36).slice(2, 18) };
  }

  // POST /admin/shops/:id/reject | suspend
  if (method === 'post' && /^\/admin\/shops\/[^/]+\/(reject|suspend)$/.test(url)) {
    return { ok: true };
  }

  // GET /admin/analytics/summary
  if (method === 'get' && url === '/admin/analytics/summary') {
    return DEMO_ANALYTICS;
  }

  // GET /licenses/:id/url
  if (method === 'get' && /^\/licenses\/[^/]+\/url$/.test(url)) {
    return { url: 'https://placehold.co/800x1100/16a34a/fff/png?text=License+Document+(Demo)&font=montserrat' };
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
