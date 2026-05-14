// Cart, Wishlist, and Saved-Addresses persistence. Per-user data keyed on the user phone.
// All mutating actions are routed through useAuth().requireLogin in components.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: string;
  retailerId: string;
  qty: number;
  addedAt: number;
}

export interface SavedAddress {
  id: string;
  label: string;       // e.g. "Home", "Farm"
  fullName: string;
  phone: string;
  addressLine: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
}

interface CartState {
  cart: CartItem[];
  wishlist: string[]; // productId[]
  addresses: SavedAddress[];
  addToCart: (productId: string, retailerId: string, qty?: number) => void;
  removeFromCart: (productId: string, retailerId: string) => void;
  toggleWishlist: (productId: string) => boolean; // returns new state (true = saved)
  isWishlisted: (productId: string) => boolean;
  saveAddress: (addr: Omit<SavedAddress, 'id'>) => SavedAddress;
  removeAddress: (id: string) => void;
  cartCount: number;
}

const Ctx = createContext<CartState | null>(null);

function userKey(phone: string | null | undefined): string {
  return `kd_user:${phone ?? 'guest'}`;
}

interface PersistShape {
  cart: CartItem[];
  wishlist: string[];
  addresses: SavedAddress[];
}

function load(phone: string | null | undefined): PersistShape {
  try {
    const raw = localStorage.getItem(userKey(phone));
    if (raw) return JSON.parse(raw) as PersistShape;
  } catch { /* ignore */ }
  return { cart: [], wishlist: [], addresses: [] };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<PersistShape>(() => load(user?.phone));

  // When auth user changes, swap to that user's storage namespace.
  useEffect(() => {
    setState(load(user?.phone));
  }, [user?.phone]);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(userKey(user?.phone), JSON.stringify(state));
    } catch { /* quota — ignore */ }
  }, [state, user?.phone]);

  // TEMP_DISABLED: Cart feature disabled temporarily — addToCart is a no-op
  const addToCart = useCallback((_productId: string, _retailerId: string, _qty = 1) => {
    console.log('[TEMP_DISABLED] addToCart called but cart is disabled');
  }, []);

  // TEMP_DISABLED: Cart feature disabled temporarily — removeFromCart is a no-op
  const removeFromCart = useCallback((_productId: string, _retailerId: string) => {
    console.log('[TEMP_DISABLED] removeFromCart called but cart is disabled');
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    let saved = false;
    setState((s) => {
      if (s.wishlist.includes(productId)) {
        saved = false;
        return { ...s, wishlist: s.wishlist.filter((p) => p !== productId) };
      }
      saved = true;
      return { ...s, wishlist: [...s.wishlist, productId] };
    });
    return saved;
  }, []);

  const isWishlisted = useCallback((productId: string) => state.wishlist.includes(productId), [state.wishlist]);

  const saveAddress = useCallback((addr: Omit<SavedAddress, 'id'>) => {
    const full: SavedAddress = { ...addr, id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    setState((s) => ({ ...s, addresses: [full, ...s.addresses] }));
    return full;
  }, []);

  const removeAddress = useCallback((id: string) => {
    setState((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) }));
  }, []);

  // TEMP_DISABLED: Cart feature disabled — cartCount always 0
  const cartCount = 0;

  const value = useMemo<CartState>(() => ({
    cart: state.cart,
    wishlist: state.wishlist,
    addresses: state.addresses,
    addToCart,
    removeFromCart,
    toggleWishlist,
    isWishlisted,
    saveAddress,
    removeAddress,
    cartCount,
  }), [state, addToCart, removeFromCart, toggleWishlist, isWishlisted, saveAddress, removeAddress, cartCount]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
