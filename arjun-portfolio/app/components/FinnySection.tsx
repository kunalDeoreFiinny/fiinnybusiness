"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  Target, 
  Lightbulb, 
  ArrowUpRight,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Intelligence Layer",
    desc: "A unified view of capital flow, net worth, and efficiency metrics — updated in real-time.",
    color: "var(--primary)",
  },
  {
    icon: Target,
    title: "Precision Goals",
    desc: "Algorithmic pathfinding for long-term wealth targets. Clarity on every rupee saved.",
    color: "var(--accent)",
  },
  {
    icon: Lightbulb,
    title: "Cognitive Insights",
    desc: "Harnessing behavioral data to identify spending anomalies and optimize allocation.",
    color: "var(--primary)",
  },
];

export default function FinnySection() {
  return (
    <section id="fiinny" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-24">
          <div>
            <div className="tech-badge mb-6">Flagship Venture</div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 italic">
              Fiinny<span className="text-[hsl(var(--primary))] not-italic">.</span>
            </h2>
            <p className="text-xl text-[hsl(var(--text-secondary))] max-w-xl leading-relaxed">
              Financial visibility designed for practitioners. Not just a tracker, 
              but a system for mapping your financial trajectory with precision and empathy.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <a 
              href="https://fiinny.com" 
              target="_blank" 
              className="btn-premium btn-premium-primary"
            >
              Enter the Ecosystem
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>

        {/* 3D Glass Dashboard Mockup */}
        <div className="relative mb-32 perspective-1000">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateX: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="glass-panel p-8 md:p-12 relative overflow-hidden min-h-[500px] border-[hsl(var(--border))] group"
          >
            {/* Background Detail */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1611974717482-45e0766289ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--bg-surface))/80] to-[hsl(var(--bg-base))/95] z-0" />

            <div className="relative z-10 grid md:grid-cols-12 gap-8 h-full">
              
              {/* Left Column: Data Cards */}
              <div className="md:col-span-4 space-y-4">
                {[
                  { label: "Net Asset Value", value: "₹4,28,750", trend: "+12.4%" },
                  { label: "Efficiency Score", value: "88/100", trend: "+2.1%" },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="glass-panel !rounded-2xl p-6 border-[hsl(var(--border-subtle))] bg-white/5"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))] mb-2 font-bold">{stat.label}</div>
                    <div className="text-3xl font-bold tracking-tight mb-2">{stat.value}</div>
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] flex items-center gap-1">
                      <TrendingUp size={12} /> {stat.trend} <span className="text-[hsl(var(--text-muted))] font-normal">this cycle</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right Column: Main Visualization */}
              <div className="md:col-span-8">
                <div className="glass-panel !rounded-2xl p-8 border-[hsl(var(--border-subtle))] bg-white/5 h-full min-h-[300px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-editorial">trajectory optimization</div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--border))]" />
                    </div>
                  </div>
                  
                  {/* Abstract Graph Representation */}
                  <div className="flex-1 flex items-end gap-3 mt-4">
                    {[40, 60, 45, 80, 55, 90, 75, 95, 85, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.05, ease: "easeOut" }}
                        className={`flex-1 rounded-t-lg transition-colors duration-500 ${
                          i === 9 ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]/50 group-hover:bg-[hsl(var(--border))]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between text-[10px] text-[hsl(var(--text-muted))] uppercase font-bold tracking-widest">
                    <span>Alpha Stage</span>
                    <span>Q1 Release</span>
                    <span>Iteration 04</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Float Detail */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[hsl(var(--primary))]/10 blur-[100px] rounded-full pointer-events-none" />
          </motion.div>
        </div>

        {/* Modular Strengths (Bento Style) */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--primary))]/30"
            >
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--bg-muted))] flex items-center justify-center mb-6 border border-[hsl(var(--border))] group-hover:scale-110 transition-transform">
                <f.icon size={22} className="text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight">{f.title}</h3>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed text-sm">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="inline-block glass-panel px-8 py-4 !rounded-full text-sm italic text-[hsl(var(--text-muted))]">
            "We are not just calculating numbers, we are mapping life as it unfolds."
          </div>
        </motion.div>
      </div>
    </section>
  );
}
