"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Clock } from "lucide-react";
import { BlogPost } from "@/lib/blog-service";

import BlogAd from "@/components/blog/BlogAd";

interface BlogSearchProps {
    initialPosts: BlogPost[];
}

export default function BlogSearch({ initialPosts }: BlogSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = initialPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-20 relative z-10">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-full bg-white border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-xl shadow-slate-200/40 font-medium text-slate-700 placeholder:text-slate-400"
                    />
                    <Search className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-teal-600 transition-colors" />
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
                    No posts found matching your search.
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                        <React.Fragment key={post.slug}>
                            {/* Insert Ad after the 3rd post (index 2) */}
                            {index === 3 && (
                                <div className="md:col-span-2 lg:col-span-3">
                                    <BlogAd format="horizontal" className="mb-8" />
                                </div>
                            )}
                            <Link href={`/blog/${post.slug}`} className="group">
                                <article className="h-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 flex flex-col relative z-0">
                                    {post.coverImage && (
                                        <div className="h-56 overflow-hidden bg-slate-100 relative">
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60 pointer-events-none" />
                                        </div>
                                    )}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {post.categories.map(cat => (
                                                <span key={cat} className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-teal-700 transition-colors leading-tight">
                                            {post.title}
                                        </h2>
                                        <p className="text-slate-500 mb-8 flex-1 line-clamp-3 leading-relaxed font-medium">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center text-xs font-bold text-slate-400 gap-6 mt-auto pt-6 border-t border-slate-50 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {post.date}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {post.readTime}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </>
    );
}
