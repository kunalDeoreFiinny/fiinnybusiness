// Demo mode kicks in when VITE_FIREBASE_API_KEY is missing.
// Lets every screen render with mock data — no backend, no Firebase needed.

import { ShopStatus, UserRole, ProductCategory } from '@krishidukan/shared';

export const IS_DEMO = !import.meta.env['VITE_FIREBASE_API_KEY'];

export const DEMO_USER = {
  uid: 'demo-shop-owner-uid',
  phoneNumber: '+919876543210',
  email: null,
  displayName: 'Ramesh Patil',
  getIdToken: async () => 'demo-id-token',
};

export const DEMO_SHOP = {
  id: 'shop-demo-1',
  businessName: 'Krishi Mitra Agro Centre',
  status: ShopStatus.ACTIVE,
};

export const DEMO_ROLE = UserRole.SHOP_OWNER;

export const DEMO_SHOP_STATS = {
  totalViews: 1284,
  totalCalls: 87,
  totalDirections: 142,
  viewsLast7Days: 213,
  callsLast7Days: 18,
  directionsLast7Days: 24,
};

export const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Mahyco MRC 6918 Cotton Seeds', brand: 'Mahyco', category: ProductCategory.SEEDS },
  { id: 'p2', name: 'Pioneer 30V92 Maize Hybrid Seeds', brand: 'Pioneer', category: ProductCategory.SEEDS },
  { id: 'p3', name: 'Kaveri ATM Bt Cotton Seeds', brand: 'Kaveri', category: ProductCategory.SEEDS },
  { id: 'p4', name: 'IFFCO Sagarika Liquid Fertilizer 1L', brand: 'IFFCO', category: ProductCategory.FERTILIZERS },
  { id: 'p5', name: 'Coromandel Gromor 28-28-0 Fertilizer 50kg', brand: 'Coromandel', category: ProductCategory.FERTILIZERS },
  { id: 'p6', name: 'IFFCO Urea 45kg', brand: 'IFFCO', category: ProductCategory.FERTILIZERS },
  { id: 'p7', name: 'Bayer Confidor Insecticide 250ml', brand: 'Bayer', category: ProductCategory.PESTICIDES },
  { id: 'p8', name: 'Syngenta Karate Insecticide 100ml', brand: 'Syngenta', category: ProductCategory.PESTICIDES },
  { id: 'p9', name: 'UPL Sweep Power Glyphosate 1L', brand: 'UPL', category: ProductCategory.HERBICIDES },
  { id: 'p10', name: 'Bayer Roundup Glyphosate 500ml', brand: 'Bayer', category: ProductCategory.HERBICIDES },
  { id: 'p11', name: 'Indofil M-45 Mancozeb 500g', brand: 'Indofil', category: ProductCategory.FUNGICIDES },
  { id: 'p12', name: 'Syngenta Amistar Top Fungicide 250ml', brand: 'Syngenta', category: ProductCategory.FUNGICIDES },
  { id: 'p13', name: 'Multiplex Zinc Sulphate 21% 5kg', brand: 'Multiplex', category: ProductCategory.MICRONUTRIENTS },
  { id: 'p14', name: 'T-Stanes Bio-Compost Organic Manure 50kg', brand: 'T-Stanes', category: ProductCategory.ORGANIC_INPUTS },
  { id: 'p15', name: 'Jain Drip Irrigation Pipe 100m', brand: 'Jain Irrigation', category: ProductCategory.IRRIGATION_EQUIPMENT },
];

export const DEMO_INVENTORY = [
  { id: 'inv1', productId: 'p1', price: 850, mrp: 950, quantity: 24, inStock: true, product: DEMO_PRODUCTS[0] },
  { id: 'inv2', productId: 'p4', price: 285, mrp: 320, quantity: 47, inStock: true, product: DEMO_PRODUCTS[3] },
  { id: 'inv3', productId: 'p7', price: 412, mrp: 450, quantity: 12, inStock: true, product: DEMO_PRODUCTS[6] },
  { id: 'inv4', productId: 'p11', price: 178, mrp: 200, quantity: 0, inStock: false, product: DEMO_PRODUCTS[10] },
  { id: 'inv5', productId: 'p9', price: 540, mrp: 580, quantity: 8, inStock: true, product: DEMO_PRODUCTS[8] },
];
