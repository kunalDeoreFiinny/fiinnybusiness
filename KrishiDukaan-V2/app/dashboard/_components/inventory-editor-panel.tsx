"use client";

import { useState } from "react";
import { Save } from "lucide-react";

const empty = {
  name: "",
  sku: "",
  category: "",
  stock: "",
  reorderAt: "",
  unit: "pkt",
  price: "",
};

export function InventoryEditorPanel() {
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(empty);

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-on-surface">Add / edit inventory</h2>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
          Mock form — no persistence
        </span>
      </div>
      <p className="mt-1 text-sm text-on-surface-variant">
        Wire this panel to your API when ready.
      </p>

      <div className="mt-4 inline-flex rounded-xl border border-outline-variant/30 p-1">
        <button
          type="button"
          onClick={() => setMode("add")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "add"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Add product
        </button>
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "edit"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Edit selected
        </button>
      </div>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Product name</span>
          <input
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Hybrid Tomato Seeds"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">SKU</span>
          <input
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="SKU-..."
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
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Stock on hand</span>
          <input
            type="number"
            min={0}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Reorder at</span>
          <input
            type="number"
            min={0}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.reorderAt}
            onChange={(e) => setForm((f) => ({ ...f, reorderAt: e.target.value }))}
            placeholder="Threshold"
          />
        </label>
        <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Price (display)</span>
          <input
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="₹120"
          />
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            <Save className="h-4 w-4" />
            Save {mode === "add" ? "product" : "changes"}
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
    </div>
  );
}
