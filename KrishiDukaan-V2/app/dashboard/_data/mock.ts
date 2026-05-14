export type StatMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
};

export type ReviewItem = {
  id: string;
  author: string;
  rating: number;
  excerpt: string;
  date: string;
  product: string;
};

export type InventoryProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderAt: number;
  unit: string;
  price: string;
};

export type TimeSeriesPoint = { label: string; value: number };

export const dashboardStats: StatMetric[] = [
  { id: "views", label: "Total Views", value: "12,480", change: "+8.2%", trend: "up" },
  { id: "calls", label: "Calls Received", value: "342", change: "+3.1%", trend: "up" },
  { id: "directions", label: "Directions", value: "1,905", change: "-1.4%", trend: "down" },
  { id: "products", label: "Products Listed", value: "86", change: "+2", trend: "up" },
];

export const inventoryHealthSummary = {
  inStock: 72,
  lowStock: 11,
  outOfStock: 3,
  score: 84,
  label: "Healthy",
};

export const recentReviews: ReviewItem[] = [
  {
    id: "r1",
    author: "Priya S.",
    rating: 5,
    excerpt: "Fresh stock and fair prices. Will visit again.",
    date: "2026-05-10",
    product: "Organic Wheat Seeds",
  },
  {
    id: "r2",
    author: "Ramesh K.",
    rating: 4,
    excerpt: "Good variety; wish delivery was faster.",
    date: "2026-05-08",
    product: "NPK Fertilizer 19:19:19",
  },
  {
    id: "r3",
    author: "Anita M.",
    rating: 5,
    excerpt: "Helpful staff and clear labeling on packs.",
    date: "2026-05-06",
    product: "Bio Pesticide — Neem",
  },
];

export const viewsOverTime: TimeSeriesPoint[] = [
  { label: "Mon", value: 420 },
  { label: "Tue", value: 510 },
  { label: "Wed", value: 480 },
  { label: "Thu", value: 620 },
  { label: "Fri", value: 590 },
  { label: "Sat", value: 710 },
  { label: "Sun", value: 660 },
];

export const callsOverTime: TimeSeriesPoint[] = [
  { label: "Mon", value: 38 },
  { label: "Tue", value: 44 },
  { label: "Wed", value: 41 },
  { label: "Thu", value: 52 },
  { label: "Fri", value: 49 },
  { label: "Sat", value: 58 },
  { label: "Sun", value: 54 },
];

export const directionRequests: TimeSeriesPoint[] = [
  { label: "Mon", value: 210 },
  { label: "Tue", value: 245 },
  { label: "Wed", value: 198 },
  { label: "Thu", value: 276 },
  { label: "Fri", value: 260 },
  { label: "Sat", value: 302 },
  { label: "Sun", value: 288 },
];

export const searchAppearance = {
  impressions: "48.2k",
  ctr: "4.6%",
  avgPosition: "2.1",
};

export const insightCards = [
  {
    id: "i1",
    title: "Peak traffic",
    body: "Weekend shoppers drive 34% more profile views than weekdays.",
  },
  {
    id: "i2",
    title: "Call conversion",
    body: "Shops that respond within 2 hours see 18% higher repeat visits.",
  },
  {
    id: "i3",
    title: "Directions",
    body: "Direction requests spike after 4 PM — consider extending hours messaging.",
  },
];

export const inventoryProducts: InventoryProduct[] = [
  {
    id: "p1",
    name: "Hybrid Tomato Seeds (F1)",
    sku: "SKU-TOM-01",
    category: "Seeds",
    stock: 240,
    reorderAt: 80,
    unit: "pkt",
    price: "₹120",
  },
  {
    id: "p2",
    name: "Urea 46% N",
    sku: "SKU-FER-U46",
    category: "Fertilizer",
    stock: 45,
    reorderAt: 60,
    unit: "bag",
    price: "₹320",
  },
  {
    id: "p3",
    name: "Drip Irrigation Kit — 1 Acre",
    sku: "SKU-IRR-1A",
    category: "Equipment",
    stock: 8,
    reorderAt: 10,
    unit: "kit",
    price: "₹18,500",
  },
  {
    id: "p4",
    name: "Cotton Bollworm Spray",
    sku: "SKU-PEST-CB",
    category: "Crop care",
    stock: 0,
    reorderAt: 24,
    unit: "L",
    price: "₹890",
  },
  {
    id: "p5",
    name: "Organic Compost — 50kg",
    sku: "SKU-SOIL-OC50",
    category: "Soil",
    stock: 62,
    reorderAt: 40,
    unit: "bag",
    price: "₹650",
  },
];

export const shopProfileMock = {
  shopName: "Krishi Saathi Agro Center",
  tagline: "Trusted inputs for progressive farmers",
  owner: "Vikram Patil",
  phone: "+91 98765 43210",
  email: "contact@krishisaathi.example",
  whatsapp: "+91 98765 43210",
  addressLine1: "Plot 12, Market Yard Road",
  addressLine2: "Near APMC Gate 2",
  city: "Pune",
  state: "Maharashtra",
  pin: "411045",
  gstin: "27AAAAA0000A1Z5",
  hours: "Mon–Sat: 9:00–19:00 · Sun: 10:00–14:00",
  deliveryRadiusKm: "25",
  codEnabled: true,
  onlinePayments: true,
};
