export interface SearchQueryDto {
  productId: string;
  lat: number;
  lng: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface LogEventDto {
  shopId: string;
  productId?: string;
  action: 'view' | 'call' | 'direction';
}
