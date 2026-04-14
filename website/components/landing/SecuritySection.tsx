"use client";

import React from "react";
import { Shield, EyeOff, Smartphone } from "lucide-react";

export default function SecuritySection() {
  return (
    <section className="pb-32 pt-20 bg-slate-900 border-t border-slate-800 text-white overflow-hidden">
      <div className="w-full px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Your money. Secured & Synced.</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-lg">
            We use bank-grade encryption to keep your financial life private, secure, and available across all your devices.
          </p>
          <p className="text-teal-400 text-sm font-bold bg-teal-900/30 inline-block px-5 py-2.5 rounded-full border border-teal-800 tracking-wide">
            Encrypted in transit. Encrypted at rest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-800 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <span className="text-teal-500 font-bold block bg-teal-500/10 p-3 rounded-2xl"><Shield className="w-8 h-8" /></span>
              <span className="text-xs font-mono text-teal-500/50 uppercase tracking-wider">Standard: AES-256</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Bank-Grade Security</h3>
            <p className="text-slate-400 leading-relaxed text-base">
              Your data is protected with the same encryption standards used by banks. We prioritize your security above everything else.
              <br /><span className="text-slate-600 block mt-4 text-xs font-bold uppercase tracking-widest">Safe & Sound</span>
            </p>
          </div>

          <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-800 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <span className="text-teal-500 font-bold block bg-teal-500/10 p-3 rounded-2xl"><EyeOff className="w-8 h-8" /></span>
              <span className="text-xs font-mono text-teal-500/50 uppercase tracking-wider">Model: Private</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">We Don&apos;t Sell Data</h3>
            <p className="text-slate-400 leading-relaxed text-base">
              Our business model is simple: we sell software, not personal data. Your financial habits are your business, not ours.
            </p>
          </div>

          <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-800 hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <span className="text-teal-500 font-bold block bg-teal-500/10 p-3 rounded-2xl"><Smartphone className="w-8 h-8" /></span>
              <span className="text-xs font-mono text-teal-500/50 uppercase tracking-wider">Access: 24/7</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Always Available</h3>
            <p className="text-slate-400 leading-relaxed text-base">
              Because your data is securely synced, your financial picture is always up to date, on every device you own. Do not worry about backups.
            </p>
          </div>
        </div>

        {/* Privacy Foundation Footer */}
        <div className="mt-20 text-center">
          <p className="text-slate-600 text-sm font-bold uppercase tracking-[0.2em]">
            Privacy isn’t a feature at Fiinny. It’s the foundation.
          </p>
        </div>
      </div>
    </section>
  );
}
