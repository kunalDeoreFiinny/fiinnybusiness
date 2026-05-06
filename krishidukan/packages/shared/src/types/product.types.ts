import { ProductCategory } from '../enums/product-category.enum';

export interface ProductMaster {
  id: string;
  name: string;
  brand?: string | null;
  category: ProductCategory;
  defaultImage?: string | null;
  description?: string | null;
  aliases: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSearchResult extends ProductMaster {
  shopCount?: number;
}
