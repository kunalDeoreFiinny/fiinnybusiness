"use client";

import { motion } from "framer-motion";

const groups = [
  {
    label: "Product & Strategy",
    color: "hsl(var(--primary))",
    skills: ["Product Thinking", "Systems Design", "Decision Logic", "Roadmapping"],
  },
  {
    label: "Business & Operations",
    color: "hsl(var(--accent))",
    skills: ["Optimization", "Stakeholder Management", "Execution", "Engagement"],
  },
  {
    label: "Technical & Analytical",
    color: "hsl(var(--primary))",
    skills: ["SQL", "Analytics", "Dashboard Thinking", "Financial Systems"],
  },
  {
    label: "Execution & Flow",
    color: "hsl(var(--accent))",
    skills: ["Leadership", "Implementation", "Coordination", "Delivery"],
  },
];

export default function StrengthsSection() {
  return (
    <section id="strengths" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))] border-y border-[hsl(var(--border-subtle))]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Label */}
        <div className="mb-20">
          <span className="text-editorial">03 / capability</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 italic">
              Where I'm <span className="text-[hsl(var(--primary))] not-italic">strongest</span>
            </h2>
            <p className="text-lg text-[hsl(var(--text-secondary))] max-w-xl leading-relaxed">
              Capabilities that emerged from years of real-world delivery — 
              distilled into the core assets I bring to every product and venture.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((g, i) => (
              <motion.div
                key={g.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-6 border-[hsl(var(--border-subtle))] hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
                  <div className="text-xs font-bold tracking-widest uppercase opacity-40">{g.label}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="tech-badge !text-[9px] !py-1"
                      style={{ color: g.color, borderColor: g.color + "33", background: g.color + "11" }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
