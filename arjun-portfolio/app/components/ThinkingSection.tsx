"use client";

import { motion } from "framer-motion";

const principles = [
  {
    number: "01",
    title: "Good products reduce friction, not add noise.",
    desc: "Most tools create new cognitive load while solving old problems. The best products have invisible complexity underneath a clear surface.",
  },
  {
    number: "02",
    title: "Systems shape behavior.",
    desc: "Incentives, defaults, and friction determine what people actually do — not what they intend to do. Build systems that align the two.",
  },
  {
    number: "03",
    title: "Financial clarity creates personal freedom.",
    desc: "When you understand your money, you make better decisions — not just about finance, but about time, risk, and how you live.",
  },
  {
    number: "04",
    title: "Simplicity is hard, deliberate work.",
    desc: "Simplicity is the result of ruthless editing — not a starting point. Real product taste is the ability to say no.",
  },
  {
    number: "05",
    title: "Execution is the differentiator.",
    desc: "Most ideas are not that unique. What separates outcomes is the quality of judgment and relentless follow-through.",
  },
  {
    number: "06",
    title: "Build for real behavior.",
    desc: "Human behavior is irrational and driven by emotion. Great products work with that reality, not against it.",
  },
];

const interests = [
  "Financial Clarity", "Systems Thinking", "Practical Tech",
  "Product Design", "Decision-Making", "Behavioral Science",
  "Execution", "Personal Finance",
];

export default function ThinkingSection() {
  return (
    <section id="thinking" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Label */}
        <div className="mb-20">
          <span className="text-editorial">02 / conviction</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-16 lg:gap-32 items-start">
          {/* Main: Principles */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 italic"
            >
              What I believe about <span className="text-[hsl(var(--primary))] not-italic">building</span>
            </motion.h2>

            <div className="space-y-4">
              {principles.map((p, i) => (
                <motion.div
                  key={p.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-panel p-8 border-[hsl(var(--border-subtle))] group hover:border-[hsl(var(--primary))]/30 transition-all"
                >
                  <div className="flex gap-8">
                    <div className="text-3xl font-black text-[hsl(var(--primary))] opacity-20 group-hover:opacity-100 transition-opacity leading-none">
                      {p.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-2 tracking-tight group-hover:text-[hsl(var(--primary))] transition-colors">{p.title}</h3>
                      <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar: Interests & Now */}
          <div className="space-y-6 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 border-[hsl(var(--border-subtle))]"
            >
              <div className="text-editorial mb-8 opacity-40">Areas of Deep Interest</div>
              <div className="flex flex-wrap gap-2">
                {interests.map((tag) => (
                  <span key={tag} className="tech-badge !text-[9px] !py-1 !px-3">{tag}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-8 border-[hsl(var(--border-subtle))]"
            >
              <div className="text-editorial mb-8 opacity-40">The Stack of Thoughts</div>
              <ul className="space-y-4">
                {[
                  "Mental models in financial behavior",
                  "Product-led growth in Fintech",
                  "Second-order design effects",
                  "Operational leverage engineering",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[hsl(var(--text-secondary))] group">
                    <span className="text-[hsl(var(--primary))] font-bold opacity-40 group-hover:opacity-100">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 bg-[hsl(var(--primary))]/5 border-[hsl(var(--primary))]/20"
            >
              <div className="tech-badge tech-badge-indigo mb-6">Currently (2025)</div>
              <div className="text-xl font-bold tracking-tighter mb-4 italic text-white">Execution Mode.</div>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                Building **Fiinny** full-time. Researching how to make personal finance feel less 
                intimidating and more like a tool for leverage.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
