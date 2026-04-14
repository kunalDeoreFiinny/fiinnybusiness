"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PieChart, Users, Trophy, Globe } from "lucide-react";

interface BentoFeaturesProps {
    onSelectFeature: (id: string | null) => void;
}

export default function BentoFeatures({ onSelectFeature }: BentoFeaturesProps) {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden" id="features">
      {/* Premium Background Glows */}
      <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-40 right-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Everything you need. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              All in one place.
            </span>
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed font-medium">
            Powerful tools wrapped in a stunning interface. Designed to make managing money feel effortless.
          </p>
        </div>

        {/* Advanced Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* CARD 1: Analytics */}
          <motion.div
            layoutId="analytics"
            onClick={() => onSelectFeature("analytics")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="md:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 overflow-hidden relative group cursor-pointer"
          >
            <div className="flex flex-col md:flex-row items-center justify-between h-full gap-8">
              <div className="relative z-10 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-6 border border-teal-100">
                  <PieChart className="w-3 h-3" /> Analytics
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  Know where every <br /> penny goes.
                </h3>
                <p className="text-slate-500 text-lg font-medium">Deep insights into your spending patterns.</p>
              </div>
              <div className="flex-1 w-full flex justify-center md:justify-end relative">
                <Image
                  src="/assets/images/3d-analytics.png"
                  alt="Analytics"
                  width={400}
                  height={400}
                  className="w-[80%] md:w-full max-w-[320px] h-auto object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 group-hover:-translate-y-2"
                />
              </div>
            </div>
          </motion.div>

          {/* CARD 2: Shared Finances */}
          <motion.div
            layoutId="shared"
            onClick={() => onSelectFeature("shared")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 bg-[#0F172A] rounded-[2.5rem] p-8 md:p-10 shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-500 overflow-hidden relative group text-white cursor-pointer border border-slate-800"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-slate-800/0 to-slate-900/80 pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md border border-white/10">
                <Users className="w-3 h-3" /> Shared Finances
              </div>
              <h3 className="text-2xl font-bold mb-2">Better Together.</h3>
              <p className="text-slate-400 mb-6 text-sm font-medium">Manage bills with your partner.</p>
              <div className="mt-auto">
                <Image
                  src="/assets/images/3d-couple.png"
                  alt="Couples"
                  width={250}
                  height={250}
                  className="w-44 h-auto drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                />
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Optimization */}
          <motion.div
            layoutId="goals"
            onClick={() => onSelectFeature("goals")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-500 overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-50/50 to-transparent" />
            <div className="relative z-10 h-full flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4 border border-amber-100">
                <Trophy className="w-3 h-3" /> Optimization
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Dream big.</h3>
              <p className="text-slate-500 mb-6 text-sm font-medium">Allocate for what matters.</p>
              <div className="mt-auto">
                <Image
                  src="/assets/images/3d-goals.png"
                  alt="Goals"
                  width={250}
                  height={250}
                  className="w-44 h-auto drop-shadow-xl transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110"
                />
              </div>
            </div>
          </motion.div>

          {/* CARD 4: Global */}
          <motion.div
            layoutId="global"
            onClick={() => onSelectFeature("global")}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2.5rem] p-10 md:p-12 shadow-xl shadow-teal-900/20 hover:shadow-2xl hover:shadow-teal-900/30 transition-all duration-500 overflow-hidden relative group text-white cursor-pointer"
          >
            <div className="flex flex-col md:flex-row items-center justify-between h-full gap-8 relative z-10">
              <div className="flex-1 order-2 md:order-1 flex justify-center md:justify-start">
                <Image
                  src="/assets/images/3d-network.png"
                  alt="Global"
                  width={400}
                  height={400}
                  className="w-[80%] md:w-full max-w-[320px] h-auto object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-12"
                />
              </div>
              <div className="flex-1 order-1 md:order-2 text-center md:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md border border-white/20">
                  <Globe className="w-3 h-3" /> Global
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  Your money, <br /> without borders.
                </h3>
                <p className="text-teal-50 text-lg font-medium">Track in multiple currencies with total privacy.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
