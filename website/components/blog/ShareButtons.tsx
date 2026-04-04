"use client";

import React from "react";
import { Twitter, Linkedin, Link as LinkIcon, Share2 } from "lucide-react";

interface ShareButtonsProps {
    title: string;
    slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
    const url = `https://fiinny.com/blog/${slug}`;
    
    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const shareToLinkedin = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        // Optional: show a toast
        alert("Link copied to clipboard!");
    };

    return (
        <div className="flex flex-wrap items-center gap-4 py-8 border-t border-b border-slate-100 my-12">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Article
            </span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={shareToTwitter}
                    className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all hover:scale-110"
                    aria-label="Share on Twitter"
                >
                    <Twitter className="w-5 h-5" />
                </button>
                <button 
                    onClick={shareToLinkedin}
                    className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all hover:scale-110"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin className="w-5 h-5" />
                </button>
                <button 
                    onClick={copyToClipboard}
                    className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all hover:scale-110"
                    aria-label="Copy Link"
                >
                    <LinkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
