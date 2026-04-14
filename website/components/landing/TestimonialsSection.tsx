"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    initial: "A",
    name: "Arjun V.",
    role: "Startup Founder",
    source: "App Store",
    sourceUrl: "https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482",
    date: "March 2026",
    text: '"As a founder, I need to know my burn rate instantly. Fiinny is the only app that gives me that clarity without the manual spreadsheet work. It just clicks."',
    bg: "bg-indigo-100",
    textCol: "text-indigo-600",
    stars: 5,
  },
  {
    initial: "S",
    name: "Sarah K.",
    role: "Digital Nomad",
    source: "Play Store",
    sourceUrl: "https://play.google.com/store/apps/details?id=com.KaranArjunTechnologies.lifemap",
    date: "February 2026",
    text: '"I earn in USD but spend in INR and EUR. Fiinny handles the multi-currency conversion automatically. It\'s a lifesaver for my taxes."',
    bg: "bg-rose-100",
    textCol: "text-rose-600",
    stars: 5,
  },
  {
    initial: "R",
    name: "Rahul M.",
    role: "Privacy Advocate",
    source: "App Store",
    sourceUrl: "https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482",
    date: "January 2026",
    text: '"I deleted Mint because of the ads. I deleted heavy bank apps because they are slow. Fiinny is fast, private, and actually respects my data."',
    bg: "bg-teal-100",
    textCol: "text-teal-600",
    stars: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-32 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6 border border-teal-100">
            Community Stories
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Money management for people <br /> who <span className="text-teal-600">take it seriously.</span>
          </h2>

          {/* Aggregate rating badge */}
          <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-full px-5 py-2 mx-auto mt-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-sm font-bold text-amber-800">4.8 / 5</span>
            <span className="text-xs text-amber-600 font-medium">on App Store & Play Store</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>

              {/* Quote */}
              <p className="text-slate-700 font-medium leading-relaxed mb-8 flex-1 relative z-10">
                {t.text}
              </p>

              {/* Author row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${t.bg} ${t.textCol} flex items-center justify-center font-bold text-lg shrink-0`}>
                    {t.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.role}</span>
                  </div>
                </div>

                {/* Verified source badge */}
                <a
                  href={t.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors border border-slate-200 rounded-full px-2 py-1 shrink-0"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  {t.source}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Store links */}
        <div className="mt-16 flex flex-wrap gap-4 justify-center">
          <a
            href="https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            ⭐ Rate us on App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.KaranArjunTechnologies.lifemap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors"
          >
            ⭐ Rate us on Play Store
          </a>
        </div>
      </div>
    </section>
  );
}
