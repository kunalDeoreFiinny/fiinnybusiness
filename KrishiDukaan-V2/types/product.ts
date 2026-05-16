export type MarketplaceProduct = {
  id: string;
  name: string;
  fullName?: string;
  price: number;
  oldPrice?: number;
  category: string;
  description: string;
  image: string;
  /** Ownership */
  ownerId?: string;
  ownerType?: "manufacturer" | "retailer";
  createdBy?: string;
  source?: string;
  /** Back-compat / reference fields */
  manufacturerId?: string;
  manufacturerProductId?: string;
  retailerId?: string;
  retailerDocId?: string;
  /** Legacy display fields — present on older documents only */
  stock?: string;
  store?: string;
  distance?: string;
  availability?: {
    storeId: string;
    stockLevel: string;
  }[];
};
