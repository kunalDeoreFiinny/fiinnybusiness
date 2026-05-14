import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import type {
  ManufacturerRetailerDoc,
  ManufacturerRetailerRow,
  ManufacturerRetailerStatus,
} from "../_types/manufacturer-retailers";

const COLLECTION = "manufacturerRetailers";

function timestampLabel(value: unknown): string {
  if (value == null) return "—";
  const t = value as Timestamp;
  if (typeof t?.toDate === "function") {
    return t.toDate().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return "—";
}

function parseStatus(value: unknown): ManufacturerRetailerStatus {
  if (value === "active" || value === "revoked" || value === "invited") return value;
  return "invited";
}

function mapDoc(id: string, data: Record<string, unknown>): ManufacturerRetailerDoc {
  return {
    id,
    manufacturerId: String(data.manufacturerId ?? ""),
    retailerId: String(data.retailerId ?? ""),
    retailerEmail: String(data.retailerEmail ?? ""),
    retailerPhone: String(data.retailerPhone ?? ""),
    inviteCode: String(data.inviteCode ?? ""),
    status: parseStatus(data.status),
    claimable: typeof data.claimable === "boolean" ? data.claimable : undefined,
    addedAt: (data.addedAt as Timestamp) ?? null,
  };
}

const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomInviteCode(length = 10): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += INVITE_CHARS[bytes[i]! % INVITE_CHARS.length];
  }
  return out;
}

async function isInviteCodeTaken(code: string): Promise<boolean> {
  const q = query(collection(db, COLLECTION), where("inviteCode", "==", code), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function generateUniqueInviteCode(maxAttempts = 8): Promise<string> {
  for (let a = 0; a < maxAttempts; a++) {
    const code = randomInviteCode(10);
    const taken = await isInviteCodeTaken(code);
    if (!taken) return code;
  }
  throw new Error("Could not generate a unique invite code. Try again.");
}

export async function fetchManufacturerRetailers(
  manufacturerId: string,
): Promise<ManufacturerRetailerRow[]> {
  const q = query(collection(db, COLLECTION), where("manufacturerId", "==", manufacturerId));
  const snap = await getDocs(q);
  const rows: ManufacturerRetailerRow[] = snap.docs.map((d) => {
    const docData = mapDoc(d.id, d.data() as Record<string, unknown>);
    return {
      ...docData,
      addedAtLabel: timestampLabel(docData.addedAt),
    };
  });
  rows.sort((a, b) => {
    const ta = a.addedAt?.toMillis?.() ?? 0;
    const tb = b.addedAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
  return rows;
}

export type CreateManufacturerRetailerInviteInput = {
  manufacturerId: string;
  retailerEmail: string;
  retailerPhone: string;
};

export async function createManufacturerRetailerInvite(
  input: CreateManufacturerRetailerInviteInput,
): Promise<{ docId: string; inviteCode: string }> {
  const inviteCode = await generateUniqueInviteCode();
  const ref = doc(collection(db, COLLECTION));
  const now = serverTimestamp();

  await setDoc(ref, {
    id: ref.id,
    manufacturerId: input.manufacturerId,
    retailerId: "",
    retailerEmail: input.retailerEmail.trim().toLowerCase(),
    retailerPhone: input.retailerPhone.trim(),
    inviteCode,
    status: "invited",
    claimable: true,
    addedAt: now,
  });

  return { docId: ref.id, inviteCode };
}
