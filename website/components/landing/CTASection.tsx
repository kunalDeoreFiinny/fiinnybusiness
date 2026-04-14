"use client";

import React from "react";
import Link from "next/link";

export default function CTASection() {
  return (
    <div className="text-center max-w-4xl mx-auto mb-32 relative z-10">
      <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tight mb-8">
        Ready to master <br /> <span className="text-teal-400">your money?</span>
      </h2>
      <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
        Join thousands of users who have taken control of their financial life with Fiinny. Free forever for individuals.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-950 transition-all duration-200 bg-white rounded-full hover:bg-teal-400 hover:scale-105 active:scale-95 min-w-[200px]"
        >
          Get Started Now
        </Link>
        <Link
          href="/how-it-works"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 min-w-[200px]"
        >
          View Demo
        </Link>
      </div>
    </div>
  );
}
