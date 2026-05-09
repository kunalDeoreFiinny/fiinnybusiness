// Axios client. Reads base URL from VITE_API_BASE_URL.
// When the URL is empty, services skip the network and return mock data only.
import axios, { AxiosError, AxiosInstance } from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? '').trim();

export const isLiveBackend: boolean = baseURL.length > 0;

export const api: AxiosInstance = axios.create({
  baseURL: isLiveBackend ? baseURL : undefined,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

export function isNetworkError(err: unknown): boolean {
  if (err instanceof AxiosError) {
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') return true;
    if (!err.response) return true;
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  return false;
}
