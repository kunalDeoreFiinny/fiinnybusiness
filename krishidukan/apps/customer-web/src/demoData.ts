// ---------------------------------------------------------------------------
// Demo data — no backend needed. KaranArjun PowerPlus as the primary brand.
// Architecture: Brands → Products → Retailers → RetailerStock
// This multi-brand structure means other companies can pay to list products later.
// ---------------------------------------------------------------------------
import { distanceM } from './utils/distance';

// ── Brands ──────────────────────────────────────────────────────────────────
export interface Brand {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  isPrimary: boolean; // true = our own brand (KaranArjun)
}

export const BRANDS: Brand[] = [
  {
    id: 'kapl',
    name: 'KaranArjun PowerPlus',
    tagline: 'Supercharge Your Crops',
    emoji: '⚡',
    color: '#16a34a',
    isPrimary: true,
  },
  // Future paid partner brands go here
];

// ── Products ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  brandId: string;
  name: string;
  shortName: string;
  category: string;
  categoryLabel: string;
  description: string;
  benefits: string[];
  packSizes: string[];
  emoji: string;
  imageColor: string;
  popularity: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 'kapl-gold',
    brandId: 'kapl',
    name: 'KaranArjun PowerPlus Gold',
    shortName: 'PowerPlus Gold',
    category: 'fertilizers',
    categoryLabel: 'Premium Fertilizer',
    description: 'High-potency NPK complex with micronutrients for maximum yield. Suitable for all crops.',
    benefits: ['Boosts yield by up to 30%', 'Improves root strength', 'Works on all soil types'],
    packSizes: ['500g', '1kg', '5kg', '25kg'],
    emoji: '🌟',
    imageColor: '#f59e0b',
    popularity: 98,
  },
  {
    id: 'kapl-shield',
    brandId: 'kapl',
    name: 'KaranArjun PowerPlus Shield',
    shortName: 'PowerPlus Shield',
    category: 'fungicides',
    categoryLabel: 'Fungicide + Bactericide',
    description: 'Broad-spectrum protectant against fungal and bacterial diseases. Fast-acting systemic formula.',
    benefits: ['Protects against 20+ diseases', 'Systemic + contact action', 'Rain-fast in 2 hours'],
    packSizes: ['100ml', '250ml', '500ml', '1L'],
    emoji: '🛡️',
    imageColor: '#0ea5e9',
    popularity: 89,
  },
  {
    id: 'kapl-boost',
    brandId: 'kapl',
    name: 'KaranArjun PowerPlus Boost',
    shortName: 'PowerPlus Boost',
    category: 'organic_inputs',
    categoryLabel: 'Bio-Stimulant',
    description: 'Seaweed + amino acid blend for rapid growth, flowering, and fruiting. 100% organic.',
    benefits: ['Stimulates flowering', 'Improves fruit quality', 'Certified organic'],
    packSizes: ['250ml', '500ml', '1L'],
    emoji: '🚀',
    imageColor: '#8b5cf6',
    popularity: 84,
  },
  {
    id: 'kapl-rootmax',
    brandId: 'kapl',
    name: 'KaranArjun PowerPlus RootMax',
    shortName: 'PowerPlus RootMax',
    category: 'organic_inputs',
    categoryLabel: 'Root Developer',
    description: 'Mycorrhizal fungi + phosphate solubilizers for explosive root growth. Use at transplant stage.',
    benefits: ['5× root mass increase', 'Drought resistance', 'Reduces transplant shock'],
    packSizes: ['250g', '1kg', '5kg'],
    emoji: '🌿',
    imageColor: '#16a34a',
    popularity: 76,
  },
];

export const CATEGORIES = [
  { id: 'fertilizers', label: 'Fertilizers', emoji: '🌟', color: '#f59e0b' },
  { id: 'fungicides', label: 'Fungicide', emoji: '🛡️', color: '#0ea5e9' },
  { id: 'organic_inputs', label: 'Organic', emoji: '🌿', color: '#16a34a' },
];

// ── Retailers ────────────────────────────────────────────────────────────────
// These are the shops that stock KaranArjun PowerPlus products.
// Your team manages this list from the admin panel.
export interface Retailer {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  rating: number;
  totalRatings: number;
  openHours: string;
  whatsapp?: string;
}

