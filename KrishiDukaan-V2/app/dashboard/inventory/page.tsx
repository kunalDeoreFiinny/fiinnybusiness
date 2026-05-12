'use client';

import { useEffect, useState } from "react";
import { auth, getUserProfile, fetchRetailerProducts, fetchManufacturerProducts } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { PageHeader } from "../_components/page-header";
import { InventoryHealthCards } from "../_components/inventory-health-cards";
import { ProductTable } from "../_components/product-table";
import { InventoryEditorPanel } from "../_components/inventory-editor-panel";

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [health, setHealth] = useState({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    score: 0,
    label: "No data",
  });

  const fetchProducts = async () => {
    const user = auth.currentUser;
    if (user) {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        let fetchedProducts: any[] = [];
        if (profile.role === 'retailer') {
          fetchedProducts = await fetchRetailerProducts(user.uid);
        } else if (profile.role === 'manufacturer') {
          fetchedProducts = await fetchManufacturerProducts(user.uid);
        }
        setProducts(fetchedProducts);
        
        const productCount = fetchedProducts.length;
        const inStock = fetchedProducts.filter(p => p.stock !== 'Out of Stock' && p.stock !== '0').length;
        const lowStock = fetchedProducts.filter(p => p.stock === 'Low Stock').length;
        const outOfStock = productCount - inStock;

        setHealth({
          inStock,
          lowStock,
          outOfStock,
          score: productCount > 0 ? Math.round((inStock / productCount) * 100) : 100,
          label: productCount > 0 ? (inStock / productCount > 0.8 ? "Healthy" : "Attention needed") : "No data",
        });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await fetchProducts();
        } catch (error) {
          console.error("Error fetching inventory data:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track stock levels, health, and catalog updates in one place."
      />

      <InventoryHealthCards
        inStock={health.inStock}
        lowStock={health.lowStock}
        outOfStock={health.outOfStock}
        score={health.score}
        label={health.label}
      />

      <section className="mt-8" aria-label="Product list">
        <h2 className="text-lg font-semibold text-on-surface">Products</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Stock status is derived from on-hand quantity vs reorder threshold
        </p>
        <div className="mt-4">
          <ProductTable products={products} />
        </div>
      </section>

      <section className="mt-8" aria-label="Add or edit inventory">
        <InventoryEditorPanel onSuccess={fetchProducts} />
      </section>
    </>
  );
}
