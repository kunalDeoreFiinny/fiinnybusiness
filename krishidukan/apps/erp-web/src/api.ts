import axios from 'axios';

const BASE = (typeof import.meta !== 'undefined' ? import.meta.env?.['VITE_KD_API_BASE_URL'] : undefined)
  ?? (typeof process !== 'undefined' ? process.env['VITE_KD_API_BASE_URL'] : undefined)
  ?? 'http://localhost:3001';

export const kdApi = axios.create({ baseURL: `${BASE}/api/v1` });

export function setKdToken(token: string | null) {
  if (token) {
    kdApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete kdApi.defaults.headers.common['Authorization'];
  }
}