export const RETAILERS: Retailer[] = [
  {
    id: 'r1',
    businessName: 'Krishi Mitra Agro Centre',
    ownerName: 'Ramesh Patil',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    addressLine: 'Plot 14, Market Road, Nashik Road',
    city: 'Nashik',
    state: 'Maharashtra',
    pincode: '422001',
    lat: 19.9975,
    lng: 73.7898,
    rating: 4.6,
    totalRatings: 142,
    openHours: 'Mon–Sat: 8 AM – 8 PM',
  },
  {
    id: 'r2',
    businessName: 'Bhumi Krishi Seva Kendra',
    ownerName: 'Sunita Deshmukh',
    phone: '+919823456789',
    addressLine: 'Gat No. 142, Pune-Solapur Highway',
    city: 'Baramati',
    state: 'Maharashtra',
    pincode: '413102',
    lat: 18.1514,
    lng: 74.5778,
    rating: 4.4,
    totalRatings: 87,
    openHours: 'Mon–Sun: 7 AM – 9 PM',
  },
  {
    id: 'r3',
    businessName: 'Annapurna Agri Inputs',
    ownerName: 'Vijay Sawant',
    phone: '+919812345678',
    addressLine: 'Main Bazar, Tal. Karad',
    city: 'Karad',
    state: 'Maharashtra',
    pincode: '415110',
    lat: 17.2877,
    lng: 74.1827,
    rating: 4.7,
    totalRatings: 218,
    openHours: 'Mon–Sat: 7:30 AM – 7:30 PM',
  },
  {
    id: 'r4',
    businessName: 'Shivaji Agro Mart',
    ownerName: 'Ganesh Kulkarni',
    phone: '+919887766554',
    addressLine: 'Near Bus Stand, Main Market',
    city: 'Sangli',
    state: 'Maharashtra',
    pincode: '416416',
    lat: 16.8524,
    lng: 74.5815,
    rating: 4.5,
    totalRatings: 96,
    openHours: 'Mon–Sat: 8 AM – 8 PM',
  },
  {
    id: 'r5',
    businessName: 'Maharashtra Krishi Bhandar',
    ownerName: 'Mahesh Jadhav',
    phone: '+919776655443',
    addressLine: 'Old Market Yard',
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
    lat: 16.7050,
    lng: 74.2433,
    rating: 4.3,
    totalRatings: 64,
    openHours: 'Mon–Sun: 8 AM – 7 PM',
  },
  {
    id: 'r6',
    businessName: 'Pune Farm Store',
    ownerName: 'Anil Bhosale',
    phone: '+919665544332',
    whatsapp: '+919665544332',
    addressLine: 'Hadapsar Industrial Area, Near Magarpatta',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411028',
    lat: 18.5089,
    lng: 73.9260,
    rating: 4.8,
    totalRatings: 312,
    openHours: 'Mon–Sat: 7 AM – 9 PM, Sun: 8 AM – 1 PM',
  },
  {
    id: 'r7',
    businessName: 'Sahyadri Agri Supplies',
    ownerName: 'Pradeep Kale',
    phone: '+919554433221',
    addressLine: 'Powai Naka, Station Road',
    city: 'Satara',
    state: 'Maharashtra',
    pincode: '415001',
    lat: 17.6805,
    lng: 73.9933,
    rating: 4.4,
    totalRatings: 71,
    openHours: 'Mon–Sat: 8 AM – 7 PM',
  },
  // ── Demo pair: nearby vs far, same product (kapl-gold) ───────────────────
  // r8 is ~0.5 km from the default Pune centre (lat 18.5204, lng 73.8567).
  {
    id: 'r8',
    businessName: 'Shivneri Krishi Kendra (Nearby)',
    ownerName: 'Suresh Mane',
    phone: '+919011223344',
    whatsapp: '+919011223344',
    addressLine: 'Shop 3, Shivaji Market, Deccan Gymkhana',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004',
    lat: 18.5230,
    lng: 73.8610,
    rating: 4.5,
    totalRatings: 58,
    openHours: 'Mon–Sat: 8 AM – 8 PM',
  },
  // r9 is ~250 km away in Aurangabad — the "far" retailer.
  {
    id: 'r9',
    businessName: 'Marathwada Agri Depot (Far)',
    ownerName: 'Kishor Pawar',
    phone: '+919922334455',
    addressLine: 'Kranti Chowk, Station Road',
    city: 'Aurangabad',
    state: 'Maharashtra',
    pincode: '431001',
    lat: 19.8762,
    lng: 75.3433,
    rating: 4.2,
    totalRatings: 33,
    openHours: 'Mon–Sat: 9 AM – 7 PM',
  },
];

