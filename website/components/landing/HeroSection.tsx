"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FileText, Play } from "lucide-react";
import TypewriterText from "@/components/animations/TypewriterText";
import HeroCarousel from "./HeroCarousel";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-teal-50/80 to-transparent rounded-full blur-3xl -z-10 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl -z-10 opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ----- LEFT COLUMN: Text Content ----- */}
          <div className="text-center lg:text-left z-20">
            <div className="mb-8">
              <TypewriterText
                className="text-5xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-4 leading-[1.05]"
                lines={[
                  { text: "Financial clarity," },
                  { text: "automated.", highlight: true, gradient: "text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 animate-gradient pb-2" }
                ]}
              />
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 2.0, duration: 0.8 }}
                className="text-2xl lg:text-4xl font-bold text-slate-400 tracking-tight"
              >
                No spreadsheets. No guesswork.
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-lg mx-auto lg:mx-0"
            >
              Track personal and shared expenses in one system that works for you.
              <br className="hidden lg:block" />
              Auto-organized. Real-time insights. Zero manual effort.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link
                href="/tax"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-teal-600 rounded-full hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-200 hover:-translate-y-1 active:scale-95 group"
              >
                <FileText className="w-5 h-5 mr-2" />
                Try Tax Autopilot
                <span className="ml-2 bg-yellow-400 text-teal-900 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:scale-105 transition-transform">New</span>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 transition-all duration-200 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 active:scale-95"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                See how it works
              </Link>
            </motion.div>

            {/* App Store Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 2.6, duration: 0.8 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start items-center"
            >
              <a href="https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  width={150}
                  height={50}
                  className="h-12 w-auto"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.KaranArjunTechnologies.lifemap" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  width={165}
                  height={50}
                  className="h-12 w-auto"
                />
              </a>
            </motion.div>
          </div>

          {/* ----- RIGHT COLUMN: The Pulse Carousel ----- */}
          <div className="relative h-[650px] w-full flex flex-col items-center justify-center perspective-1000">
            {/* The Pulse Background Effect (Rings) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.1, 0.0, 0.1],
                    borderColor: ["rgba(20, 184, 166, 0.2)", "rgba(16, 185, 129, 0.1)", "rgba(20, 184, 166, 0.2)"]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: ring * 1, ease: "easeInOut" }}
                  className="absolute rounded-full border border-teal-500/20 bg-teal-400/5"
                  style={{
                    width: `${ring * 280 + 200}px`,
                    height: `${ring * 280 + 200}px`,
                    zIndex: 0
                  }}
                />
              ))}
            </div>
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
