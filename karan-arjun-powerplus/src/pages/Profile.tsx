import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { initialGrievances } from '../data/mockData';

export default function Profile() {
  const orders = [
    { id: '#ORD-9021A', date: '05 Oct 2024', product: 'Power Plus™ - 5L', status: 'In Transit', total: '₹12,450', icon: Icons.Truck },
    { id: '#ORD-8843B', date: '12 Aug 2024', product: 'Power Plus™ - 3L', status: 'Delivered', total: '₹7,800', icon: Icons.CheckCircle2 },
    { id: '#ORD-8109C', date: '03 Jun 2024', product: 'Power Plus™ - 1L x 2', status: 'Delivered', total: '₹5,200', icon: Icons.CheckCircle2 },
  ];

  const [grievances, setGrievances] = useState(initialGrievances.filter(g => g.userId === 'u1'));
  
  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Your grievance has been submitted successfully. Our support team will get back to you shortly.');
  };

  return (
    <div className="flex flex-col py-24 px-8 max-w-5xl mx-auto gap-12 min-h-screen relative">
      <header className="mb-2 relative z-10 text-center">
        <h1 className="font-sans text-4xl font-extrabold text-primary mb-2 tracking-tight">Your Profile</h1>
        <p className="text-on-surface-variant font-serif">Manage your account and order history.</p>
      </header>

      <div className="flex flex-col gap-10 relative z-10">
        {/* Profile Card */}
        <div className="glass-panel-dark rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="w-32 h-32 shrink-0 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_20px_rgba(250,204,21,0.15)] flex items-center justify-center bg-gradient-to-br from-primary-container to-primary">
            <span className="text-4xl font-sans font-bold text-secondary-container">RP</span>
          </div>
          
          <div className="flex flex-col flex-1 items-center md:items-start w-full">
            <h1 className="font-sans text-3xl font-bold text-white mb-1">Rajesh Patil</h1>
            <p className="text-white/60 mb-6 text-sm font-medium tracking-wide">Premium Member since 2022</p>
            
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-white/80 font-sans w-full justify-center md:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Icons.Mail className="w-5 h-5 text-secondary-container" />
                </div>
                <span className="font-medium text-lg">rajesh.patil@agritech.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Icons.Phone className="w-5 h-5 text-secondary-container" />
                </div>
                <span className="font-medium text-lg">+91 98765 43210</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <button className="w-full md:w-auto py-3 px-8 rounded-xl border border-secondary-container/30 text-secondary-container font-sans font-semibold hover:bg-secondary-container hover:text-primary transition-colors shadow-lg">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-surface-container rounded-[2.5rem] p-10 border border-black/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-sans text-2xl font-bold text-primary tracking-tight">Order History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Product</th>
                  <th className="py-4 text-primary/60 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="py-4 text-right text-primary/60 font-semibold uppercase tracking-wider text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-primary/5 hover:bg-white/60 transition-colors">
                    <td className="py-5 font-semibold text-primary">{order.id}</td>
                    <td className="py-5 text-on-surface-variant font-medium">{order.date}</td>
                    <td className="py-5 font-semibold text-primary">{order.product}</td>
                    <td className="py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        order.status === 'Delivered' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <order.icon className="w-3.5 h-3.5" />
                        {order.status}
                      </span>
                    </td>
                    <td className="py-5 text-right font-bold text-primary">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support & Grievances */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Submit Form */}
            <div className="flex-1">
              <h2 className="font-sans text-2xl font-bold text-primary tracking-tight mb-2">Support & Grievances</h2>
              <p className="text-on-surface-variant font-serif text-sm mb-8">Need help? Submit a ticket and our team will resolve it.</p>
              
              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Subject</label>
                  <input type="text" required placeholder="E.g., Order delay, Product damage..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm" />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Description</label>
                  <textarea required rows={4} placeholder="Describe your issue in detail..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary/20 bg-slate-50 font-sans text-sm resize-none"></textarea>
                </div>
                <button type="submit" className="bg-primary text-secondary-container px-6 py-3 rounded-xl font-sans font-bold text-sm w-full hover:bg-primary-container transition-colors">
                  Submit Ticket
                </button>
              </form>
            </div>

            {/* Ticket History */}
            <div className="flex-1">
              <h3 className="font-sans text-xl font-bold text-primary tracking-tight mb-6">Your Tickets</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {grievances.map(g => (
                  <div key={g.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-sans font-bold text-primary text-sm">{g.subject}</h4>
                      <span className={`px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${
                        g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                        g.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {g.status}
                      </span>
                    </div>
                    <p className="font-serif text-xs text-on-surface-variant line-clamp-2">{g.description}</p>
                    <span className="font-sans text-[10px] text-slate-400 mt-2">{g.date}</span>
                  </div>
                ))}
                {grievances.length === 0 && (
                  <p className="text-sm font-serif text-slate-400">You have no past tickets.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
