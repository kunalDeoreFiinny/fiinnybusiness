"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { translations } from "@/app/i18n/translations";

export default function Navbar() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/#features", label: t.nav.features, isAnchor: true },
    { href: "/blog", label: "Blog" },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/loan-audit", label: "Loan Audit" },
    { href: "/trust", label: t.nav.trust },
    ...(!user ? [{ href: "/subscription", label: t.nav.pricing }] : []),
    { href: "/business", label: "Business" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 pointer-events-none"
      >
        {/* Left Island: Brand */}
        <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image src="/assets/images/logo_icon.png" alt="Fiinny" fill className="object-cover" />
            </div>
            <span className="text-xl font-black text-teal-950 tracking-tight group-hover:text-teal-700 transition-colors">Fiinny</span>
          </Link>
        </div>

        {/* Right Island: Navigation & Actions */}
        <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center gap-6 md:gap-8">
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              link.isAnchor
                ? <a key={link.href} href={link.href} className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">{link.label}</a>
                : <Link key={link.href} href={link.href} className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">{link.label}</Link>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login" className="hidden sm:block bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20">
                Get Started
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-24 left-4 right-4 z-50 bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden lg:hidden"
            >
              <div className="p-6 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.href} onClick={() => setMobileOpen(false)}>
                    {link.isAnchor
                      ? <a href={link.href} className="flex items-center px-4 py-3 rounded-xl text-slate-700 font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors text-base">{link.label}</a>
                      : <Link href={link.href} className="flex items-center px-4 py-3 rounded-xl text-slate-700 font-bold hover:bg-teal-50 hover:text-teal-700 transition-colors text-base">{link.label}</Link>
                    }
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100">
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
