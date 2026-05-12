import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RetailerDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return <div className="p-10">Loading Dashboard...</div>;

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
