"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    role: "Implementation & Consulting",
    company: "EY",
    period: "2023 – 2025",
    type: "Advisory & Delivery",
    points: [
      "Led end-to-end project lifecycles across multiple global clients",
      "Managed cross-functional stakeholder collaboration and onsite client engagements",
      "Drove process analysis, automation-focused implementations, and business transformation",
      "Developed deep understanding of enterprise workflows and where complexity breaks down",
    ],
    tag: "Consulting",
  },
  {
    role: "Implementation Analyst",
    company: "HighRadius",
    period: "2021 – 2023",
    type: "Fintech / SaaS Implementation",
    points: [
      "Implemented AI-powered fintech SaaS solutions for enterprise clients",
      "Managed full project delivery from scoping through go-live",
      "Worked directly with finance teams on process redesign and system adoption",
      "Built expertise in financial operations, AR/AP processes, and analytics",
    ],
    tag: "Fintech",
  },
];

export default function ExperienceSection() {
  return (
    <section id="work" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-20">
          <div className="tech-badge tech-badge-indigo mb-6">Archive & Experience</div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Built through <span className="italic">real-world</span> execution.
          </h2>
          <p className="text-[hsl(var(--text-secondary))] max-w-2xl text-lg leading-relaxed">
            Before building products, I spent 3.5+ years inside complex business environments — 
            learning how organizations operate, where systems break, and what execution actually looks like.
          </p>
        </div>

        {/* Experience Grid */}
        <div className="space-y-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 md:p-12 hover:bg-white/[0.02]"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="lg:max-w-md">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-editorial">{exp.company}</span>
                    <div className="w-1 h-1 rounded-full bg-[hsl(var(--text-muted))]" />
                    <span className="text-editorial text-[hsl(var(--primary))]">{exp.period}</span>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-4">{exp.role}</h3>
                  <div className="tech-badge mb-6">{exp.type}</div>
                </div>

                <div className="flex-1 lg:pl-12 lg:border-l border-[hsl(var(--border-subtle))]">
                  <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                    {exp.points.map((point, j) => (
                      <li key={j} className="flex gap-4 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed group-hover:text-white transition-colors">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Education Callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-6 glass-panel p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-dashed border-[hsl(var(--border))]"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--bg-muted))] flex items-center justify-center font-bold text-xl">🎓</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[hsl(var(--text-muted))] mb-1 font-bold">Foundation</div>
              <div className="text-xl font-bold">Bachelor of Engineering</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">Computer Engineering · Class of 2021</div>
            </div>
          </div>
          <div className="text-sm text-[hsl(var(--text-muted))] md:text-right italic max-w-xs">
            "Engineering foundation that shaped a systems-first way of thinking about every problem."
          </div>
        </motion.div>
      </div>
    </section>
  );
}
