import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManufacturerDashboard({ children }: { children: React.ReactNode }) {
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
