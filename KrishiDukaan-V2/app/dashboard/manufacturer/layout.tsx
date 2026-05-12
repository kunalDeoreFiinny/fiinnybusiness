'use client';

import { auth, getUserProfile } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManufacturerDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
      } else {
        const profile = await getUserProfile(user.uid);
        if (profile?.role === 'manufacturer' && profile?.isPaid) {
          setLoading(false);
        } else {
          // Redirect to home if not paid or wrong role
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
      <div className="animate-spin w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full mb-4" />
      <p className="font-bold text-blue-900">Verifying access...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-700">Manufacturer</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard/manufacturer" className="block p-2 hover:bg-blue-700 rounded">Overview</a>
          <a href="/dashboard/manufacturer/products" className="block p-2 hover:bg-blue-700 rounded">Product Catalog</a>
          <a href="/dashboard/manufacturer/dealers" className="block p-2 hover:bg-blue-700 rounded">Dealers</a>
          <a href="/dashboard/manufacturer/analytics" className="block p-2 hover:bg-blue-700 rounded">Analytics</a>
        </nav>
        <button 
          onClick={handleLogout}
          className="p-4 bg-blue-950 hover:bg-red-800 transition-colors text-left"
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
