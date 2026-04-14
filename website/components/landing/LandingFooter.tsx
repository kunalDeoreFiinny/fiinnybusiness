"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Linkedin, FileText } from "lucide-react";
import CTASection from "./CTASection";

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 relative overflow-hidden pt-32 pb-12">
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="w-full px-6 md:px-12 lg:px-24 relative z-10">
        
        <CTASection />

        {/* The Footer Navigation */}
        <div className="grid md:grid-cols-4 gap-12 border-t border-slate-800/50 pt-20 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                <span className="font-black text-slate-950 text-xs">F</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Fiinny</span>
            </div>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-8">
              The smart, simple way to track expenses, split bills, and reach your financial goals. Built with privacy at its core.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/fiinnyapp/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/company/fiinny-inc/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs opacity-90">Product</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link href="/business" className="hover:text-teal-400 transition-colors">Fiinny Business</Link></li>
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
              <li><Link href="/subscription" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
              <li><Link href="/download" className="hover:text-teal-400 transition-colors">Download</Link></li>
              <li><Link href="/changelog" className="hover:text-teal-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs opacity-90">Company</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms Page</Link></li>
              <li><Link href="/portal/login" className="hover:text-teal-400 transition-colors">Employee Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/50 pt-8 mb-20 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm font-medium">
          <p>© {new Date().getFullYear()} Fiinny Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

        {/* Bot-Friendly Text Section for SEO */}
        <div className="pt-12 border-t border-slate-800/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start opacity-40 hover:opacity-100 transition-opacity">
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">What is Fiinny?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Fiinny is a privacy-first, ISO-aligned personal finance management application built in Hyderabad, India. 
                Our mission is to help Indian users track expenses, split bills, and manage taxes with zero manual effort and zero knowledge architecture. 
                Your data is yours alone.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Why Choose Fiinny?</h3>
              <ul className="text-xs text-slate-500 space-y-2 font-medium">
                <li>• Automated Expense Tracking via Secure SMS Analysis</li>
                <li>• Instant Bill Splitting for Friends, Roommates, and Couples</li>
                <li>• Local-First Privacy Architecture (No data selling)</li>
                <li>• Comprehensive Tax Planning & ITR Autopilot</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Resources</h3>
              <ul className="text-xs text-slate-500 space-y-2 font-medium">
                <li>
                  <Link href="/blog" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Official Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-900">
            <p className="text-[10px] text-slate-600 font-mono text-center uppercase tracking-widest">
              Fiinny Inc. &copy; 2024. Engineering Financial Clarity in Hyderabad.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
