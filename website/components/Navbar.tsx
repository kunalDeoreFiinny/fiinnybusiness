"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { translations } from "@/app/i18n/translations";

export default function Navbar() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  return (
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
          <a href="/#features" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">{t.nav.features}</a>
          <Link href="/blog" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">Blog</Link>
          <Link href="/how-it-works" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">{t.nav.howItWorks}</Link>
          <Link href="/loan-audit" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">Loan Audit</Link>
          <Link href="/trust" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">{t.nav.trust}</Link>
          {!user && <Link href="/subscription" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">{t.nav.pricing}</Link>}
        </div>

        {/* Action Button */}
        <div>
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
            <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
