"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function VisionSection() {
  return (
    <section id="vision" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))] border-b border-[hsl(var(--border-subtle))]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Label */}
        <div className="mb-20">
          <span className="text-editorial">04 / vision</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 italic"
            >
              Building toward <span className="text-[hsl(var(--primary))] not-italic">something real</span>
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 text-[hsl(var(--text-secondary))] leading-relaxed text-lg"
            >
              <p>
                My long-term goal isn't a job title or a funding milestone. It's
                to build products that help people navigate money, decisions, and
                life with more clarity.
              </p>
              <p>
                I believe that the intersection of product thinking, systems
                design, and real-world business understanding is where the most
                valuable work gets built — and that's exactly where I want to
                operate.
              </p>
              <p>
                Fiinny is step one. The longer arc is about creating an ecosystem
                that makes complex life decisions simpler for the next generation of builders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <a href="#contact" className="btn-premium btn-premium-primary">
                Discuss Strategy
                <ArrowUpRight size={18} />
              </a>
            </motion.div>
          </div>

          {/* Vision Roadmap */}
          <div className="space-y-4">
            {[
              {
                title: "Near Horizon",
                phase: "Phase 01",
                desc: "Ship a product people love. Build Fiinny to a point where it genuinely improves financial clarity for real users.",
                color: "var(--primary)",
              },
              {
                title: "Compound Stage",
                phase: "Phase 02",
                desc: "Develop product intuition at scale. Combine first-principles thinking with real feedback loops.",
                color: "var(--accent)",
              },
              {
                title: "Company Building",
                phase: "Phase 03",
                desc: "Build systems at scale. Create products that reduce friction, improve decisions, and create real-world value.",
                color: "var(--primary)",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-8 border-[hsl(var(--border-subtle))] group hover:border-[hsl(var(--primary))]/30 transition-all"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-editorial opacity-100" style={{ color: `hsl(${item.color})` }}>{item.phase}</span>
                  <div className="w-1 h-1 rounded-full" style={{ background: `hsl(${item.color})` }} />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight text-white">{item.title}</h3>
                <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
