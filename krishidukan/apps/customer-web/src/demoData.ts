// Hard-coded demo catalog so the storefront works without a backend.

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryLabel: string;
  description: string;
  emoji: string;
  imageColor: string;
  popularity: number; // for sorting on landing page
}

export interface Shop {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  state: string;
  pincode: string;
  addressLine: string;
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  totalRatings: number;
  openHours: string;
}

export interface ShopProduct {
  shopId: string;
  productId: string;
  price: number;
  mrp: number;
  inStock: boolean;
  quantity: number;
}

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Mahyco MRC 6918 Cotton Seeds', brand: 'Mahyco', category: 'seeds', categoryLabel: 'Seeds', description: '450g pack · Bt cotton hybrid · ~150 day duration', emoji: '🌱', imageColor: '#16a34a', popularity: 98 },
  { id: 'p2', name: 'Pioneer 30V92 Maize Hybrid', brand: 'Pioneer', category: 'seeds', categoryLabel: 'Seeds', description: '4kg pack · Single-cross hybrid · ~110 day duration', emoji: '🌽', imageColor: '#eab308', popularity: 84 },
  { id: 'p3', name: 'Kaveri ATM Bt Cotton Seeds', brand: 'Kaveri', category: 'seeds', categoryLabel: 'Seeds', description: '450g · Bollworm-resistant Bt hybrid', emoji: '🌱', imageColor: '#16a34a', popularity: 71 },
  { id: 'p4', name: 'IFFCO Sagarika Liquid Fertilizer 1L', brand: 'IFFCO', category: 'fertilizers', categoryLabel: 'Fertilizers', description: 'Seaweed-based bio-stimulant · Foliar spray', emoji: '🧪', imageColor: '#0ea5e9', popularity: 92 },
  { id: 'p5', name: 'Coromandel Gromor 28-28-0 50kg', brand: 'Coromandel', category: 'fertilizers', categoryLabel: 'Fertilizers', description: 'Complex NP fertilizer · Pre-sowing', emoji: '🟫', imageColor: '#92400e', popularity: 88 },
  { id: 'p6', name: 'IFFCO Urea 45kg', brand: 'IFFCO', category: 'fertilizers', categoryLabel: 'Fertilizers', description: '46% Nitrogen · Granular · Top dressing', emoji: '⚪', imageColor: '#64748b', popularity: 95 },
  { id: 'p7', name: 'Bayer Confidor 250ml', brand: 'Bayer', category: 'pesticides', categoryLabel: 'Pesticides', description: 'Imidacloprid 17.8% SL · Sucking pest control', emoji: '💊', imageColor: '#dc2626', popularity: 89 },
  { id: 'p8', name: 'Syngenta Karate 100ml', brand: 'Syngenta', category: 'pesticides', categoryLabel: 'Pesticides', description: 'Lambda-cyhalothrin 5% EC · Broad spectrum', emoji: '💊', imageColor: '#dc2626', popularity: 76 },
  { id: 'p9', name: 'UPL Sweep Power Glyphosate 1L', brand: 'UPL', category: 'herbicides', categoryLabel: 'Herbicides', description: 'Glyphosate 41% SL · Non-selective weed killer', emoji: '🌿', imageColor: '#854d0e', popularity: 81 },
  { id: 'p10', name: 'Bayer Roundup 500ml', brand: 'Bayer', category: 'herbicides', categoryLabel: 'Herbicides', description: 'Glyphosate 41% SL · Non-selective', emoji: '🌿', imageColor: '#854d0e', popularity: 68 },
  { id: 'p11', name: 'Indofil M-45 Mancozeb 500g', brand: 'Indofil', category: 'fungicides', categoryLabel: 'Fungicides', description: 'Mancozeb 75% WP · Contact fungicide', emoji: '🍃', imageColor: '#15803d', popularity: 79 },
  { id: 'p12', name: 'Syngenta Amistar Top 250ml', brand: 'Syngenta', category: 'fungicides', categoryLabel: 'Fungicides', description: 'Azoxystrobin + Difenoconazole · Systemic', emoji: '🍃', imageColor: '#15803d', popularity: 73 },
  { id: 'p13', name: 'Multiplex Zinc Sulphate 21% 5kg', brand: 'Multiplex', category: 'micronutrients', categoryLabel: 'Micronutrients', description: 'Zinc deficiency correction · Soil application', emoji: '⚗️', imageColor: '#7c3aed', popularity: 64 },
  { id: 'p14', name: 'T-Stanes Bio-Compost 50kg', brand: 'T-Stanes', category: 'organic_inputs', categoryLabel: 'Organic Inputs', description: 'Organic manure · Soil enricher', emoji: '🟤', imageColor: '#854d0e', popularity: 58 },
  { id: 'p15', name: 'Jain Drip Pipe 16mm × 100m', brand: 'Jain Irrigation', category: 'irrigation_equipment', categoryLabel: 'Irrigation', description: 'Inline drip lateral · 30cm spacing', emoji: '🚿', imageColor: '#0284c7', popularity: 61 },
];

export const CATEGORIES = [
  { id: 'seeds', label: 'Seeds', emoji: '🌱', color: '#16a34a' },
  { id: 'fertilizers', label: 'Fertilizers', emoji: '🧪', color: '#0ea5e9' },
  { id: 'pesticides', label: 'Pesticides', emoji: '💊', color: '#dc2626' },
  { id: 'herbicides', label: 'Herbicides', emoji: '🌿', color: '#854d0e' },
  { id: 'fungicides', label: 'Fungicides', emoji: '🍃', color: '#15803d' },
  { id: 'micronutrients', label: 'Micronutrients', emoji: '⚗️', color: '#7c3aed' },
  { id: 'organic_inputs', label: 'Organic', emoji: '🟤', color: '#92400e' },
  { id: 'irrigation_equipment', label: 'Irrigation', emoji: '🚿', color: '#0284c7' },
];

