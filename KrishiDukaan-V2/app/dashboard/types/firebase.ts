import { Timestamp } from 'firebase/firestore';

// ─── User Document (/users/{uid}) ───────────────────────────────────────────
export type UserRole = 'admin' | 'retailer';

export interface UserDoc {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  retailerId: string | null;
  createdAt: Timestamp;
}

// ─── Retailer Document (/retailers/{retailerId}) ────────────────────────────
export interface RetailerLocation {
  lat: number;
  lng: number;
}

export interface BusinessTimings {
  open: string;   // "09:00"
  close: string;  // "20:00"
  holidays: string[]; // ["Sunday"]
}

export interface DeliverySettings {
  enabled: boolean;
  radiusKm: number;
  minOrderAmount: number;
  chargePerKm: number;
}

export interface RetailerDoc {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  location: RetailerLocation;
  approved: boolean;
  createdAt: Timestamp;
  // Extended profile fields
  whatsappNumber?: string;
  gstNumber?: string;
  bannerUrl?: string;
  logoUrl?: string;
  description?: string;
  timings?: BusinessTimings;
  delivery?: DeliverySettings;
  categories?: string[];
  profileCompleteness?: number;
}

// ─── Product Document (/products/{productId}) ───────────────────────────────
export interface ProductDoc {
  name: string;
  brand: string;
  category: string;
}

// ─── Inventory Document (/inventory/{inventoryId}) ──────────────────────────
export interface InventoryDoc {
  retailerId: string;
  productId: string;
  stock: number;
  price: number;
  mrp: number;
  updatedAt: Timestamp;
  // Enhanced fields
  featured?: boolean;
  visible?: boolean;
  lowStockThreshold?: number;
  expiryDate?: Timestamp | null;
}

// ─── Notification Document (/notifications/{notifId}) ───────────────────────
export type NotificationType = 'low_stock' | 'inquiry' | 'review' | 'system' | 'profile';

export interface NotificationDoc {
  userId: string;
  retailerId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  actionUrl?: string;
}

// ─── Review Document (/reviews/{reviewId}) ──────────────────────────────────
export interface ReviewDoc {
  retailerId: string;
  farmerName: string;
  farmerPhone: string;
  rating: number; // 1-5
  text: string;
  verified: boolean;
  createdAt: Timestamp;
}

// ─── Analytics Document (/analytics/{retailerId}/daily/{date}) ──────────────
export interface AnalyticsDoc {
  retailerId: string;
  date: string; // "2026-05-09"
  views: number;
  calls: number;
  directions: number;
  searches: number;
  inquiries: number;
}

// ─── Collection name constants ──────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  RETAILERS: 'retailers',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews',
  ANALYTICS: 'analytics',
} as const;
