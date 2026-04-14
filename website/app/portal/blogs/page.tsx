"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogService, BlogPost } from '@/lib/blog-service';
import { Plus, Edit, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortalBlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        const data = await BlogService.getPosts(true); // Include drafts
        setPosts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
            try {
                await BlogService.deletePost(id);
                fetchPosts();
            } catch (error) {
                alert("Failed to delete post");
            }
        }
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Blog Management</h1>
                    <p className="text-lg text-slate-500 font-medium">Create and manage your articles on the main website.</p>
                </div>
                <Link
                    href="/portal/blogs/create"
                    className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-teal-500/20"
                >
                    <Plus className="w-5 h-5" />
                    New Article
                </Link>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 text-center">
                        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching articles...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
                        <p className="text-slate-500 font-medium mb-8">Start by creating your first blog post.</p>
                        <Link
                            href="/portal/blogs/create"
                            className="text-teal-600 font-bold hover:underline"
                        >
                            Create Article →
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                                <th className="px-8 py-5">Article Details</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Author</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPosts.map((post, idx) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={post.id} 
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                                            {post.title}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            /{post.slug}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            post.published 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                                        {post.author}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-400">
                                        {post.date}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-all"
                                                title="View Live"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={`/portal/blogs/${post.id}/edit`}
                                                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => post.id && handleDelete(post.id)}
                                                className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
