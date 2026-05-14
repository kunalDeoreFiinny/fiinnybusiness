"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getUserProfile } from "../../firebase";
import { PageHeader } from "../_components/page-header";
import { InventoryHealthCards } from "../_components/inventory-health-cards";
import { InventoryManagementTable } from "../_components/inventory-management-table";
import { AddProductInventoryForm } from "../_components/add-product-inventory-form";
import { fetchRetailerInventoryRows } from "../_lib/inventory-firestore";
import type { InventoryRow } from "../_types/inventory";
import { deriveStockStatus } from "../_types/inventory";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

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

  const [profile, setProfile] = useState<any>(null);

  const load = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const [inventoryData, profileData] = await Promise.all([
        fetchRetailerInventoryRows(uid),
        getUserProfile(uid)
      ]);
      setRows(inventoryData);
      setProfile(profileData);
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
        setProfile(null);
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

  const totalSeats = profile?.totalSeats || 0;
  const productCount = profile?.productCount || 0;
  const seatsRemaining = Math.max(0, totalSeats - productCount);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Firestore-backed stock for your retailer. Products live in catalog; quantities and prices per store live in inventory."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Listing Seats</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${seatsRemaining > 0 ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}>
              {seatsRemaining} Left
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-on-surface">{productCount}</span>
            <span className="text-sm font-bold text-on-surface-variant">/ {totalSeats} Used</span>
          </div>
          <div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${seatsRemaining === 0 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, (productCount / (totalSeats || 1)) * 100)}%` }}
            />
          </div>
          <Link 
            href="/dashboard/upgrade"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Buy More Seats
          </Link>
        </div>
      </div>

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
        <AddProductInventoryForm 
          retailerId={retailerId} 
          disabled={loading || seatsRemaining <= 0} 
          onCreated={refresh}
          totalSeats={totalSeats}
          productCount={productCount}
          storeName={profile?.shopName || profile?.name}
        />
      </section>
    </>
  );
}
