"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Loader2,
    Users,
    ArrowLeft,
    TrendingUp,
    Share2,
    Plus,
    Search
} from "lucide-react";

// ----------------------------------------------------------------------
// 1. MOCK DATA (Updated & Corrected)
// ----------------------------------------------------------------------
const friendsList = [
    {
        id: "1",
        name: "Karan 😵",
        avatar: "K",
        phone: "+91 72328 39475", // Formatted for better look
        color: "bg-teal-500"
    },
    {
        id: "2",
        name: "Arjun Tanpure",
        avatar: "A",
        phone: "+91 86580 32751",
        color: "bg-teal-500"
    },
    {
        id: "3",
        name: "Aana",
        avatar: "A",
        phone: "+91 94205 29370",
        color: "bg-teal-500"
    },
    {
        id: "4",
        name: "Siddharth",      // ✅ FIXED: Name Corrected
        avatar: "S",
        phone: "+91 99887 76655", // ✅ FIXED: Number Corrected
        color: "bg-teal-500"
    },
];

// ----------------------------------------------------------------------
// 2. MAIN COMPONENT
// ----------------------------------------------------------------------
export default function FriendsPage() {
    const [isLoading, setIsLoading] = useState(true);

    // Simulate smooth page load animation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600); // Slightly longer for smoothness
        return () => clearTimeout(timer);
    }, []);

    // --- Loading View ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-medium tracking-wide text-sm">Loading your circle...</p>
                </div>
            </div>
        );
    }

    // --- Main UI View ---
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-teal-100">

            {/* ----------------- TOP NAVBAR ----------------- */}
            <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center px-4 md:px-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
                        Fiinny
                    </span>
                    {/* (Optional: Add Profile Icon here later) */}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* ----------------- LEFT SIDEBAR ----------------- */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
                            <nav className="space-y-2">
                                {/* Overview Link */}
                                <Link href="/dashboard">
                                    <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group">
                                        <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span className="font-medium">Overview</span>
                                    </button>
                                </Link>

                                {/* Active State (Friends) */}
                                <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-teal-50 text-teal-700 font-bold shadow-sm border border-teal-100 transition-all duration-200">
                                    <Users className="w-5 h-5" />
                                    <span>Friends</span>
                                </button>

                                {/* Partner Sharing Link */}
                                <Link href="/dashboard/sharing">
                                    <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group">
                                        <Share2 className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        <span className="font-medium">Partner Sharing</span>
                                    </button>
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* ----------------- MAIN CONTENT AREA ----------------- */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[650px] flex flex-col">

                            {/* --- Header Section --- */}
                            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
                                <div className="flex items-center gap-4">
                                    <Link href="/dashboard" className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                                    </Link>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Social</h2>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">Manage your friends and expense groups</p>
                                    </div>
                                </div>

                                {/* Tabs Switcher */}
                                <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto shadow-inner">
                                    <button className="px-6 py-2.5 bg-white text-slate-900 shadow-sm rounded-xl font-bold text-sm transition-all duration-300 transform scale-100 ring-1 ring-black/5">
                                        Friends
                                    </button>

                                    {/* ✅ FIXED: Groups Link Corrected */}
                                    <Link href="/dashboard/group">
                                        <button className="px-6 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl font-medium text-sm transition-all duration-300">
                                            Groups
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* --- List Body --- */}
                            <div className="p-6 md:p-8 flex-1">

                                {/* Title & Add Button */}
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        Your Friends
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-extrabold">{friendsList.length}</span>
                                    </h3>
                                    <button className="flex items-center gap-2 px-5 py-3 bg-[#00796b] text-white rounded-xl font-bold hover:bg-[#00695c] transition-all duration-300 shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 active:scale-95 transform">
                                        <Plus className="w-5 h-5" />
                                        <span className="hidden sm:inline">Add Friend</span>
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="relative mb-8 group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search friends by name or phone..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-300 text-sm font-medium placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Friends Grid */}
                                <div className="grid gap-4">
                                    {friendsList.map((friend) => (
                                        <Link
                                            key={friend.id}
                                            href={`/dashboard/friends/${friend.id}`}
                                            className="group relative block bg-white border border-slate-100 rounded-2xl p-4 md:p-5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 cursor-pointer overflow-hidden"
                                        >
                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-teal-50/0 via-teal-50/30 to-teal-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-5">

                                                    {/* Avatar */}
                                                    <div className={`w-14 h-14 ${friend.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-2 ring-white`}>
                                                        {friend.avatar}
                                                    </div>

                                                    {/* Text Details */}
                                                    <div>
                                                        <h4 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-[#00796b] transition-colors duration-200">
                                                            {friend.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm text-slate-500 font-medium tracking-wide">{friend.phone}</span>
                                                            {/* ✅ FIXED: "Free" tag permanently removed */}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Arrow */}
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-[#00796b] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 shadow-sm">
                                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Empty State (Robustness) */}
                                {friendsList.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 mt-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                            <Users className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No friends yet</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                                            Add friends to start splitting bills and tracking shared expenses efficiently.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}