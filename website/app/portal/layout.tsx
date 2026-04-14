"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LayoutDashboard, FileText, Users, LogOut, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Simple check for employee session in localStorage
        const storedEmployee = localStorage.getItem('fiinny_employee');
        
        if (!storedEmployee && pathname !== '/portal/login') {
            router.push('/portal/login');
        } else if (storedEmployee) {
            setEmployee(JSON.parse(storedEmployee));
            if (pathname === '/portal/login') {
                router.push('/portal/dashboard');
            }
        }
        setLoading(false);
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('fiinny_employee');
        router.push('/portal/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (pathname === '/portal/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50">
                <div className="p-6">
                    <Link href="/portal/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
                            F
                        </div>
                        <span className="text-xl font-bold tracking-tight">Fiinny <span className="text-teal-400">Portal</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <SidebarLink 
                        href="/portal/dashboard" 
                        icon={<LayoutDashboard className="w-5 h-5" />} 
                        label="Dashboard" 
                        active={pathname === '/portal/dashboard'} 
                    />
                    <SidebarLink 
                        href="/portal/blogs" 
                        icon={<FileText className="w-5 h-5" />} 
                        label="Manage Blogs" 
                        active={pathname.includes('/portal/blogs')} 
                    />
                    <SidebarLink 
                        href="/portal/users" 
                        icon={<Users className="w-5 h-5" />} 
                        label="Manage Employees" 
                        active={pathname.includes('/portal/users')} 
                    />
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Link 
                        href="/" 
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group"
                    >
                        <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">View Website</span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                    
                    {employee && (
                        <div className="mt-4 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Logged in as</p>
                            <p className="text-sm font-bold text-slate-200 truncate">{employee.name}</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
            <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {icon}
            </span>
            <span className="font-semibold">{label}</span>
        </Link>
    );
}
