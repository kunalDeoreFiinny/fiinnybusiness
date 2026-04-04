"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Plus, PenTool } from "lucide-react";

/**
 * A subtle floating action button that only appears for logged-in users 
 * on the blog list page, giving the user the "option to add blogs of their own".
 */
export default function BlogAdminButton() {
    const { user, loading } = useAuth();

    if (loading || !user) return null;

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            <Link href="/admin/blog/create">
                <button 
                    className="flex items-center gap-2 px-6 py-4 rounded-full bg-slate-900 text-white font-black shadow-2xl shadow-slate-900/40 hover:bg-teal-600 hover:scale-105 active:scale-95 transition-all group"
                >
                    <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Create New Post</span>
                    <Plus className="w-4 h-4 ml-1 opacity-50" />
                </button>
            </Link>
        </div>
    );
}
