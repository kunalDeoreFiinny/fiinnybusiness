import type { InventoryProduct } from "../_data/mock";
import { cn } from "../_lib/cn";

function stockStatus(product: any): {
  label: string;
  className: string;
} {
  const stock = product.stock;
  if (stock === "Out of Stock" || stock === "0" || stock === 0) {
    return { label: "Out of stock", className: "bg-harvest/15 text-harvest" };
  }
  if (stock === "Low Stock") {
    return { label: "Low stock", className: "bg-secondary-container/80 text-on-secondary-container" };
  }
  return { label: "In stock", className: "bg-primary/10 text-primary" };
}

type ProductTableProps = {
  products: any[];
};

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Product</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Category</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Stock</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {products.map((p) => {
              const status = stockStatus(p);
              return (
                <tr key={p.id} className="hover:bg-surface-container/60">
                  <td className="px-4 py-3 font-medium text-on-surface">{p.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.category}</td>
                  <td className="px-4 py-3 tabular-nums text-on-surface">
                    {p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums text-on-surface">₹{p.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
