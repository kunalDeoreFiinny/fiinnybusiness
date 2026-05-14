import type { Timestamp } from "firebase/firestore";

export type ManufacturerRetailerStatus = "invited" | "active" | "revoked";

/** Document in `manufacturerRetailers` — `id` is the Firestore document ID. */
export interface ManufacturerRetailerDoc {
  id: string;
  manufacturerId: string;
  retailerId: string;
  retailerEmail: string;
  retailerPhone: string;
  inviteCode: string;
  status: ManufacturerRetailerStatus;
  claimable?: boolean;
  addedAt?: Timestamp | null;
}

export interface ManufacturerRetailerRow extends ManufacturerRetailerDoc {
  addedAtLabel: string;
}
