export interface UpsertInventoryDto {
  price: number;
  mrp: number;
  quantity: number;
}

export interface ErpSyncItemDto {
  productId: string;
  quantity: number;
  price: number;
  mrp: number;
}

export interface ErpSyncDto {
  items: ErpSyncItemDto[];
  shopErpRef?: string;
}
