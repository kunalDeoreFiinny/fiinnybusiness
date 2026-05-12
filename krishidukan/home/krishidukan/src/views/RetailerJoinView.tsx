import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { ICONS } from '../constants';
import { RetailerApplication, RetailerProduct, saveRetailerApplication } from '../firebase';

interface RetailerJoinViewProps {
  onBack: () => void;
}

const initialFormState: Omit<RetailerApplication, 'products'> = {
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

const initialProductState: RetailerProduct = {
  name: '',
  quantity: '',
  unit: 'kg'
};

export default function RetailerJoinView({ onBack }: RetailerJoinViewProps) {
  const [form, setForm] = useState(initialFormState);
  const [products, setProducts] = useState<RetailerProduct[]>([initialProductState]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updateFormField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateProductField = (index: number, field: keyof RetailerProduct, value: string) => {
    setProducts((prev) =>
      prev.map((product, idx) => (idx === index ? { ...product, [field]: value } : product))
    );
  };

  const addProductRow = () => {
    setProducts((prev) => [...prev, { ...initialProductState }]);
  };

  const removeProductRow = (index: number) => {
    setProducts((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      await saveRetailerApplication({ ...form, products });
      setStatus({ type: 'success', message: 'Retailer application submitted successfully.' });
      setForm(initialFormState);
      setProducts([initialProductState]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit retailer application.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-10 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-surface-container rounded-3xl p-6 md:p-10 shadow-ambient">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface">Join as Retailer</h1>
              <p className="text-on-surface-variant mt-2">
                Share your shop location and products to reach nearby farmers.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold hover:bg-surface-container transition-colors"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-on-surface mb-4">Shop & Owner Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={(e) => updateFormField('ownerName', e.target.value)}
                  placeholder="Owner Name"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  required
                  value={form.shopName}
                  onChange={(e) => updateFormField('shopName', e.target.value)}
                  placeholder="Shop Name"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateFormField('phone', e.target.value)}
                  placeholder="Phone Number"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateFormField('email', e.target.value)}
                  placeholder="Email Address"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-on-surface mb-4">Shop Location</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => updateFormField('address', e.target.value)}
                  placeholder="Full Address"
                  className="md:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => updateFormField('city', e.target.value)}
                  placeholder="City"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => updateFormField('state', e.target.value)}
                  placeholder="State"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  required
                  value={form.pincode}
                  onChange={(e) => updateFormField('pincode', e.target.value)}
                  placeholder="Pincode"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  required
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateFormField('latitude', e.target.value)}
                  placeholder="Latitude"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  required
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateFormField('longitude', e.target.value)}
                  placeholder="Longitude"
                  className="bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-on-surface">Products in Your Shop</h2>
                <button
                  type="button"
                  onClick={addProductRow}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <ICONS.Plus className="w-3.5 h-3.5" />
                  Add Product
                </button>
              </div>
              <div className="space-y-3">
                {products.map((product, index) => (
                  <motion.div
                    key={`${index}-${product.name}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-12 gap-3 items-center"
                  >
                    <input
                      type="text"
                      required
                      value={product.name}
                      onChange={(e) => updateProductField(index, 'name', e.target.value)}
                      placeholder="Product Name"
                      className="md:col-span-6 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      required
                      value={product.quantity}
                      onChange={(e) => updateProductField(index, 'quantity', e.target.value)}
                      placeholder="Quantity"
                      className="md:col-span-3 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={product.unit}
                      onChange={(e) => updateProductField(index, 'unit', e.target.value)}
                      placeholder="Unit (kg, bag, pcs)"
                      className="md:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      className="md:col-span-1 inline-flex items-center justify-center h-11 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
                      aria-label="Remove product row"
                    >
                      <ICONS.Minus className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-secondary text-white font-bold hover:bg-on-secondary-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Retailer Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
