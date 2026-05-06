import axios from 'axios';
import Constants from 'expo-constants';

const BASE = (Constants.expoConfig?.extra?.['kdApiBaseUrl'] as string) ?? 'http://localhost:3001';

export const kdApi = axios.create({ baseURL: `${BASE}/api/v1` });

export function setKdToken(token: string | null) {
  if (token) {
    kdApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete kdApi.defaults.headers.common['Authorization'];
  }
}
