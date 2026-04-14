"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Fiinny", href: "#fiinny" },
  { label: "Thinking", href: "#thinking" },
  { label: "Background", href: "#work" },
  { label: "Vision", href: "#vision" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "pt-4" : "pt-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className={`flex items-center justify-between transition-all duration-500 px-6 h-14 ${
            scrolled 
              ? "glass-panel rounded-full shadow-2xl shadow-black/20" 
              : "bg-transparent h-20"
          }`}
        >
          {/* Logo */}
          <a href="#hero" className="font-display font-bold text-white text-xl tracking-tighter hover:opacity-80 transition-opacity">
            Arjun<span className="text-[hsl(var(--primary))]">.</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium transition-all duration-300 text-[hsl(var(--text-secondary))] hover:text-white relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[hsl(var(--primary))] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#contact" className="btn-premium btn-premium-primary !py-2 !px-5 !text-[13px]">
              Discuss Project
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 text-[hsl(var(--text-secondary))] hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[hsl(var(--bg-surface))] border-b border-[hsl(var(--border))]"
          >
            <div className="px-6 py-8 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-lg font-medium text-[hsl(var(--text-secondary))] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4">
                <a href="#contact" className="btn-premium btn-premium-primary w-full justify-center">
                  Discuss Project
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
