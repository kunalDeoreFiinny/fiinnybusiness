"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogService, BlogPost } from '@/lib/blog-service';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Globe, FileText, Send } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPost() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Arjun Tanpure',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '5 min read',
        categories: '',
        published: true,
        coverImage: '',
        videoUrl: '',
        seoTitle: '',
        seoDescription: '',
        keywords: ''
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        setFormData({ ...formData, title, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const postData: Omit<BlogPost, 'id' | 'createdAt'> = {
                ...formData,
                categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
            };

            await BlogService.createPost(postData);
            router.push('/portal/blogs');
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create blog post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex items-center gap-6">
                <Link 
                    href="/portal/blogs"
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-100 transition-all font-bold group shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">New Article</h1>
                    <p className="text-lg text-slate-500 font-medium">Craft a new story for the Fiinny community.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm space-y-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Title</label>
                            <input 
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="E.g., Why Privacy is the #1 Missing Feature..."
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-xl font-bold placeholder:text-slate-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Slug</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium">fiinny.com/blog/</div>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-32 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Author</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Excerpt</label>
                            <textarea 
                                rows={3}
                                required
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Short summary that appears on the search results..."
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-medium resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Content (HTML)</label>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500">HTML SUPPORTED</span>
                            </div>
                            <textarea 
                                rows={15}
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write your masterpiece... use <p>, <h2>, <strong> etc."
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] px-8 py-8 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-medium resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar / Settings */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold">Publishing</h3>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <span className="font-bold">Status</span>
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, published: false})}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${!formData.published ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                                >
                                    Draft
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, published: true})}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${formData.published ? 'bg-teal-500 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                                >
                                    Live
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cover Image URL</label>
                            <input 
                                type="text"
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                placeholder="/assets/blog/image.png"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-medium text-sm text-teal-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Video URL (Insta/LinkedIn Style)</label>
                            <input 
                                type="text"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                placeholder="Raw .mp4 link or YouTube URL"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 transition-all font-medium text-sm text-teal-100"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-500 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-teal-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-teal-500/30"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Publish Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">SEO Meta</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">SEO Title</label>
                                <input 
                                    type="text"
                                    value={formData.seoTitle}
                                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">SEO Description</label>
                                <textarea 
                                    rows={3}
                                    value={formData.seoDescription}
                                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Keywords</label>
                                <input 
                                    type="text"
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    placeholder="privacy, security, india..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 ml-1">Comma separated</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
