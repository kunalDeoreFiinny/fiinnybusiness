"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { PageHeader } from "../_components/page-header";
import { InventoryHealthCards } from "../_components/inventory-health-cards";
import { InventoryManagementTable } from "../_components/inventory-management-table";
import { AddProductInventoryForm } from "../_components/add-product-inventory-form";
import { fetchRetailerInventoryRows } from "../_lib/inventory-firestore";
import type { InventoryRow } from "../_types/inventory";
import { deriveStockStatus } from "../_types/inventory";

function computeHealth(rows: InventoryRow[]) {
  if (!rows.length) {
    return {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      score: 100,
      label: "No items yet",
    };
  }
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  rows.forEach((r) => {
    const s = deriveStockStatus(r.stockQuantity, r.reorderThreshold);
    if (s === "in_stock") inStock += 1;
    else if (s === "low_stock") lowStock += 1;
    else outOfStock += 1;
  });
  const score = Math.round((inStock / rows.length) * 100);
  const label =
    outOfStock === 0 && lowStock === 0 ? "Healthy" : score >= 70 ? "Good" : "Needs attention";
  return { inStock, lowStock, outOfStock, score, label };
}

export default function InventoryPage() {
  const [retailerId, setRetailerId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRetailerInventoryRows(uid);
      setRows(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load inventory.";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      if (!user) {
        setRetailerId(null);
        setRows([]);
        setLoading(false);
        return;
      }
      setRetailerId(user.uid);
      void load(user.uid);
    });
    return () => unsub();
  }, [load]);

  const health = useMemo(() => computeHealth(rows), [rows]);

  const refresh = useCallback(async () => {
    if (retailerId) await load(retailerId);
  }, [retailerId, load]);

  if (!authReady) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-on-surface-variant">
        Checking session…
      </div>
    );
  }

  if (!retailerId) {
    return (
      <>
        <PageHeader
          title="Inventory"
          description="Sign in as a retailer to manage stock linked to your account."
        />
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          You are not signed in.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Firestore-backed stock for your retailer. Products live in catalog; quantities and prices per store live in inventory."
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <InventoryHealthCards
        inStock={health.inStock}
        lowStock={health.lowStock}
        outOfStock={health.outOfStock}
        score={health.score}
        label={health.label}
      />

      <section className="mt-8" aria-label="Inventory list">
        <h2 className="text-lg font-semibold text-on-surface">Your inventory</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Rows are loaded from <code className="text-xs">inventory</code> for your UID, joined with{" "}
          <code className="text-xs">products</code>.
        </p>
        <div className="mt-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <InventoryManagementTable rows={rows} onUpdated={refresh} />
          )}
        </div>
      </section>

      <section className="mt-8" aria-label="Add product">
        <AddProductInventoryForm retailerId={retailerId} disabled={loading} onCreated={refresh} />
      </section>
    </>
  );
}
