"use client";

import React, { useEffect, useRef } from "react";

interface AdProps {
    slot?: string;
    format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
    className?: string;
}

/**
 * Reusable AdSense component for manual ad placement.
 * Only renders if not in development to avoid policy violations.
 */
export default function BlogAd({ slot = "3087779657", format = "auto", className = "" }: AdProps) {
    const adRef = useRef<HTMLModElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined" && !hasInitialized.current) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                hasInitialized.current = true;
            } catch (err) {
                console.error("AdSense error:", err);
            }
        }
    }, []);

    return (
        <div className={`my-12 flex justify-center overflow-hidden w-full ${className}`}>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 text-center w-full">
                Advertisement
            </div>
            {/* The Ad Unit */}
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: "block", minWidth: "250px", minHeight: "90px" }}
                data-ad-client="ca-pub-3087779657197986"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
