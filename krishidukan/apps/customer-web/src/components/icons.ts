// Central Lucide icon mapping. Replaces emoji avatars across the UI without
// touching demoData (the emoji fields remain for back-compat).
import {
  Star, ShieldCheck, Rocket, Leaf, Sprout, Store, Wheat,
  type LucideIcon,
} from 'lucide-react';

export const PRODUCT_ICONS: Record<string, LucideIcon> = {
  'kapl-gold': Star,
  'kapl-shield': ShieldCheck,
  'kapl-boost': Rocket,
  'kapl-rootmax': Leaf,
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fertilizers: Sprout,
  fungicides: ShieldCheck,
  organic_inputs: Leaf,
};

export function productIcon(id: string): LucideIcon {
  return PRODUCT_ICONS[id] ?? Sprout;
}

export function categoryIcon(id: string): LucideIcon {
  return CATEGORY_ICONS[id] ?? Sprout;
}

export const ShopIcon = Store;
export const BrandMarkIcon = Sprout;
export const FarmerIcon = Wheat;
