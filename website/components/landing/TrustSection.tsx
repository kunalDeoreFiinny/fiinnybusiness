"use client";

import React from "react";

export default function TrustSection() {
  const brands = ["Google", "Microsoft", "Amazon", "Spotify", "Uber"];

  return (
    <section className="py-32 relative overflow-hidden bg-slate-50">
      {/* Technical Background Grid */}
      <div className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/5 text-slate-600 text-[11px] font-bold uppercase tracking-widest mb-10 border border-slate-900/10">
            Handcrafted Software
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
            Built by engineers who <br />
            <span className="relative inline-block text-rose-600">
              hate broken money apps.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-rose-500/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Every interaction, every permission, every calculation is designed to respect your time, your money, and your privacy.
          </p>
        </div>

        {/* Logos in Glass Dock */}
        <div className="mb-20">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 opacity-70">
            Experience from teams that built systems for
          </p>

          <div className="inline-flex flex-wrap justify-center items-center gap-10 md:gap-16 bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-xl shadow-slate-200/50 rounded-[2.5rem] px-12 py-10 max-w-5xl mx-auto">
            {brands.map((brand) => (
              <span key={brand} className="text-2xl md:text-3xl font-black text-slate-400 hover:text-slate-900 transition-colors duration-500 cursor-default">{brand}</span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-sm font-medium text-slate-400">
            <div className="w-1 h-1 bg-teal-500 rounded-full" />
            Experience from companies where reliability isn’t optional.
          </div>
        </div>

        {/* Belief Statement */}
        <div className="max-w-2xl mx-auto pt-10 border-t border-slate-200/60">
          <p className="text-base text-slate-500 font-medium font-mono">
            <span className="text-slate-300 mr-2">//</span>
            "We believe financial software should work quietly, honestly, and in your favor."
          </p>
        </div>
      </div>
    </section>
  );
}
