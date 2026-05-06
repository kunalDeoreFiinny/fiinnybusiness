import { ActionType } from '../enums/action-type.enum';

export interface SearchLog {
  id: string;
  userId?: string | null;
  productId: string;
  queryLat: number;
  queryLng: number;
  radiusKm: number;
  resultsCount: number;
  timestamp: Date;
}

export interface ShopView {
  id: string;
  userId?: string | null;
  shopId: string;
  productId?: string | null;
  action: ActionType;
  timestamp: Date;
}

export interface ShopAnalyticsSummary {
  shopId: string;
  totalViews: number;
  totalCalls: number;
  totalDirections: number;
  viewsLast7Days: number;
  callsLast7Days: number;
}

export interface PlatformAnalyticsSummary {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  totalFarmers: number;
  totalSearches: number;
  searchesLast7Days: number;
  topProducts: Array<{ productId: string; name: string; searchCount: number }>;
  topShops: Array<{ shopId: string; businessName: string; viewCount: number }>;
}
