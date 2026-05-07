export interface UserFarmer {
  id: string;
  phone: string;
  firebaseUid: string;
  name?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: Date;
}
