"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Label */}
        <div className="mb-20">
          <span className="text-editorial">01 / identity</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          {/* Left: story */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold leading-tight mb-12 tracking-tighter italic"
            >
              Engineer who learned how <span className="text-[hsl(var(--primary))] not-italic">broken systems</span> actually work.
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-8 text-[hsl(var(--text-secondary))] leading-relaxed text-lg"
            >
              <p>
                My path started in engineering — a structured way of seeing the
                world through systems, constraints, and cause-and-effect. That
                lens has never left me.
              </p>
              <p>
                Over 3.5 years working in consulting and implementation, I got
                an unfiltered view into how large organizations actually
                operate: the complexity underneath the surface, the workflows
                that break under pressure.
              </p>
              <p>
                I worked with global clients, led end-to-end project
                executions, and built a deep understanding of where business operations, 
                data, and finance intersect — and where people consistently struggle.
              </p>
              <div className="pt-6">
                <div className="tech-badge tech-badge-indigo mb-4">the core insight</div>
                <p className="text-white font-medium italic">
                  "The best products come from people who have lived the
                  problem — not just studied it. I build from that principle."
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: evolution timeline */}
          <div className="relative">
            <div className="text-editorial mb-12 opacity-40 italic">the chronological arc</div>

            <div className="space-y-12 relative">
              {/* Vertical line detail */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-[hsl(var(--border))] via-[hsl(var(--primary))]/30 to-transparent" />

              {[
                {
                  year: "2018–2021",
                  title: "Engineering Foundation",
                  desc: "Built the mental model: systems thinking and analytical rigor.",
                  badge: "Systems"
                },
                {
                  year: "2021–2024",
                  title: "Operator & Implementor",
                  desc: "Consulting for global clients. Learned where real complexity lives.",
                  badge: "Execution"
                },
                {
                  year: "2025 →",
                  title: "Founder Mode",
                  desc: "Building Fiinny — a personal finance product rooted in real-world insight.",
                  badge: "Building",
                  accent: true
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="pl-10 relative group"
                >
                  <div className={`absolute left-[-4px] top-2 w-2 h-2 rounded-full transition-all duration-500 ${item.accent ? "bg-[hsl(var(--primary))] scale-125 shadow-[0_0_10px_hsla(var(--primary),0.5)]" : "bg-[hsl(var(--border))] group-hover:bg-[hsl(var(--text-muted))]"}`} />
                  
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-[hsl(var(--primary))] tracking-widest">{item.year}</span>
                    <span className="tech-badge !text-[9px] !py-0.5 !px-2">{item.badge}</span>
                  </div>
                  
                  <h4 className={`text-xl font-bold mb-2 tracking-tight ${item.accent ? "text-white" : "text-[hsl(var(--text-secondary))]"}`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed max-w-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Philosophy Glass Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="glass-panel p-8 mt-16 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/30 transition-colors"
            >
              <div className="text-editorial mb-4 opacity-100">current conviction</div>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                Bridging the gap between <span className="text-white">technical systems</span> and 
                <span className="text-white italic"> human behavior</span> to build tools that actually change lives.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