// Centered around Pune/Maharashtra
export const SHOPS: Shop[] = [
  { id: 's1', businessName: 'Krishi Mitra Agro Centre', ownerName: 'Ramesh Patil', city: 'Nashik', state: 'Maharashtra', pincode: '422001', addressLine: 'Plot 14, Market Road', phone: '+919876543210', lat: 19.9975, lng: 73.7898, rating: 4.6, totalRatings: 142, openHours: 'Mon–Sat: 8 AM – 8 PM, Sun: 9 AM – 2 PM' },
  { id: 's2', businessName: 'Bhumi Krishi Seva Kendra', ownerName: 'Sunita Deshmukh', city: 'Baramati', state: 'Maharashtra', pincode: '413102', addressLine: 'Gat No. 142, Pune-Solapur Highway', phone: '+919823456789', lat: 18.1514, lng: 74.5778, rating: 4.4, totalRatings: 87, openHours: 'Mon–Sun: 7 AM – 9 PM' },
  { id: 's3', businessName: 'Annapurna Agri Inputs', ownerName: 'Vijay Sawant', city: 'Karad', state: 'Maharashtra', pincode: '415110', addressLine: 'Main Bazar, Tal. Karad', phone: '+919812345678', lat: 17.2877, lng: 74.1827, rating: 4.7, totalRatings: 218, openHours: 'Mon–Sat: 7:30 AM – 7:30 PM' },
  { id: 's4', businessName: 'Shivaji Agro Mart', ownerName: 'Ganesh Kulkarni', city: 'Sangli', state: 'Maharashtra', pincode: '416416', addressLine: 'Near Bus Stand', phone: '+919887766554', lat: 16.8524, lng: 74.5815, rating: 4.5, totalRatings: 96, openHours: 'Mon–Sat: 8 AM – 8 PM' },
  { id: 's5', businessName: 'Maharashtra Krishi Bhandar', ownerName: 'Mahesh Jadhav', city: 'Kolhapur', state: 'Maharashtra', pincode: '416001', addressLine: 'Old Market Yard', phone: '+919776655443', lat: 16.7050, lng: 74.2433, rating: 4.3, totalRatings: 64, openHours: 'Mon–Sun: 8 AM – 7 PM' },
  { id: 's6', businessName: 'Pune Farm Store', ownerName: 'Anil Bhosale', city: 'Pune', state: 'Maharashtra', pincode: '411028', addressLine: 'Hadapsar Industrial Area', phone: '+919665544332', lat: 18.5089, lng: 73.9260, rating: 4.8, totalRatings: 312, openHours: 'Mon–Sat: 7 AM – 9 PM, Sun: 8 AM – 1 PM' },
  { id: 's7', businessName: 'Sahyadri Agri Supplies', ownerName: 'Pradeep Kale', city: 'Satara', state: 'Maharashtra', pincode: '415001', addressLine: 'Powai Naka', phone: '+919554433221', lat: 17.6805, lng: 73.9933, rating: 4.4, totalRatings: 71, openHours: 'Mon–Sat: 8 AM – 7 PM' },
];

// Each shop carries a subset of products at slightly different prices
export const SHOP_INVENTORY: ShopProduct[] = (() => {
  const out: ShopProduct[] = [];
  SHOPS.forEach((shop, sIdx) => {
    PRODUCTS.forEach((product, pIdx) => {
      // Shops carry ~60-80% of catalog
      if ((sIdx + pIdx) % 5 === 0) return;
      const mrp = 100 + (pIdx * 47) % 800;
      const discount = (5 + (sIdx * 3) % 12) / 100;
      const price = Math.round(mrp * (1 - discount));
      const inStock = (sIdx + pIdx) % 7 !== 0;
      out.push({
        shopId: shop.id,
        productId: product.id,
        price,
        mrp,
        inStock,
        quantity: inStock ? 5 + (sIdx * pIdx) % 50 : 0,
      });
    });
  });
  return out;
})();

// Haversine distance — meters
export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Default location (Pune) when user denies/skips GPS
export const DEFAULT_LOCATION = { lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' };

export interface SearchResult {
  shop: Shop;
  inventory: ShopProduct;
  distanceM: number;
}

export function searchShopsForProduct(
  productId: string,
  userLat: number,
  userLng: number,
  radiusKm = 100,
): SearchResult[] {
  const radiusM = radiusKm * 1000;
  const results: SearchResult[] = [];
  SHOPS.forEach((shop) => {
    const inv = SHOP_INVENTORY.find((i) => i.shopId === shop.id && i.productId === productId);
    if (!inv) return;
    const d = distanceM(userLat, userLng, shop.lat, shop.lng);
    if (d > radiusM) return;
    results.push({ shop, inventory: inv, distanceM: d });
  });
  results.sort((a, b) => {
    if (a.inventory.inStock !== b.inventory.inStock) return a.inventory.inStock ? -1 : 1;
    return a.distanceM - b.distanceM;
  });
  return results;
}

export function searchProducts(query: string, category?: string): Product[] {
  const q = query.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    if (category && p.category !== category) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
    );
  });
}

export function getShopProducts(shopId: string): { product: Product; inventory: ShopProduct }[] {
  return SHOP_INVENTORY.filter((i) => i.shopId === shopId)
    .map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.productId);
      return product ? { product, inventory: i } : null;
    })
    .filter((x): x is { product: Product; inventory: ShopProduct } => x !== null);
}
