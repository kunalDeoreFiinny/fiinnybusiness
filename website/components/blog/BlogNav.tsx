"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function BlogNav() {
    const { user, loading } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 pointer-events-none">
            {/* Left Island: Navigation */}
            <div className="flex gap-4">
                <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 transition-colors font-bold text-sm group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[3px]" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Right Island: Brand + Auth */}
            <div className="flex items-center gap-4">
                {/* Auth Status */}
                {!loading && (
                    <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 p-1 flex items-center hover:bg-white transition-colors group">
                        {user ? (
                            <div className="flex items-center gap-2 pr-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                    {user.displayName?.[0] || user.phoneNumber?.[0] || "U"}
                                </div>
                                <div className="hidden md:flex flex-col items-start pr-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editor Account</span>
                                    <span className="text-xs font-bold text-slate-800">{user.phoneNumber || "Admin"}</span>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="px-6 py-2 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all">
                                Login to Edit
                            </Link>
                        )}
                    </div>
                )}

                {/* Brand Logo */}
                <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden">
                            <Image src="/assets/images/logo_icon.png" alt="Fiinny" fill className="object-cover" />
                        </div>
                        <span className="text-xl font-black text-teal-950 tracking-tight group-hover:text-teal-700 transition-colors">Fiinny</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
