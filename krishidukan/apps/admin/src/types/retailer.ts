// Firestore: /users/{uid}
export interface RetailerUser {
  uid: string;
  role: 'retailer';
  email: string;
  createdAt: Date;
}

// Firestore: /retailers/{uid}
export interface Retailer {
  uid: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

// Form state (lat/lng come in as strings from inputs)
export interface AddRetailerFormData {
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  lat: string;
  lng: string;
}
