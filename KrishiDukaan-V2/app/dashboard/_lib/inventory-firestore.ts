import {
  collection,
  doc,
  documentId,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { InventoryDoc, InventoryRow, ProductDoc } from "../_types/inventory";
import { deriveStockStatus } from "../_types/inventory";

function timestampToDate(value: unknown): Date | null {
  if (value == null) return null;
  const t = value as Timestamp;
  if (typeof t?.toDate === "function") return t.toDate();
  return null;
}

function toNum(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapProduct(id: string, data: Record<string, unknown>): ProductDoc {
  return {
    id,
    name: String(data.name ?? ""),
    category: String(data.category ?? ""),
    description: String(data.description ?? ""),
    imageUrl: String(data.imageUrl ?? data.image ?? ""),
    unit: String(data.unit ?? ""),
    defaultPrice: toNum(data.defaultPrice ?? data.price, 0),
    createdAt: (data.createdAt as Timestamp) ?? null,
    updatedAt: (data.updatedAt as Timestamp) ?? null,
    isActive: data.isActive !== false,
  };
}

function mapInventory(id: string, data: Record<string, unknown>): InventoryDoc {
  return {
    id,
    retailerId: String(data.retailerId ?? ""),
    productId: String(data.productId ?? ""),
    stockQuantity: toNum(data.stockQuantity ?? data.stock, 0),
    sellingPrice: toNum(data.sellingPrice ?? data.price, 0),
    reorderThreshold: toNum(data.reorderThreshold ?? data.reorderAt, 0),
    isAvailable: data.isAvailable !== false,
    updatedAt: (data.updatedAt as Timestamp) ?? null,
  };
}

async function fetchProductsByIds(ids: string[]): Promise<Map<string, ProductDoc>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, ProductDoc>();
  const chunkSize = 10;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    if (!chunk.length) continue;
    const q = query(collection(db, "products"), where(documentId(), "in", chunk));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      map.set(d.id, mapProduct(d.id, d.data() as Record<string, unknown>));
    });
  }

  return map;
}

export async function fetchRetailerInventoryRows(retailerId: string): Promise<InventoryRow[]> {
  const q = query(collection(db, "inventory"), where("retailerId", "==", retailerId));
  const invSnap = await getDocs(q);

  const inventoryDocs = invSnap.docs.map((d) =>
    mapInventory(d.id, d.data() as Record<string, unknown>),
  );

  const productIds = inventoryDocs.map((i) => i.productId);
  const products = await fetchProductsByIds(productIds);

  const rows: InventoryRow[] = inventoryDocs.map((inv) => {
    const p = products.get(inv.productId);
    const status = deriveStockStatus(inv.stockQuantity, inv.reorderThreshold);
    return {
      inventoryId: inv.id,
      productId: inv.productId,
      productName: p?.name ?? "Unknown product",
      category: p?.category ?? "—",
      unit: p?.unit ?? "—",
      stockQuantity: inv.stockQuantity,
      sellingPrice: inv.sellingPrice,
      reorderThreshold: inv.reorderThreshold,
      status,
      updatedAt: timestampToDate(inv.updatedAt),
    };
  });

  rows.sort((a, b) => {
    const ta = a.updatedAt?.getTime() ?? 0;
    const tb = b.updatedAt?.getTime() ?? 0;
    return tb - ta;
  });

  return rows;
}

export type AddProductInventoryInput = {
  name: string;
  category: string;
  unit: string;
  stockQuantity: number;
  sellingPrice: number;
  reorderThreshold: number;
  description: string;
  imageUrl?: string;
};

export async function createProductAndInventory(
  retailerId: string,
  input: AddProductInventoryInput,
): Promise<void> {
  const now = serverTimestamp();
  const defaultPrice = input.sellingPrice;
  const imageUrl = (input.imageUrl ?? "").trim();

  const productRef = doc(collection(db, "products"));
  const inventoryRef = doc(collection(db, "inventory"));

  await setDoc(productRef, {
    id: productRef.id,
    name: input.name.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    imageUrl: imageUrl || "",
    unit: input.unit.trim(),
    defaultPrice,
    createdAt: now,
    updatedAt: now,
    isActive: true,
  });

  await setDoc(inventoryRef, {
    id: inventoryRef.id,
    retailerId,
    productId: productRef.id,
    stockQuantity: input.stockQuantity,
    sellingPrice: input.sellingPrice,
    reorderThreshold: input.reorderThreshold,
    isAvailable: input.stockQuantity > 0,
    updatedAt: now,
  });
}

export type InventoryUpdateInput = {
  stockQuantity: number;
  sellingPrice: number;
  reorderThreshold: number;
};

export async function updateInventoryRecord(
  inventoryId: string,
  patch: InventoryUpdateInput,
): Promise<void> {
  const ref = doc(db, "inventory", inventoryId);
  await updateDoc(ref, {
    stockQuantity: patch.stockQuantity,
    sellingPrice: patch.sellingPrice,
    reorderThreshold: patch.reorderThreshold,
    isAvailable: patch.stockQuantity > 0,
    updatedAt: serverTimestamp(),
  });
}
