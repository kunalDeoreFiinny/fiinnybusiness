import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogService, BlogPost } from "@/lib/blog-service";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import type { Metadata } from 'next';
import ShareButtons from "@/components/blog/ShareButtons";
import BlogAd from "@/components/blog/BlogAd";

interface PageProps {
    params: Promise<{
        slug: string;
    }>
}

export async function generateStaticParams() {
    try {
        const posts = await BlogService.getPosts();
        return posts.map((post) => ({
            slug: post.slug,
        }));
    } catch (e) {
        console.error("Error generating static params", e);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = await BlogService.getPostBySlug(slug);
        if (!post) return { title: 'Post Not Found | Fiinny' };

        return {
            title: post.seoTitle || `${post.title} | Fiinny Blog`,
            description: post.seoDescription || post.excerpt,
            openGraph: post.coverImage ? {
                images: [post.coverImage],
                type: 'article',
                publishedTime: new Date(post.date).toISOString(),
                authors: [post.author],
            } : undefined
        };
    } catch (e) {
        return { title: 'Fiinny Blog' };
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await BlogService.getPostBySlug(slug);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                    <Link href="/blog" className="text-teal-600 hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Return to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage ? [`https://fiinny.com${post.coverImage}`] : [],
        datePublished: new Date(post.date).toISOString(),
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Fiinny',
            logo: {
                '@type': 'ImageObject',
                url: 'https://fiinny.com/icon.png',
            },
        },
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Reading Progress Bar Island (Minimalist) */}
            <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
                <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 w-0" id="reading-progress" />
            </div>

            {/* Split Island Navigation */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 pointer-events-none">
                <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <Link href="/blog" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 transition-colors font-bold text-sm group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[3px]" />
                        Back to Articles
                    </Link>
                </div>
                <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden">
                            <Image src="/assets/images/logo_icon.png" alt="Fiinny" fill className="object-cover" />
                        </div>
                        <span className="text-xl font-black text-teal-950 tracking-tight group-hover:text-teal-700 transition-colors">Fiinny</span>
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto px-4 max-w-4xl pt-40 pb-32">
                {/* Article Header */}
                <header className="mb-16">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-[0.2em] mb-8">
                        {post.categories.map(cat => (
                            <span key={cat} className="text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">
                                {cat}
                            </span>
                        ))}
                        <span className="text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-16 p-4 rounded-[2rem] bg-slate-50 border border-slate-100 w-fit">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 overflow-hidden relative border-2 border-white shadow-sm">
                            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-lg">
                                {post.author[0]}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-900 font-black text-sm uppercase tracking-wider">{post.author}</div>
                            <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />
                                {post.date}
                            </div>
                        </div>
                    </div>

                    {post.coverImage && (
                        <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 group">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                priority
                            />
                        </div>
                    )}
                </header>

                {/* Article Content */}
                <article className="prose prose-xl prose-slate mx-auto prose-headings:font-black prose-headings:tracking-tight prose-a:text-teal-600 prose-a:font-black prose-a:no-underline hover:prose-a:text-teal-700 prose-img:rounded-[2rem] prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium">
                    <div
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>

                {/* Article Ad Unit */}
                <BlogAd slot="unique-article-slot-id" format="horizontal" />

                {/* Viral Share Bar */}
                <ShareButtons title={post.title} slug={post.slug} />

                {/* Footer Engagement */}
                <div className="text-center mt-20 p-12 bg-teal-900 rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                    <h3 className="text-3xl font-black text-white mb-6 tracking-tight relative z-10 text-balance">
                        Ready to take control <br /> of your financial footprint?
                    </h3>
                    <Link 
                        href="/login" 
                        className="inline-flex items-center justify-center px-10 py-4 text-lg font-black text-teal-950 bg-white rounded-full hover:bg-teal-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-teal-950/20 relative z-10"
                    >
                        Try Fiinny for Free
                    </Link>
                </div>
            </main>
        </div>
    );
}
