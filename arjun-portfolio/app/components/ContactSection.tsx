"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, ArrowUpRight, Send, User, MessageSquare } from "lucide-react";

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="relative py-32 overflow-hidden bg-[hsl(var(--bg-base))]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Label */}
        <div className="mb-20 text-center">
          <span className="text-editorial">05 / dialogue</span>
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mt-8 mb-6 italic">
            Let's build <span className="text-[hsl(var(--primary))] not-italic">something meaningful.</span>
          </h2>
          <p className="text-lg text-[hsl(var(--text-secondary))] max-w-xl mx-auto leading-relaxed">
            Interested in product, systems, or early-stage strategy? 
            Always open to thoughtful conversations around building.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          {/* Social Links */}
          <div className="lg:col-span-5 space-y-4">
            {[
              { 
                label: "Email", 
                value: "arjun@fiinny.com", 
                href: "mailto:arjun@fiinny.com", 
                icon: Mail,
                color: "hsl(var(--primary))"
              },
              { 
                label: "LinkedIn", 
                value: "arjuntanpure", 
                href: "https://linkedin.com/in/arjuntanpure", 
                icon: User,
                color: "hsl(var(--accent))"
              },
              { 
                label: "X / Twitter", 
                value: "@arjuntanpure", 
                href: "https://twitter.com/arjuntanpure", 
                icon: MessageSquare,
                color: "hsl(var(--primary))"
              },
            ].map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-6 flex items-center justify-between group hover:bg-white/[0.02] border-[hsl(var(--border-subtle))]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--bg-muted))] flex items-center justify-center border border-[hsl(var(--border))] group-hover:scale-110 transition-transform">
                    <link.icon size={18} style={{ color: link.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))] font-bold mb-0.5">{link.label}</div>
                    <div className="text-white font-medium text-sm">{link.value}</div>
                  </div>
                </div>
                <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--text-muted))]" />
              </motion.a>
            ))}
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-7 glass-panel p-8 md:p-12 border-[hsl(var(--border-subtle))]"
          >
            {sent ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-6">
                  <Send size={24} className="text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Dispatched.</h3>
                <p className="text-[hsl(var(--text-secondary))]">I'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))] font-bold">Identity</label>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 text-white outline-none focus:border-[hsl(var(--primary))] transition-colors placeholder:text-[hsl(var(--text-muted))]/30"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))] font-bold">Terminal</label>
                    <input
                      required
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 text-white outline-none focus:border-[hsl(var(--primary))] transition-colors placeholder:text-[hsl(var(--text-muted))]/30"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))] font-bold">The Agenda</label>
                  <textarea
                    required
                    placeholder="What should we build together?"
                    rows={4}
                    className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 text-white outline-none focus:border-[hsl(var(--primary))] transition-colors resize-none placeholder:text-[hsl(var(--text-muted))]/30"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-premium btn-premium-primary w-full justify-center group"
                >
                  Synthesize Message
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
