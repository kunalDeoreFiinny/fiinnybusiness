import { InventorySource } from '../enums/inventory-source.enum';

export interface ShopInventory {
  id: string;
  shopId: string;
  productId: string;
  price: number;
  mrp: number;
  quantity: number;
  inStock: boolean;
  source: InventorySource;
  lastUpdated: Date;
}

export interface ShopInventoryWithProduct extends ShopInventory {
  product: {
    id: string;
    name: string;
    brand?: string | null;
    category: string;
    defaultImage?: string | null;
  };
}
