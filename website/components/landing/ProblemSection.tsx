"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProblemSection() {
  return (
    <section className="pt-48 pb-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 font-display tracking-tight leading-tight">
            Chaos costs <span className="text-rose-500">you money.</span> <br />
            Clarity builds <span className="text-teal-600">wealth.</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
            Most finance apps make you work for clarity. <br className="hidden md:block" />
            Fiinny works quietly in the background—automating, organizing, and protecting your money by default.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto">
          {/* The Chaos Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-bold text-2xl text-slate-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-500 text-lg">⚠</span>
              The Chaos <span className="text-sm font-normal text-slate-400 ml-auto">(Most Apps)</span>
            </h3>
            <ul className="space-y-5">
              {[
                "Manual entry that feels like homework",
                "Your data sold, shared, or monetized",
                "Monthly summaries that miss daily reality",
                "Hard limits on your own data",
                "Public by default"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-600 text-base font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* The Clarity Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-slate-900 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ring-1 ring-teal-500/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            
            <h3 className="font-bold text-2xl text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              The Clarity <span className="text-sm font-normal text-slate-400 ml-auto">(Fiinny)</span>
            </h3>
            <ul className="space-y-5 relative z-10">
              {[
                "Auto-capture transactions in real-time",
                "Zero-knowledge privacy architecture",
                "Insights that predict your future cash",
                "Unlimited freedom to track and split",
                "Private by design"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-teal-50/90 text-base font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
