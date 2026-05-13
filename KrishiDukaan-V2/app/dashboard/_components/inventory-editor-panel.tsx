"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { auth, getUserProfile, saveRetailerProduct, saveManufacturerProduct } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const empty = {
  name: "",
  sku: "",
  category: "",
  stock: "",
  reorderAt: "",
  unit: "pkt",
  price: "",
  description: "",
  image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400",
};

export function InventoryEditorPanel({ 
  onSuccess, 
  totalSeats = 0, 
  usedSeats = 0 
}: { 
  onSuccess?: () => void,
  totalSeats?: number,
  usedSeats?: number
}) {
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const limitReached = usedSeats >= totalSeats;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const p = await getUserProfile(u.uid);
        setProfile(p);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    if (limitReached) {
      alert("You have reached your product listing limit. Please upgrade to add more products.");
      return;
    }

    if (!form.name || !form.price) {
      alert("Please enter at least name and price.");
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: form.name,
        price: form.price,
        description: form.description || "Agri input product",
        image: form.image,
        stock: form.stock || "In Stock",
        category: form.category || "General",
        store: profile.shopName || profile.name || "My Store",
        distance: "Nearby",
      };

      if (profile.role === 'retailer') {
        await saveRetailerProduct(user.uid, productData);
      } else if (profile.role === 'manufacturer') {
        await saveManufacturerProduct(user.uid, productData);
      }

      setForm(empty);
      if (onSuccess) onSuccess();
      alert("Product saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Add / edit inventory</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {limitReached 
              ? "Product limit reached. Upgrade to list more products." 
              : `You can list ${totalSeats - usedSeats} more products.`}
          </p>
        </div>
        {limitReached && (
          <a 
            href="/dashboard/upgrade" 
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all"
          >
            Upgrade Seats
          </a>
        )}
      </div>

      <div className="mt-4 inline-flex rounded-xl border border-outline-variant/30 p-1">
        <button
          type="button"
          onClick={() => setMode("add")}
          disabled={limitReached}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            limitReached 
              ? "opacity-50 cursor-not-allowed" 
              : mode === "add"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Add product
        </button>
        <button
          type="button"
          disabled
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant/50 cursor-not-allowed"
        >
          Edit (Coming Soon)
        </button>
      </div>

      {limitReached ? (
        <div className="mt-8 flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-low text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
            <Save className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">Seat Limit Reached</h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
            You are currently using all {totalSeats} seats. Buy more seats to continue listing your products.
          </p>
          <a 
            href="/dashboard/upgrade" 
            className="mt-6 bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Buy More Seats - ₹21/seat
          </a>
        </div>
      ) : (
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Product name *</span>
            <input
              required
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Hybrid Tomato Seeds"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Category</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Seeds, Fertilizer..."
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Unit</span>
            <select
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            >
              <option value="pkt">Packet</option>
              <option value="bag">Bag</option>
              <option value="L">Litre</option>
              <option value="kit">Kit</option>
              <option value="kg">kg</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Stock on hand</span>
            <input
              type="text"
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder="e.g. 50 or In Stock"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Price (₹) *</span>
            <input
              required
              type="number"
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="120"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Description</span>
            <textarea
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Product details..."
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : `Save ${mode === "add" ? "product" : "changes"}`}
            </button>
            <button
              type="button"
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container"
              onClick={() => setForm(empty)}
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
