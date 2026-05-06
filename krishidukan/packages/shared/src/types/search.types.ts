export interface ShopSearchResult {
  shopId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  addressLine: string;
  city: string;
  lat: number;
  lng: number;
  price: number;
  mrp: number;
  quantity: number;
  inStock: boolean;
  distanceM: number;
  distanceKm: number;
}

export interface SearchResponse {
  results: ShopSearchResult[];
  total: number;
  productId: string;
  userLat: number;
  userLng: number;
  radiusKm: number;
}
