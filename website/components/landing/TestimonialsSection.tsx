"use client";

import React from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      initial: "A",
      name: "Arjun V.",
      role: "Startup Founder",
      text: '"As a founder, I need to know my burn rate instantly. Fiinny is the only app that gives me that clarity without the manual spreadsheet work. It just clicks."',
      bg: "bg-indigo-100",
      textCol: "text-indigo-600"
    },
    {
      initial: "S",
      name: "Sarah K.",
      role: "Digital Nomad",
      text: '"I earn in USD but spend in INR and EUR. Fiinny handles the multi-currency conversion automatically. It’s a lifesaver for my taxes."',
      bg: "bg-rose-100",
      textCol: "text-rose-600"
    },
    {
      initial: "R",
      name: "Rahul M.",
      role: "Sovereign Individual",
      text: '"I deleted Mint because of the ads. I deleted heavy bank apps because they are slow. Fiinny is fast, private, and actually respects my data."',
      bg: "bg-teal-100",
      textCol: "text-teal-600"
    }
  ];

  return (
    <section className="py-32 bg-white border-t border-slate-100">
      <div className="w-full px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6 border border-teal-100">
            Community Stories
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Money management for people <br /> who <span className="text-teal-600">take it seriously.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-1 text-amber-500 mb-6">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-slate-700 font-medium leading-relaxed mb-8 relative z-10">
                {t.text}
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${t.bg} ${t.textCol} flex items-center justify-center font-bold text-lg`}>
                  {t.initial}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
