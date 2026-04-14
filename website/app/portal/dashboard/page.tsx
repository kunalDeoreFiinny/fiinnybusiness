"use client";
import React, { useEffect, useState } from 'react';
import { BlogService } from '@/lib/blog-service';
import { EmployeeService } from '@/lib/services/EmployeeService';
import { FileText, Users, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortalDashboard() {
    const [stats, setStats] = useState({
        blogs: 0,
        employees: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [blogs, employees] = await Promise.all([
                    BlogService.getPosts(true),
                    EmployeeService.getEmployees()
                ]);
                setStats({
                    blogs: blogs.length,
                    employees: employees.length
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { 
            label: 'Total Blogs', 
            value: stats.blogs, 
            icon: <FileText className="w-6 h-6 text-teal-600" />, 
            bg: 'bg-teal-50',
            border: 'border-teal-100'
        },
        { 
            label: 'Active Employees', 
            value: stats.employees, 
            icon: <Users className="w-6 h-6 text-indigo-600" />, 
            bg: 'bg-indigo-50',
            border: 'border-indigo-100'
        },
        { 
            label: 'Growth', 
            value: '+12%', 
            icon: <TrendingUp className="w-6 h-6 text-emerald-600" />, 
            bg: 'bg-emerald-50',
            border: 'border-emerald-100'
        },
        { 
            label: 'Sys Status', 
            value: 'Healthy', 
            icon: <Clock className="w-6 h-6 text-amber-600" />, 
            bg: 'bg-amber-50',
            border: 'border-amber-100'
        },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
                <p className="text-lg text-slate-500 font-medium">Welcome to the Fiinny internal command center.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-6 rounded-[2rem] border ${card.border} ${card.bg} relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                            {card.icon}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                {card.icon}
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">{card.label}</p>
                            <h3 className="text-3xl font-black text-slate-900">
                                {loading ? '...' : card.value}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-2 h-2 rounded-full bg-teal-500 mt-2" />
                                <div>
                                    <p className="text-slate-800 font-bold">New Blog Post drafted</p>
                                    <p className="text-sm text-slate-500">2 hours ago by arjuntanpure</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
                    <h3 className="text-xl font-bold mb-4 relative z-10">Employee Portal v1.0</h3>
                    <p className="text-slate-400 mb-8 relative z-10 font-medium">Use the sidebar to manage content and users. This is an internal-only interface for Fiinny employees.</p>
                    <div className="flex gap-4 relative z-10">
                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-teal-400">
                            Secure
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-teal-400">
                            Internal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
