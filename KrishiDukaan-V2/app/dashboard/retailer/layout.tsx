'use client';

import { auth, getUserProfile } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RetailerDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
      } else {
        const profile = await getUserProfile(user.uid);
        if (profile?.role === 'retailer' && profile?.isPaid) {
          setLoading(false);
        } else {
          router.push('/');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin w-10 h-10 border-4 border-green-900 border-t-transparent rounded-full mb-4" />
      <p className="font-bold text-green-900">Verifying access...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-green-700">Retailer</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard/retailer" className="block p-2 hover:bg-green-700 rounded">Overview</a>
          <a href="/dashboard/retailer/products" className="block p-2 hover:bg-green-700 rounded">My Products</a>
          <a href="/dashboard/retailer/orders" className="block p-2 hover:bg-green-700 rounded">Orders</a>
          <a href="/dashboard/retailer/staff" className="block p-2 hover:bg-green-700 rounded">Staff</a>
        </nav>
        <button 
          onClick={handleLogout}
          className="p-4 bg-green-900 hover:bg-red-800 transition-colors text-left"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
