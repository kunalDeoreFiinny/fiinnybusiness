import { ProductCategory } from '../enums/product-category.enum';

export interface CreateProductDto {
  name: string;
  brand?: string;
  category: ProductCategory;
  defaultImage?: string;
  description?: string;
  aliases?: string[];
}

export interface UpdateProductDto {
  name?: string;
  brand?: string;
  category?: ProductCategory;
  defaultImage?: string;
  description?: string;
  aliases?: string[];
  isActive?: boolean;
}

export interface ProductFilterDto {
  category?: ProductCategory;
  search?: string;
  page?: number;
  limit?: number;
}