// ── Retailer Stock ────────────────────────────────────────────────────────────
// Maps which retailers stock which products (and at what price)
export interface RetailerStock {
  retailerId: string;
  productId: string;
  price: number;
  mrp: number;
  inStock: boolean;
  quantity: number;
}

export const RETAILER_STOCK: RetailerStock[] = (() => {
  const MRP_TABLE = [180, 320, 450, 650, 980, 1200];
  const rows: RetailerStock[] = [];
  // Auto-generate stock for r1–r7
  RETAILERS.filter((r) => !['r8', 'r9'].includes(r.id)).forEach((r, ri) => {
    PRODUCTS.forEach((p, pi) => {
      if ((ri + pi) % 5 === 0) return; // ~80% coverage
      const mrp = MRP_TABLE[pi % MRP_TABLE.length] ?? 500;
      const disc = (5 + (ri * 3) % 10) / 100;
      const price = Math.round(mrp * (1 - disc));
      const inStock = (ri + pi) % 7 !== 0;
      rows.push({
        retailerId: r.id,
        productId: p.id,
        price,
        mrp,
        inStock,
        quantity: inStock ? 10 + (ri * pi) % 80 : 0,
      });
    });
  });

  // Explicit demo pair — same product (kapl-gold), nearby vs far
  rows.push(
    { retailerId: 'r8', productId: 'kapl-gold', price: 171, mrp: 180, inStock: true, quantity: 45 },
    { retailerId: 'r8', productId: 'kapl-shield', price: 304, mrp: 320, inStock: true, quantity: 20 },
    { retailerId: 'r8', productId: 'kapl-boost', price: 427, mrp: 450, inStock: false, quantity: 0 },
    { retailerId: 'r9', productId: 'kapl-gold', price: 162, mrp: 180, inStock: true, quantity: 12 },
    { retailerId: 'r9', productId: 'kapl-rootmax', price: 617, mrp: 650, inStock: true, quantity: 8 },
  );

  return rows;
})();

// ── Helpers ──────────────────────────────────────────────────────────────────
// Re-export from utils/distance so all existing importers continue to work.
export { distanceM, formatDistance } from './utils/distance';

export const DEFAULT_LOCATION = { lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' };

export interface StockResult {
  retailer: Retailer;
  stock: RetailerStock;
  distanceM: number;
}

export function getRetailersForProduct(
  productId: string,
  userLat: number,
  userLng: number,
  radiusKm = 500,
): StockResult[] {
  const radiusM = radiusKm * 1000;
  const results: StockResult[] = [];
  RETAILERS.forEach((r) => {
    const stock = RETAILER_STOCK.find((s) => s.retailerId === r.id && s.productId === productId);
    if (!stock) return;
    const d = distanceM(userLat, userLng, r.lat, r.lng);
    if (d > radiusM) return;
    results.push({ retailer: r, stock, distanceM: d });
  });
  results.sort((a, b) => {
    if (a.stock.inStock !== b.stock.inStock) return a.stock.inStock ? -1 : 1;
    return a.distanceM - b.distanceM;
  });
  return results;
}

export function getRetailerProducts(retailerId: string) {
  return RETAILER_STOCK.filter((s) => s.retailerId === retailerId)
    .map((s) => {
      const product = PRODUCTS.find((p) => p.id === s.productId);
      return product ? { product, stock: s } : null;
    })
    .filter((x): x is { product: Product; stock: RetailerStock } => x !== null);
}

export function searchProducts(query: string, category?: string): Product[] {
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    if (category && p.category !== category) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q);
  });
}

// Keep SHOPS alias for any legacy references
export const SHOPS = RETAILERS;
export const SHOP_INVENTORY = RETAILER_STOCK.map((s) => ({
  shopId: s.retailerId,
  productId: s.productId,
  price: s.price,
  mrp: s.mrp,
  inStock: s.inStock,
  quantity: s.quantity,
}));
export type Shop = Retailer;
