import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Icons } from '../components/Icons';
import {
  initialAbout,
  initialBlogs,
  initialProducts,
  type AboutInfo,
  type Blog,
  type Grievance,
  type Product,
  type User,
} from '../data/mockData';
import { db } from '../lib/firebase';

type AdminTab = 'Dashboard' | 'Users' | 'Products' | 'Blogs' | 'Support' | 'Company Info';

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [about, setAbout] = useState<AboutInfo>(initialAbout);
  const [status, setStatus] = useState('');
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const value: Product[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        const numericPrice = Number(data.numericPrice ?? data.price ?? 0);
        return {
          id: docItem.id,
          name: String(data.name ?? ''),
          desc: String(data.desc ?? ''),
          price: typeof data.price === 'string' ? data.price : formatPrice(numericPrice),
          numericPrice,
          image: String(data.image ?? '/bottle-1l-Photoroom.png'),
          badge: data.badge ? String(data.badge) : undefined,
          featured: Boolean(data.featured),
        };
      });
      setProducts(value);
    });

    const unsubscribeBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const value: Blog[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          title: String(data.title ?? ''),
          excerpt: String(data.excerpt ?? ''),
          date: String(data.date ?? ''),
          category: String(data.category ?? ''),
        };
      });
      setBlogs(value);
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const value: User[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          name: String(data.name ?? 'Unknown'),
          phone: String(data.phone ?? '-'),
          totalOrders: Number(data.totalOrders ?? 0),
          joinDate: String(data.createdAt?.toDate?.()?.toISOString?.().slice(0, 10) ?? '-'),
        };
      });
      setUsers(value);
    });

    const unsubscribeGrievances = onSnapshot(collection(db, 'grievances'), (snapshot) => {
      const value: Grievance[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          userId: String(data.uid ?? ''),
          userName: String(data.userName ?? 'User'),
          subject: String(data.subject ?? ''),
          description: String(data.description ?? ''),
          status: (data.status as Grievance['status']) ?? 'Pending',
          date: String(data.date ?? '-'),
        };
      });
      setGrievances(value);
    });

    const unsubscribeCompany = onSnapshot(doc(db, 'settings', 'company'), (snapshot) => {
      if (!snapshot.exists()) {
        setAbout(initialAbout);
        return;
      }
      const data = snapshot.data();
      setAbout({
        tagline: String(data.tagline ?? initialAbout.tagline),
        manufacturer: String(data.manufacturer ?? initialAbout.manufacturer),
        location: String(data.location ?? initialAbout.location),
        phone: String(data.phone ?? initialAbout.phone),
        certification: String(data.certification ?? initialAbout.certification),
      });
    });

    return () => {
      unsubscribeProducts();
      unsubscribeBlogs();
      unsubscribeUsers();
      unsubscribeGrievances();
      unsubscribeCompany();
    };
  }, []);

  const handleCreateProduct = async () => {
    const name = window.prompt('Product name');
    if (!name) return;
    const desc = window.prompt('Product description') ?? '';
    const priceInput = window.prompt('Numeric price (example: 2150)', '500') ?? '0';
    const numericPrice = Number(priceInput);
    const image = window.prompt('Image URL/path', '/bottle-1l-Photoroom.png') ?? '/bottle-1l-Photoroom.png';
    const badge = window.prompt('Badge text (optional)', '') ?? '';
    const featured = window.confirm('Mark as featured product?');
    await addDoc(collection(db, 'products'), {
      name: name.trim(),
      desc: desc.trim(),
      price: formatPrice(numericPrice),
      numericPrice,
      image: image.trim(),
      badge: badge.trim(),
      featured,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setStatus('Product created.');
  };

  const handleEditProduct = async (product: Product) => {
    const name = window.prompt('Product name', product.name);
    if (!name) return;
    const desc = window.prompt('Product description', product.desc) ?? product.desc;
    const priceInput = window.prompt('Numeric price', String(product.numericPrice)) ?? String(product.numericPrice);
    const numericPrice = Number(priceInput);
    const image = window.prompt('Image URL/path', product.image) ?? product.image;
    const badge = window.prompt('Badge text (optional)', product.badge ?? '') ?? '';
    const featured = window.confirm('Should this product be featured?');
    await updateDoc(doc(db, 'products', product.id), {
      name: name.trim(),
      desc: desc.trim(),
      price: formatPrice(numericPrice),
      numericPrice,
      image: image.trim(),
      badge: badge.trim(),
      featured,
      updatedAt: serverTimestamp(),
    });
    setStatus('Product updated.');
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    await deleteDoc(doc(db, 'products', product.id));
    setStatus('Product deleted.');
  };

  const handleCreateBlog = async () => {
    const title = window.prompt('Blog title');
    if (!title) return;
    const excerpt = window.prompt('Excerpt', '') ?? '';
    const category = window.prompt('Category', 'General') ?? 'General';
    const date = window.prompt('Display date', new Date().toLocaleDateString('en-IN')) ?? new Date().toLocaleDateString('en-IN');
    await addDoc(collection(db, 'blogs'), {
      title: title.trim(),
      excerpt: excerpt.trim(),
      category: category.trim(),
      date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setStatus('Blog post created.');
  };

  const handleEditBlog = async (blog: Blog) => {
    const title = window.prompt('Blog title', blog.title);
    if (!title) return;
    const excerpt = window.prompt('Excerpt', blog.excerpt) ?? blog.excerpt;
    const category = window.prompt('Category', blog.category) ?? blog.category;
    const date = window.prompt('Display date', blog.date) ?? blog.date;
    await updateDoc(doc(db, 'blogs', blog.id), {
      title: title.trim(),
      excerpt: excerpt.trim(),
      category: category.trim(),
      date,
      updatedAt: serverTimestamp(),
    });
    setStatus('Blog updated.');
  };

  const handleDeleteBlog = async (blog: Blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;
    await deleteDoc(doc(db, 'blogs', blog.id));
    setStatus('Blog deleted.');
  };

  const handleResolveTicket = async (ticket: Grievance) => {
    await updateDoc(doc(db, 'grievances', ticket.id), {
      status: 'Resolved',
      updatedAt: serverTimestamp(),
    });
    setStatus(`Ticket ${ticket.id} marked as resolved.`);
  };

  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    await setDoc(
      doc(db, 'settings', 'company'),
      {
        ...about,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    setIsSavingCompany(false);
    setStatus('Company information saved.');
  };

  const seedInitialData = async () => {
    const batch = writeBatch(db);
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const blogsSnapshot = await getDocs(collection(db, 'blogs'));

    if (productsSnapshot.empty) {
      initialProducts.forEach((product) => {
        const ref = doc(collection(db, 'products'));
        batch.set(ref, {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    if (blogsSnapshot.empty) {
      initialBlogs.forEach((blog) => {
        const ref = doc(collection(db, 'blogs'));
        batch.set(ref, {
          ...blog,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    batch.set(
      doc(db, 'settings', 'company'),
      {
        ...initialAbout,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    await batch.commit();
    setStatus('Initial Firestore data seeded.');
  };

  return (
    <div className="absolute inset-0 flex bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-primary-container text-white px-6 pb-6 pt-24 flex flex-col border-r border-white/5 shrink-0 h-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-sans font-black text-2xl">P</div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-base leading-tight">Power Plus™</span>
            <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Admin Console</span>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'Dashboard', icon: Icons.LayoutDashboard, label: 'Dashboard' },
            { id: 'Users', icon: Icons.Users, label: 'Users' },
            { id: 'Products', icon: Icons.Box, label: 'Products' },
            { id: 'Blogs', icon: Icons.FileText, label: 'Blogs' },
            { id: 'Support', icon: Icons.AlertCircle, label: 'Support' },
            { id: 'Company Info', icon: Icons.Settings, label: 'Company Info' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-sans font-bold text-base ${
                activeTab === item.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow overflow-auto px-8 pb-8 pt-24">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h1 className="text-2xl font-sans font-bold text-primary">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-sm text-primary">Admin Panel</span>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Icons.User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {status && <p className="mb-6 text-sm font-sans font-semibold text-emerald-700">{status}</p>}

        {activeTab === 'Dashboard' && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest">Total Users</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Icons.Users className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-3xl font-sans font-black text-primary mb-2">{users.length}</h4>
              <span className="text-emerald-600 text-xs font-sans font-bold">Active accounts</span>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest">Products</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Icons.Box className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-3xl font-sans font-black text-primary mb-2">{products.length}</h4>
              <span className="text-emerald-600 text-xs font-sans font-bold">In catalog</span>
            </div>
            <div className="bg-primary-container p-8 rounded-[2rem] shadow-xl text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">Articles</span>
                <div className="p-2 bg-white/10 rounded-lg text-secondary-container">
                  <Icons.FileText className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-3xl font-sans font-black mb-2">{blogs.length}</h4>
              <span className="text-emerald-400 text-xs font-sans font-bold">Published</span>
            </div>
            <div className="md:col-span-3">
              <button
                onClick={() => void seedInitialData()}
                className="bg-primary text-secondary-container px-5 py-3 rounded-xl font-sans font-bold text-sm hover:bg-primary-container transition-colors"
              >
                Seed Initial Data
              </button>
            </div>
          </section>
        )}

        {activeTab === 'Users' && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="font-sans text-xl font-bold text-primary mb-6">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Name</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Phone</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Join Date</th>
                    <th className="py-4 text-right text-primary/60 font-semibold uppercase tracking-wider text-xs">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <tr key={account.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary">{account.name}</td>
                      <td className="py-4 text-primary/80">{account.phone || '-'}</td>
                      <td className="py-4 text-primary/80">{account.joinDate}</td>
                      <td className="py-4 text-right font-bold text-primary">{account.totalOrders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-sans text-xl font-bold text-primary">Products Catalog</h2>
              <button
                onClick={() => void handleCreateProduct()}
                className="bg-primary text-secondary-container px-4 py-2 rounded-xl font-sans font-bold text-sm flex items-center gap-2 hover:bg-primary-container transition-colors"
              >
                <Icons.Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Name</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Price</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Badge</th>
                    <th className="py-4 text-right text-primary/60 font-semibold uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary">{product.name}</td>
                      <td className="py-4 text-primary/80">{product.price}</td>
                      <td className="py-4 text-primary/80">{product.badge || '-'}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => void handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => void handleDeleteProduct(product)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Blogs' && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-sans text-xl font-bold text-primary">Blog Posts</h2>
              <button
                onClick={() => void handleCreateBlog()}
                className="bg-primary text-secondary-container px-4 py-2 rounded-xl font-sans font-bold text-sm flex items-center gap-2 hover:bg-primary-container transition-colors"
              >
                <Icons.Plus className="w-4 h-4" /> Add Blog
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Title</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Category</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Date</th>
                    <th className="py-4 text-right text-primary/60 font-semibold uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary truncate max-w-xs">{blog.title}</td>
                      <td className="py-4 text-primary/80">{blog.category}</td>
                      <td className="py-4 text-primary/80">{blog.date}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => void handleEditBlog(blog)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => void handleDeleteBlog(blog)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Support' && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="font-sans text-xl font-bold text-primary mb-6">User Support & Grievances</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">User</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Subject / Issue</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Date</th>
                    <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Status</th>
                    <th className="py-4 text-right text-primary/60 font-semibold uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary whitespace-nowrap">{ticket.userName}</td>
                      <td className="py-4 text-primary/80 max-w-[200px] lg:max-w-xs">
                        <div className="font-bold truncate text-primary">{ticket.subject}</div>
                        <div className="truncate text-xs">{ticket.description}</div>
                      </td>
                      <td className="py-4 text-primary/80 whitespace-nowrap">{ticket.date}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ticket.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => void handleResolveTicket(ticket)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Company Info' && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm max-w-2xl">
            <h2 className="font-sans text-xl font-bold text-primary mb-6">Edit Company Information</h2>
            <form onSubmit={handleSaveCompanyInfo} className="space-y-4">
              <div>
                <label className="block font-sans text-sm font-semibold text-primary mb-2">Tagline</label>
                <input
                  type="text"
                  value={about.tagline}
                  onChange={(e) => setAbout({ ...about, tagline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-primary mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={about.manufacturer}
                  onChange={(e) => setAbout({ ...about, manufacturer: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-primary mb-2">Location</label>
                <input
                  type="text"
                  value={about.location}
                  onChange={(e) => setAbout({ ...about, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Support Phone</label>
                  <input
                    type="text"
                    value={about.phone}
                    onChange={(e) => setAbout({ ...about, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Certification</label>
                  <input
                    type="text"
                    value={about.certification}
                    onChange={(e) => setAbout({ ...about, certification: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSavingCompany}
                  className="bg-primary text-secondary-container px-6 py-3 rounded-xl font-sans font-bold text-sm w-full hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                  {isSavingCompany ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
