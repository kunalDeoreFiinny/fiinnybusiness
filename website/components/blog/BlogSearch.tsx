"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { BlogPost } from "@/lib/blog-service";
import BlogAd from "@/components/blog/BlogAd";

interface BlogSearchProps {
    initialPosts: BlogPost[];
}

export default function BlogSearch({ initialPosts }: BlogSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = initialPosts.filter(post =>
        (post.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (post.categories || []).some(c => (c?.toLowerCase() || "").includes(searchQuery.toLowerCase())) ||
        (post.author?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (post.excerpt?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="max-w-2xl mx-auto relative z-10 space-y-12 pb-24">
            {/* Search Bar */}
            <div className="sticky top-24 z-20 bg-slate-50/80 backdrop-blur-xl pb-6">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search posts..."
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
                <div className="space-y-6">
                    {filteredPosts.map((post, index) => {
                        const ytId = post.videoUrl ? getYoutubeId(post.videoUrl) : null;
                        
                        return (
                            <React.Fragment key={post.id || post.slug}>
                                {/* Insert Ad after the 2nd post */}
                                {index === 2 && (
                                    <div className="w-full">
                                        <BlogAd format="horizontal" className="mb-6" />
                                    </div>
                                )}
                                
                                <article className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative z-0">
                                    {/* Post Header */}
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-black shadow-inner">
                                                {post.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 leading-tight">{post.author}</h3>
                                                <p className="text-xs text-slate-500 font-medium">{post.date} • {post.readTime}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Post Text Content */}
                                    <Link href={`/blog/${post.slug}`} className="block px-6 pb-4 group-hover:bg-slate-50/50 transition-colors">
                                        {post.title && (
                                            <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">{post.title}</h4>
                                        )}
                                        <p className="text-slate-700 leading-relaxed font-medium">
                                            {post.excerpt}
                                        </p>
                                        {post.categories && post.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {post.categories.map(cat => (
                                                    <span key={cat} className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-1 rounded-md transition-colors">
                                                        #{cat}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Post Media (Image or Video) */}
                                    {(post.videoUrl || post.coverImage) && (
                                        <div className="w-full bg-slate-900 relative">
                                            {post.videoUrl && ytId ? (
                                                <div className="relative w-full pt-[56.25%]">
                                                    <iframe 
                                                        className="absolute inset-0 w-full h-full"
                                                        src={`https://www.youtube.com/embed/${ytId}`} 
                                                        title="YouTube video player" 
                                                        frameBorder="0" 
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            ) : post.videoUrl ? (
                                                <video 
                                                    controls 
                                                    className="w-full max-h-[600px] object-contain"
                                                    src={post.videoUrl}
                                                />
                                            ) : (
                                                <Link href={`/blog/${post.slug}`} className="block w-full">
                                                    <img 
                                                        src={post.coverImage} 
                                                        alt={post.title} 
                                                        className="w-full max-h-[600px] object-cover hover:opacity-90 transition-opacity"
                                                    />
                                                </Link>
                                            )}
                                        </div>
                                    )}

                                    {/* Post Action Footer */}
                                    <div className="px-6 py-4 border-t border-slate-50 flex items-center gap-6">
                                        <button className="flex items-center gap-2 text-slate-500 hover:text-rose-500 font-bold text-sm transition-colors group">
                                            <Heart className="w-5 h-5 group-hover:fill-rose-500 transition-all" />
                                            <span>Like</span>
                                        </button>
                                        <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 font-bold text-sm transition-colors">
                                            <MessageCircle className="w-5 h-5" />
                                            <span>Discuss</span>
                                        </Link>
                                        <button className="flex items-center gap-2 text-slate-500 hover:text-teal-500 font-bold text-sm transition-colors ml-auto">
                                            <Share2 className="w-5 h-5" />
                                            <span>Share</span>
                                        </button>
                                    </div>
                                </article>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
