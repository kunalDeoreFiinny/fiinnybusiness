import { ShopStatus } from '../enums/shop-status.enum';
import { LicenseType } from '../enums/license-type.enum';
import { SubscriptionPlan, SubscriptionStatus } from '../enums/subscription.enum';

export interface Shop {
  id: string;
  ownerName: string;
  businessName: string;
  gst?: string | null;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
  firebaseUid: string;
  adminNotes?: string | null;
  status: ShopStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopLicense {
  id: string;
  shopId: string;
  licenseType: LicenseType;
  licenseNumber: string;
  issueDate?: Date | null;
  expiryDate?: Date | null;
  documentUrl: string;
  createdAt: Date;
}

export interface ShopWithLicenses extends Shop {
  licenses: ShopLicense[];
}

export interface Subscription {
  id: string;
  shopId: string;
  plan: SubscriptionPlan;
  amount?: number | null;
  startDate: Date;
  endDate?: Date | null;
  status: SubscriptionStatus;
  razorpayId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopPublicProfile {
  id: string;
  businessName: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
}
