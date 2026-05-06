export interface CreateShopDto {
  ownerName: string;
  businessName: string;
  gst?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface UpdateShopDto {
  ownerName?: string;
  businessName?: string;
  gst?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}

export interface AdminRejectShopDto {
  reason: string;
}
