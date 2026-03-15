import React, { useState, useEffect, useRef } from 'react';
import { query, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { Store, Plus, Edit2, Trash2, Image as ImageIcon, Loader2, Save, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export interface StoreProduct {
    id?: string;
    productName: string;
    description: string;
    price: number;
    gstPct: number;
    stock: number;
    imageUrl: string;
    isAvailable: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export default function AdminStoreProductsPage() {
    const { tenantId } = useAuth();
    const { showToast } = useToast();
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<StoreProduct>({
        productName: '',
        description: '',
        price: 0,
        gstPct: 18,
        stock: 0,
        imageUrl: '',
        isAvailable: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!tenantId) return;
        const q = query(getTenantCollection(db, tenantId, 'storeProducts'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreProduct[];
            setProducts(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [tenantId]);

    const handleOpenModal = (product?: StoreProduct) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                productName: '',
                description: '',
                price: 0,
                gstPct: 18,
                stock: 0,
                imageUrl: '',
                isAvailable: true
            });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tenantId) return;

        setUploadingImage(true);
        try {
            const storageRef = ref(storage, `tenants/${tenantId}/storeProducts/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
            showToast('Image uploaded successfully', 'success');
        } catch (error) {
            console.error("Error uploading image:", error);
            showToast('Failed to upload image', 'error');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        const productData = {
            ...formData,
            updatedAt: serverTimestamp()
        };

        try {
            if (editingProduct?.id) {
                await updateDoc(getTenantDoc(db, tenantId, 'storeProducts', editingProduct.id), productData);
                showToast('Product updated successfully', 'success');
            } else {
                await addDoc(getTenantCollection(db, tenantId, 'storeProducts'), {
                    ...productData,
                    createdAt: serverTimestamp()
                });
                showToast('Product added successfully', 'success');
            }
            // Permanently update the public storefront configuration to point to this tenant
            await setDoc(doc(db, 'publicConfig', 'storefront'), { tenantId }, { merge: true });
            
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving product:", error);
            showToast('Failed to save product', 'error');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!tenantId || !window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteDoc(getTenantDoc(db, tenantId, 'storeProducts', id));
            showToast('Product deleted successfully', 'success');
        } catch (error) {
            console.error("Error deleting product:", error);
            showToast('Failed to delete product', 'error');
        }
    };

    const toggleAvailability = async (product: StoreProduct) => {
        if (!tenantId || !product.id) return;
        try {
            await updateDoc(getTenantDoc(db, tenantId, 'storeProducts', product.id), {
                isAvailable: !product.isAvailable
            });
            showToast(`Product made ${!product.isAvailable ? 'Available' : 'Unavailable'}`, 'success');
        } catch (error) {
            console.error("Error updating availability", error);
            showToast('Failed to change availability', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <Loader2 size={48} className="spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Loading Store Products...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Store size={32} /> Manage Store Products
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Add and manage items listed on your public e-commerce storefront.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '1rem', width: '80px' }}>Image</th>
                            <th style={{ padding: '1rem' }}>Product Details</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Price (₹)</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Visibility</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    <Store size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    <p>No products listed in your online store yet.</p>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--surface-border)', opacity: product.isAvailable ? 1 : 0.6 }}>
                                    <td style={{ padding: '1rem' }}>
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.productName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--surface-border)' }} />
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', background: 'var(--surface-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{product.productName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {product.description}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-light)' }}>
                                        ₹{product.price.toLocaleString()}
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>+ {product.gstPct}% GST</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ background: product.stock > 10 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: product.stock > 10 ? '#22c55e' : '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {product.stock} units
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => toggleAvailability(product)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: product.isAvailable ? 'var(--primary-light)' : 'var(--text-tertiary)' }}
                                            title={product.isAvailable ? "Visible on Store" : "Hidden from Store"}
                                        >
                                            {product.isAvailable ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button onClick={() => handleOpenModal(product)} className="icon-btn" title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id!)} className="icon-btn" title="Delete" style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {editingProduct ? <Edit2 size={24} style={{ color: 'var(--primary-light)' }} /> : <Plus size={24} style={{ color: 'var(--primary-light)' }} />}
                            {editingProduct ? 'Edit Store Product' : 'Add Store Product'}
                        </h2>

                        <form onSubmit={handleSaveProduct} style={{ display: 'grid', gap: '1.5rem' }}>
                            
                            {/* Image Upload Section */}
                            <div style={{ gridColumn: '1 / -1', background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--surface-border)', textAlign: 'center' }}>
                                {formData.imageUrl ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img src={formData.imageUrl} alt="Preview" style={{ height: '150px', borderRadius: '8px', mixBlendMode: 'multiply', background: '#fff' }} />
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({...formData, imageUrl: ''})}
                                            style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <ImageIcon size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload a high quality product image for the store.</p>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={fileInputRef} 
                                            style={{ display: 'none' }} 
                                            onChange={handleImageUpload} 
                                        />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" disabled={uploadingImage}>
                                            {uploadingImage ? 'Uploading...' : 'Choose Image'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Product Name & Title <span style={{color:'var(--danger)'}}>*</span></label>
                                    <input type="text" className="input-field" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} required placeholder="e.g KaranArjun Power Plus 3Ltr" />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Consumer Description <span style={{color:'var(--danger)'}}>*</span></label>
                                    <textarea className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Describe the benefits, usage, and warnings for the consumer..." rows={4} style={{ resize: 'vertical' }} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Selling Price (₹) <span style={{color:'var(--danger)'}}>*</span></label>
                                    <input type="number" className="input-field" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required min="0" placeholder="e.g 1350" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">GST %</label>
                                    <select className="input-field" value={formData.gstPct} onChange={e => setFormData({...formData, gstPct: Number(e.target.value)})}>
                                        <option value={0}>0%</option>
                                        <option value={5}>5%</option>
                                        <option value={12}>12%</option>
                                        <option value={18}>18%</option>
                                        <option value={28}>28%</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Available Stock <span style={{color:'var(--danger)'}}>*</span></label>
                                    <input type="number" className="input-field" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required min="0" />
                                </div>
                                
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.8rem' }}>
                                    <input 
                                        type="checkbox" 
                                        id="isAvailable"
                                        checked={formData.isAvailable} 
                                        onChange={e => setFormData({...formData, isAvailable: e.target.checked})} 
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-light)' }}
                                    />
                                    <label htmlFor="isAvailable" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
                                        Visible on Public Store
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={18} /> Save Store Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
