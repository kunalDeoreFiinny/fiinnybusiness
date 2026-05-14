export type MarketplaceProduct = {
  id: string;
  name: string;
  fullName?: string;
  price: number;
  oldPrice?: number;
  category: string;
  description: string;
  image: string;
  stock: string;
  store: string;
  distance: string;
  availability?: {
    storeId: string;
    stockLevel: string;
  }[];
};
