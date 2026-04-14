"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/admin-config';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (!user) {
                // Redirect to login if not authenticated
                router.push('/login?redirect=/admin/blog');
            } else if (!isAdmin(user.email)) {
                // Check if user is in whitelist
                console.warn(`Unauthorized access attempt to admin by: ${user.email}`);
                router.push('/'); // Redirect non-admins to home
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
