export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  ADMIN = 'admin',
  SHOP_OWNER = 'shop_owner',
  FARMER = 'farmer',
}

export enum ProductCategory {
  SEEDS = 'SEEDS',
  FERTILIZERS = 'FERTILIZERS',
  PESTICIDES = 'PESTICIDES',
  HERBICIDES = 'HERBICIDES',
  FUNGICIDES = 'FUNGICIDES',
  MICRONUTRIENTS = 'MICRONUTRIENTS',
  ORGANIC_INPUTS = 'ORGANIC_INPUTS',
  IRRIGATION_EQUIPMENT = 'IRRIGATION_EQUIPMENT',
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.SEEDS]: 'Seeds',
  [ProductCategory.FERTILIZERS]: 'Fertilizers',
  [ProductCategory.PESTICIDES]: 'Pesticides',
  [ProductCategory.HERBICIDES]: 'Herbicides',
  [ProductCategory.FUNGICIDES]: 'Fungicides',
  [ProductCategory.MICRONUTRIENTS]: 'Micronutrients',
  [ProductCategory.ORGANIC_INPUTS]: 'Organic Inputs',
  [ProductCategory.IRRIGATION_EQUIPMENT]: 'Irrigation Equipment',
};
