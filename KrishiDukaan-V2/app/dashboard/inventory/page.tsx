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
  const [profile, setProfile] = useState<any>(null);
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
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      
      if (userProfile) {
        let fetchedProducts: any[] = [];
        if (userProfile.role === 'retailer') {
          fetchedProducts = await fetchRetailerProducts(user.uid);
        } else if (userProfile.role === 'manufacturer') {
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

  const totalSeats = profile?.totalSeats || 0;
  const usedSeats = products.length;
  const remainingSeats = Math.max(0, totalSeats - usedSeats);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track stock levels, health, and catalog updates in one place."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Seats Used</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-on-surface">{usedSeats}</span>
            <span className="text-sm font-medium text-on-surface-variant">/ {totalSeats} seats</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div 
              className={`h-full transition-all ${remainingSeats === 0 ? 'bg-harvest' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, (usedSeats / (totalSeats || 1)) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {remainingSeats} seats available for listing
          </p>
        </div>
      </div>

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
        <InventoryEditorPanel 
          onSuccess={fetchProducts} 
          totalSeats={totalSeats} 
          usedSeats={usedSeats}
        />
      </section>
    </>
  );
}
