"use client";

import { FormEvent, useState } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { createProductAndInventory } from "../_lib/inventory-firestore";

const empty = {
  name: "",
  category: "",
  unit: "pkt",
  stockQuantity: "",
  sellingPrice: "",
  reorderThreshold: "",
  description: "",
  imageUrl: "",
};

type AddProductInventoryFormProps = {
  retailerId: string | null;
  disabled?: boolean;
  onCreated: () => Promise<void>;
};

export function AddProductInventoryForm({
  retailerId,
  disabled,
  onCreated,
}: AddProductInventoryFormProps) {
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!retailerId) {
      setMessage({ type: "err", text: "You must be signed in to add inventory." });
      return;
    }

    const stockQuantity = Math.max(0, Math.floor(Number(form.stockQuantity)));
    const sellingPrice = Math.max(0, Number(form.sellingPrice));
    const reorderThreshold = Math.max(0, Math.floor(Number(form.reorderThreshold)));

    if (!form.name.trim() || !form.category.trim() || !form.unit.trim()) {
      setMessage({ type: "err", text: "Name, category, and unit are required." });
      return;
    }
    if (!Number.isFinite(sellingPrice)) {
      setMessage({ type: "err", text: "Enter a valid selling price." });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await createProductAndInventory(retailerId, {
        name: form.name,
        category: form.category,
        unit: form.unit,
        stockQuantity,
        sellingPrice,
        reorderThreshold,
        description: form.description,
        imageUrl: form.imageUrl.trim() || undefined,
      });
      setForm(empty);
      setMessage({ type: "ok", text: "Product and inventory created." });
      await onCreated();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to create product.";
      setMessage({ type: "err", text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-on-surface">Add product</h2>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
          Creates <code className="text-[11px]">products</code> +{" "}
          <code className="text-[11px]">inventory</code>
        </span>
      </div>
      <p className="mt-1 text-sm text-on-surface-variant">
        New catalog entries use your account as <span className="font-medium">retailerId</span>.
      </p>

      {message ? (
        <div
          className={`mt-4 rounded-xl px-3 py-2 text-sm ${
            message.type === "ok"
              ? "border border-primary/30 bg-primary/10 text-primary"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-on-surface">Product name</span>
          <input
            required
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Hybrid Tomato Seeds"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Category</span>
          <input
            required
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Seeds, fertilizer..."
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Unit</span>
          <input
            required
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="pkt, bag, L..."
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Stock quantity</span>
          <input
            required
            type="number"
            min={0}
            step={1}
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.stockQuantity}
            onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Selling price</span>
          <input
            required
            type="number"
            min={0}
            step={0.01}
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.sellingPrice}
            onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Reorder threshold</span>
          <input
            required
            type="number"
            min={0}
            step={1}
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.reorderThreshold}
            onChange={(e) => setForm((f) => ({ ...f, reorderThreshold: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-on-surface">Description</span>
          <textarea
            rows={3}
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Product details for buyers"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium text-on-surface">Image URL (optional)</span>
          <input
            type="url"
            disabled={disabled || submitting || !retailerId}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={disabled || submitting || !retailerId}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="h-4 w-4" />
            )}
            {submitting ? "Saving..." : "Create product & inventory"}
          </button>
        </div>
      </form>
    </div>
  );
}
