import Link from "next/link";
import { inventoryHealthSummary } from "../_data/mock";

export function DashboardInventoryHealth() {
  const s = inventoryHealthSummary;
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Inventory health</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Snapshot of stock levels across your catalog
          </p>
        </div>
        <Link
          href="/dashboard/inventory"
          className="text-sm font-medium text-primary hover:underline"
        >
          Manage inventory
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-surface-container-low p-3">
          <p className="text-xs font-medium text-on-surface-variant">In stock SKUs</p>
          <p className="mt-1 text-xl font-bold text-primary">{s.inStock}</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-3">
          <p className="text-xs font-medium text-on-surface-variant">Low stock</p>
          <p className="mt-1 text-xl font-bold text-harvest">{s.lowStock}</p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-3">
          <p className="text-xs font-medium text-on-surface-variant">Out of stock</p>
          <p className="mt-1 text-xl font-bold text-secondary">{s.outOfStock}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
        <div className="text-sm font-semibold text-primary">{s.score}/100</div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${s.score}%` }}
          />
        </div>
        <span className="text-xs font-medium text-primary">{s.label}</span>
      </div>
    </div>
  );
}
