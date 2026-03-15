"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Loader2, Users, ArrowLeft, TrendingUp, Share2, Plus,
    Plane, Home
} from "lucide-react";

// --- Mock Data for Groups ---
const groupsList = [
    { id: "1", name: "Goa Trip 🌴", members: "You, Arjun, Karan", oweText: "You owe ₹500", type: "Trip", color: "bg-orange-500", icon: <Plane className="w-6 h-6 text-white" /> },
    { id: "2", name: "Flat 402 Rent", members: "You, Aana, Sid", oweText: "Owes you ₹12,000", type: "Home", color: "bg-blue-500", icon: <Home className="w-6 h-6 text-white" /> },
    { id: "3", name: "Office Lunch", members: "You, Team", oweText: "Settled", type: "Food", color: "bg-green-500", icon: <Users className="w-6 h-6 text-white" /> },
];

export default function GroupsPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900">
            {/* Navbar Placeholder */}
            <div className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center px-8">
                <span className="font-bold text-teal-600 text-lg">Fiinny</span>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* --- SIDEBAR --- */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
                            <div className="space-y-2">
                                <Link href="/dashboard">
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-medium">Overview</span>
                                    </button>
                                </Link>

                                {/* Active State for Groups Context */}
                                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-teal-50 text-teal-700 font-bold transition-colors">
                                    <Users className="w-5 h-5" />
                                    <span>Social</span>
                                </button>

                                <Link href="/dashboard/sharing">
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                        <span className="font-medium">Partner Sharing</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT --- */}
                    <div className="flex-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">

                            {/* Header */}
                            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Link href="/dashboard" className="md:hidden p-2 -ml-2 hover:bg-slate-50 rounded-full">
                                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                                    </Link>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Social</h2>
                                        <p className="text-sm text-slate-500">Manage your groups and expenses</p>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-auto">
                                    <Link href="/dashboard/friends">
                                        <button className="px-6 py-2 text-slate-500 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
                                            Friends
                                        </button>
                                    </Link>
                                    <button className="px-6 py-2 bg-white text-slate-900 shadow-sm rounded-lg font-bold text-sm transition-all">
                                        Groups
                                    </button>
                                </div>
                            </div>

                            {/* List Section */}
                            <div className="p-6 md:p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Your Groups ({groupsList.length})</h3>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#00796b] text-white rounded-xl font-bold hover:bg-[#00695c] transition-all shadow-lg shadow-teal-900/10 active:scale-95">
                                        <Plus className="w-5 h-5" />
                                        <span className="hidden sm:inline">Create Group</span>
                                    </button>
                                </div>

                                {/* GROUPS LIST */}
                                <div className="grid gap-3">
                                    {groupsList.map((group) => (
                                        <Link
                                            key={group.id}
                                            // 👇 IMPORTANT: Link ab 'group' (singular) folder par point kar raha hai
                                            href={`/dashboard/group/${group.id}`}
                                            className="group block bg-white border border-slate-100 rounded-2xl p-4 hover:border-teal-500/30 hover:shadow-md hover:shadow-teal-900/5 transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {/* Group Icon */}
                                                    <div className={`w-14 h-14 ${group.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                                        {group.icon}
                                                    </div>

                                                    {/* Details */}
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 group-hover:text-[#00796b] transition-colors">
                                                            {group.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mt-0.5">
                                                            <Users className="w-3 h-3" />
                                                            <span>{group.members}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Balance Info */}
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${group.oweText.includes("owes you") ? "text-teal-600" : group.oweText.includes("Settled") ? "text-slate-400" : "text-orange-500"}`}>
                                                        {group.oweText}
                                                    </p>
                                                    <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}