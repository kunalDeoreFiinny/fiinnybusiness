import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { initialUsers, initialProducts, initialBlogs, initialGrievances, initialAbout, User, Product, Blog, Grievance, AboutInfo } from '../data/mockData';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Users' | 'Products' | 'Blogs' | 'Support' | 'Company Info'>('Dashboard');

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [users] = useState<User[]>(initialUsers);
  const [grievances] = useState<Grievance[]>(initialGrievances);
  const [about, setAbout] = useState<AboutInfo>(initialAbout);

  const handleAction = (action: string, itemType: string) => {
    alert(`[MOCK ACTION]: ${action} ${itemType}. (Backend not connected)`);
  };

  return (
    <div className="absolute inset-0 flex bg-slate-50 overflow-hidden z-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-container text-white p-6 flex flex-col border-r border-white/5 shrink-0 h-full">
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
            { id: 'Company Info', icon: Icons.Settings, label: 'Company Info' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
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

      {/* Main Content */}
      <main className="flex-grow overflow-auto p-8">
        <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
           <h1 className="text-2xl font-sans font-bold text-primary">{activeTab}</h1>
           <div className="flex items-center gap-3">
              <span className="font-sans font-bold text-sm text-primary">Admin Panel</span>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Icons.User className="w-5 h-5" />
              </div>
           </div>
        </header>

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
               <span className="text-emerald-600 text-xs font-sans font-bold flex items-center gap-1">Active accounts</span>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-sans font-black text-slate-400 uppercase tracking-widest">Products</span>
                 <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                   <Icons.Box className="w-4 h-4" />
                 </div>
               </div>
               <h4 className="text-3xl font-sans font-black text-primary mb-2">{products.length}</h4>
               <span className="text-emerald-600 text-xs font-sans font-bold flex items-center gap-1">In Catalog</span>
            </div>
            <div className="bg-primary-container p-8 rounded-[2rem] shadow-xl text-white">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-sans font-black text-white/40 uppercase tracking-widest">Articles</span>
                 <div className="p-2 bg-white/10 rounded-lg text-secondary-container">
                   <Icons.FileText className="w-4 h-4" />
                 </div>
               </div>
               <h4 className="text-3xl font-sans font-black mb-2">{blogs.length}</h4>
               <span className="text-emerald-400 text-xs font-sans font-bold flex items-center gap-1">Published</span>
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
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary">{u.name}</td>
                      <td className="py-4 text-primary/80">{u.phone}</td>
                      <td className="py-4 text-primary/80">{u.joinDate}</td>
                      <td className="py-4 text-right font-bold text-primary">{u.totalOrders}</td>
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
                onClick={() => handleAction('Add', 'Product')}
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
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary">{p.name}</td>
                      <td className="py-4 text-primary/80">{p.price}</td>
                      <td className="py-4 text-primary/80">{p.badge || '-'}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction('Edit', 'Product: ' + p.name)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAction('Delete', 'Product: ' + p.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                onClick={() => handleAction('Add', 'Blog')}
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
                  {blogs.map(b => (
                    <tr key={b.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary truncate max-w-xs">{b.title}</td>
                      <td className="py-4 text-primary/80">{b.category}</td>
                      <td className="py-4 text-primary/80">{b.date}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction('Edit', 'Blog: ' + b.title)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAction('Delete', 'Blog: ' + b.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                  {grievances.map(g => (
                    <tr key={g.id} className="border-b border-primary/5 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-primary whitespace-nowrap">{g.userName}</td>
                      <td className="py-4 text-primary/80 max-w-[200px] lg:max-w-xs">
                        <div className="font-bold truncate text-primary">{g.subject}</div>
                        <div className="truncate text-xs">{g.description}</div>
                      </td>
                      <td className="py-4 text-primary/80 whitespace-nowrap">{g.date}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${
                          g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                          g.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleAction('Reply to', 'Ticket: ' + g.id)} className="px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-lg hover:bg-primary/10 transition-colors">
                            Reply
                          </button>
                          <button onClick={() => handleAction('Mark Resolved', 'Ticket: ' + g.id)} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors">
                            Resolve
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

        {activeTab === 'Company Info' && (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm max-w-2xl">
            <h2 className="font-sans text-xl font-bold text-primary mb-6">Edit Company Information</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAction('Save', 'Company Info'); }} className="space-y-4">
              <div>
                <label className="block font-sans text-sm font-semibold text-primary mb-2">Tagline</label>
                <input type="text" value={about.tagline} onChange={e => setAbout({...about, tagline: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm" />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-primary mb-2">Manufacturer</label>
                <input type="text" value={about.manufacturer} onChange={e => setAbout({...about, manufacturer: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm" />
              </div>
              <div>
                <label className="block font-sans text-sm font-semibold text-primary mb-2">Location</label>
                <input type="text" value={about.location} onChange={e => setAbout({...about, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Support Phone</label>
                  <input type="text" value={about.phone} onChange={e => setAbout({...about, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm" />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Certification</label>
                  <input type="text" value={about.certification} onChange={e => setAbout({...about, certification: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="bg-primary text-secondary-container px-6 py-3 rounded-xl font-sans font-bold text-sm w-full hover:bg-primary-container transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
