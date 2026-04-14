"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Code, User, Mail } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="mesh-gradient opacity-60" />
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Content */}
          <div className="lg:col-span-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4 items-center"
            >
              <a href="#fiinny" className="btn-premium btn-premium-primary">
                View Flagship Venture
                <ArrowUpRight size={16} />
              </a>
              <div className="flex items-center gap-3 ml-2">
                {[
                  { icon: Code, href: "#", color: "hover:text-white" },
                  { icon: User, href: "#", color: "hover:text-blue-400" },
                  { icon: Mail, href: "#", color: "hover:text-[hsl(var(--primary))]" },
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.href} 
                    className={`p-2 text-[hsl(var(--text-muted))] transition-colors ${social.color}`}
                  >
                    <social.icon size={20} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Portrait/Decorative Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="glass-panel p-2 aspect-[4/5] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--bg-base))] to-transparent z-10 opacity-60" />
              <div className="w-full h-full bg-[hsl(var(--bg-muted))] flex items-center justify-center relative overflow-hidden rounded-[20px]">
                {/* Placeholder for real portrait */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 opacity-40 group-hover:scale-105 transition-transform duration-700" />
                <div className="z-20 text-center px-10">
                  <div className="tech-badge tech-badge-indigo mb-4">Founder State</div>
                  <div className="text-4xl font-bold tracking-tighter italic">Execution &<br/>Principles</div>
                </div>
              </div>
              
              {/* Orbital detail */}
              <div className="absolute -top-10 -right-10 w-32 h-32 border border-[hsl(var(--border))] rounded-full animate-[spin_10s_linear_infinite] opacity-30" />
            </div>
          </motion.div>
        </div>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 pt-12 border-t border-[hsl(var(--border-subtle))]"
        >
          <div className="text-editorial mb-8 opacity-40">Previous Impact & Associations</div>
          <div className="flex flex-wrap items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            {["EY", "HighRadius", "Reliance", "Accenture", "TCS"].map((brand) => (
              <span key={brand} className="text-2xl font-display font-black tracking-tighter">{brand}</span>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Grain */}
      <div className="grain-overlay" />
    </section>
  );
}
