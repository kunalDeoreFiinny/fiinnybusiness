"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bell, Brain } from "lucide-react";

const comingSoonFeatures = [
  {
    icon: Sparkles,
    title: "Smarter Insights",
    desc: "Predictive analysis for your spending.",
    color: "from-teal-500 to-emerald-600",
    tag: "In Development",
  },
  {
    icon: Bell,
    title: "Predictive Nudges",
    desc: "Avoid overspending before it happens.",
    color: "from-violet-500 to-indigo-600",
    tag: "Coming Q3",
  },
  {
    icon: Brain,
    title: "Context-aware Guidance",
    desc: "Financial advice that understands you.",
    color: "from-amber-500 to-orange-600",
    tag: "Coming Q4",
  },
];

export default function RoadmapSection({ onSelectVideo }: { onSelectVideo: (src: string | null) => void }) {
  return (
    <section id="fiinny-ai" className="py-24 bg-slate-900 text-white overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
            What&apos;s <span className="text-teal-400">coming next.</span>
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            We are just getting started. Here is what we are building now.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {comingSoonFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${feature.color}`} />

                <div className="p-8 flex flex-col h-full min-h-[280px]">
                  {/* Pulse tag */}
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    {feature.tag}
                  </span>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>

                  {/* Coming soon badge */}
                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      Coming Soon
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
