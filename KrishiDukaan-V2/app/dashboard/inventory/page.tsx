import type { Metadata } from "next";
import { inventoryHealthSummary, inventoryProducts } from "../_data/mock";
import { PageHeader } from "../_components/page-header";
import { InventoryHealthCards } from "../_components/inventory-health-cards";
import { ProductTable } from "../_components/product-table";
import { InventoryEditorPanel } from "../_components/inventory-editor-panel";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  const h = inventoryHealthSummary;
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track stock levels, health, and catalog updates in one place."
      />

      <InventoryHealthCards
        inStock={h.inStock}
        lowStock={h.lowStock}
        outOfStock={h.outOfStock}
        score={h.score}
        label={h.label}
      />

      <section className="mt-8" aria-label="Product list">
        <h2 className="text-lg font-semibold text-on-surface">Products</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Stock status is derived from on-hand quantity vs reorder threshold
        </p>
        <div className="mt-4">
          <ProductTable products={inventoryProducts} />
        </div>
      </section>

      <section className="mt-8" aria-label="Add or edit inventory">
        <InventoryEditorPanel />
      </section>
    </>
  );
}
