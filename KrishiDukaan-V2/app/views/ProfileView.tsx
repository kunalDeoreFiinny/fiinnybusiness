import { MarketplaceProduct } from "../../types/product";
import { FormEvent, useState } from 'react';
import { ICONS } from '../constants';
import { saveRetailerProduct, saveRetailerProfile } from '../firebase';

type UserRole = 'retailer' | 'manufacturer';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

interface ProfileViewProps {
  role: UserRole;
  profile: UserProfile;
  onRoleChange: (role: UserRole) => void;
  onProfileSave: (profile: UserProfile) => void;
  onRetailerProductSaved: () => Promise<void>;
}

interface RetailerFormState {
  ownerName: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
}

interface ProductFormState {
  name: string;
  price: string;
  description: string;
  image: string;
  stock: string;
  category: string;
  distance: string;
}

const initialRetailerForm: RetailerFormState = {
  ownerName: '',
  shopName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  latitude: '',
  longitude: ''
};

const initialProductForm: ProductFormState = {
  name: '',
  price: '',
  description: '',
  image: '',
  stock: 'In Stock',
  category: 'general',
  distance: 'Nearby'
};

export default function ProfileView({
  role,
  profile,
  onRoleChange,
  onProfileSave,
  onRetailerProductSaved
}: ProfileViewProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [retailerForm, setRetailerForm] = useState<RetailerFormState>(initialRetailerForm);
  const [productForm, setProductForm] = useState<ProductFormState>(initialProductForm);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const retailerId = localProfile.phone.trim() || localProfile.email.trim() || localProfile.name.trim();

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onProfileSave(localProfile);
    setStatus({ type: 'success', message: 'Profile details updated.' });
  };

  const handleRetailerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!retailerId) {
      setStatus({ type: 'error', message: 'Please save your profile phone/email first.' });
      return;
    }
    setLoadingProfile(true);
    setStatus(null);
    try {
      await saveRetailerProfile(retailerId, retailerForm);
      setStatus({ type: 'success', message: 'Retailer details saved.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save retailer details.';
      setStatus({ type: 'error', message });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!retailerId) {
      setStatus({ type: 'error', message: 'Please save your profile phone/email first.' });
      return;
    }
    setLoadingProduct(true);
    setStatus(null);
    try {
      await saveRetailerProduct(retailerId, {
        ...productForm,
        store: retailerForm.shopName || localProfile.name
      });
      await onRetailerProductSaved();
      setProductForm(initialProductForm);
      setStatus({ type: 'success', message: 'Product published. Customers can now see it.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish product.';
      setStatus({ type: 'error', message });
    } finally {
      setLoadingProduct(false);
    }
  };

  return (
    <div className="px-4 md:px-10 max-w-5xl mx-auto w-full py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-surface-container p-6 md:p-8 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">My Profile</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Manage your business profile and product listings.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2">
            <label htmlFor="roleSelect" className="text-xs font-semibold text-on-surface-variant">
              Account Type
            </label>
            <select
              id="roleSelect"
              value={role}
              disabled={true}
              className="bg-transparent text-sm font-semibold text-on-surface border-none focus:ring-0 opacity-70 cursor-not-allowed"
            >
              <option value="retailer">Retailer</option>
              <option value="manufacturer">Distributor / Mfg</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            value={localProfile.name}
            onChange={(e) => setLocalProfile((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Your Name"
            required
            className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="tel"
            value={localProfile.phone}
            onChange={(e) => setLocalProfile((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Phone Number"
            required
            className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="email"
            value={localProfile.email}
            onChange={(e) => setLocalProfile((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email Address"
            required
            className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="md:col-span-3 bg-primary text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-surface-container p-6 md:p-8 shadow-ambient">
        <h2 className="text-xl font-bold text-on-surface mb-4">Retailer Details</h2>
        <form onSubmit={handleRetailerSubmit} className="grid md:grid-cols-2 gap-4">
          <input type="text" required value={retailerForm.ownerName} onChange={(e) => setRetailerForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner Name" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={retailerForm.shopName} onChange={(e) => setRetailerForm((p) => ({ ...p, shopName: e.target.value }))} placeholder="Shop Name" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="tel" required value={retailerForm.phone} onChange={(e) => setRetailerForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Retailer Phone" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="email" required value={retailerForm.email} onChange={(e) => setRetailerForm((p) => ({ ...p, email: e.target.value }))} placeholder="Retailer Email" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={retailerForm.address} onChange={(e) => setRetailerForm((p) => ({ ...p, address: e.target.value }))} placeholder="Address" className="md:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={retailerForm.city} onChange={(e) => setRetailerForm((p) => ({ ...p, city: e.target.value }))} placeholder="City" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={retailerForm.state} onChange={(e) => setRetailerForm((p) => ({ ...p, state: e.target.value }))} placeholder="State" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={retailerForm.pincode} onChange={(e) => setRetailerForm((p) => ({ ...p, pincode: e.target.value }))} placeholder="Pincode" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="number" step="any" required value={retailerForm.latitude} onChange={(e) => setRetailerForm((p) => ({ ...p, latitude: e.target.value }))} placeholder="Latitude" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="number" step="any" required value={retailerForm.longitude} onChange={(e) => setRetailerForm((p) => ({ ...p, longitude: e.target.value }))} placeholder="Longitude" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <button
            type="submit"
            disabled={loadingProfile}
            className="md:col-span-2 bg-secondary text-white font-semibold px-5 py-3 rounded-xl hover:bg-on-secondary-container transition-colors disabled:opacity-60"
          >
            {loadingProfile ? 'Saving...' : 'Save Retailer Details'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-surface-container p-6 md:p-8 shadow-ambient">
        <h2 className="text-xl font-bold text-on-surface mb-4">Add Product for Customers</h2>
        <form onSubmit={handleProductSubmit} className="grid md:grid-cols-2 gap-4">
          <input type="text" required value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product Name" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="number" required min="1" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} placeholder="Price (₹)" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category (seeds/fertilizers/tools)" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} placeholder="Stock Status (In Stock)" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="text" required value={productForm.distance} onChange={(e) => setProductForm((p) => ({ ...p, distance: e.target.value }))} placeholder="Distance (e.g. 2.5km)" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="url" required value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} placeholder="Product Image URL" className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <textarea value={productForm.description} required onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} placeholder="Product Description" className="md:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm min-h-24 focus:outline-none focus:ring-1 focus:ring-primary" />
          <button
            type="submit"
            disabled={loadingProduct}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            <ICONS.AddToCart className="w-4 h-4" />
            {loadingProduct ? 'Publishing...' : 'Publish Product'}
          </button>
        </form>
      </div>

      {status && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            status.type === 'success'
              ? 'bg-primary-container/20 text-primary border border-primary/30'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
