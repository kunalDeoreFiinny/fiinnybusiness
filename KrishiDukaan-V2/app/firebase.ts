import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDh_Y67TDJc2KLLJ8Wcc2JvEeHzmfVL778",
  authDomain: "krishidukan-e8315.firebaseapp.com",
  projectId: "krishidukan-e8315",
  storageBucket: "krishidukan-e8315.firebasestorage.app",
  messagingSenderId: "650303885415",
  appId: "1:650303885415:web:7db7619260aa478b2b84c2",
  measurementId: "G-7MEFGCD4EX"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize analytics safely
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export { db, auth };

export type RetailerProduct = {
  name: string;
  quantity: string;
  unit: string;
};

export type RetailerApplication = {
  ownerName: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  products: RetailerProduct[];
};

export type RetailerProfile = {
  ownerName: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
};

import { MarketplaceProduct } from '../types/product';

export async function saveRetailerApplication(payload: RetailerApplication) {
  const products = payload.products
    .filter((item) => item.name.trim() && item.quantity.trim())
    .map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity.trim(),
      unit: item.unit.trim() || 'units'
    }));

  if (!products.length) {
    throw new Error('Please add at least one product with quantity.');
  }

  await addDoc(collection(db, 'retailers'), {
    ownerName: payload.ownerName.trim(),
    shopName: payload.shopName.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    address: payload.address.trim(),
    city: payload.city.trim(),
    state: payload.state.trim(),
    pincode: payload.pincode.trim(),
    location: {
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude)
    },
    products,
    status: 'pending',
    userType: 'retailer',
    createdAt: serverTimestamp()
  });
}

export async function saveRetailerProfile(retailerId: string, profile: RetailerProfile) {
  await setDoc(
    doc(db, 'retailers', retailerId),
    {
      ownerName: profile.ownerName.trim(),
      shopName: profile.shopName.trim(),
      phone: profile.phone.trim(),
      email: profile.email.trim(),
      address: profile.address.trim(),
      city: profile.city.trim(),
      state: profile.state.trim(),
      pincode: profile.pincode.trim(),
      location: {
        latitude: Number(profile.latitude),
        longitude: Number(profile.longitude)
      },
      userType: 'retailer',
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function saveRetailerProduct(
  retailerId: string,
  product: {
    name: string;
    price: string;
    description: string;
    image: string;
    stock: string;
    category: string;
    store: string;
    distance: string;
  }
) {
  await addDoc(collection(db, 'products'), {
    retailerId,
    name: product.name.trim(),
    fullName: product.name.trim(),
    price: Number(product.price),
    category: product.category.trim() || 'general',
    description: product.description.trim(),
    image: product.image.trim(),
    stock: product.stock.trim() || 'In Stock',
    store: product.store.trim(),
    distance: product.distance.trim() || 'Nearby',
    source: 'retailer',
    createdAt: serverTimestamp()
  });
}

export async function fetchMarketplaceProducts(): Promise<MarketplaceProduct[]> {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs
      .map((item) => {
        const data = item.data();
        return {
          id: item.id,
          name: String(data.name || ''),
          fullName: data.fullName ? String(data.fullName) : undefined,
          price: Number(data.price || 0),
          oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
          category: String(data.category || 'general'),
          description: String(data.description || ''),
          image: String(data.image || ''),
          stock: String(data.stock || 'In Stock'),
          store: String(data.store || 'Local Store'),
          distance: String(data.distance || 'Nearby'),
          availability: data.availability || undefined
        } as MarketplaceProduct;
      })
      .filter((product) => product.name && product.image && Number.isFinite(product.price));
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    throw error;
  }
}

export type Store = {
  id: string;
  name: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  distance: string;
  status: string;
  stock: string[];
  isHot?: boolean;
  location: { lat: number; lng: number };
};

export async function fetchStores(): Promise<Store[]> {
  try {
    const snapshot = await getDocs(collection(db, 'stores'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Store));
  } catch (error) {
    console.error('Error fetching stores from Firestore:', error);
    throw error;
  }
}

export async function syncInitialData(products: any[], stores: any[], inventory: any[] = []) {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Firebase: Syncing initial products...');
      for (const product of products) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp(),
          source: 'initial_sync'
        });
      }
    }

    const storesSnap = await getDocs(collection(db, 'stores'));
    if (storesSnap.empty) {
      console.log('Firebase: Syncing initial stores...');
      for (const store of stores) {
        await addDoc(collection(db, 'stores'), {
          ...store,
          createdAt: serverTimestamp(),
          source: 'initial_sync'
        });
      }
    }

    const inventorySnap = await getDocs(collection(db, 'inventory'));
    if (inventorySnap.empty && inventory.length > 0) {
      console.log('Firebase: Syncing initial inventory...');
      for (const item of inventory) {
        await addDoc(collection(db, 'inventory'), {
          ...item,
          createdAt: serverTimestamp(),
          source: 'initial_sync'
        });
      }
    }
  } catch (error) {
    console.error('Firebase Sync Error (Check your Firestore Rules):', error);
    throw error;
  }
}
