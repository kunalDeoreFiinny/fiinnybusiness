"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, Users, PieChart, FileText, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";

const steps = [
  {
    step: "01",
    title: "Connect & Auto-Capture",
    desc: "Give Fiinny permission to read bank SMS messages. Our on-device ML engine instantly parses every transaction — amounts, merchants, categories — without ever sending your data to a server.",
    icon: <Zap className="w-6 h-6 text-white" />,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-200",
    align: "left",
    image: "/assets/images/3d-analytics.png",
    checks: [
      "Auto-categorises UPI, NEFT, debit card & credit card",
      "Works offline — fully on-device processing",
      "No manual entry ever again",
    ],
  },
  {
    step: "02",
    title: "Split Bills Instantly",
    desc: "Swipe right on any expense to split it with your partner, roommate, or friends. Fiinny tracks who owes what in real-time — no spreadsheets, no WhatsApp threads.",
    icon: <Users className="w-6 h-6 text-white" />,
    color: "from-teal-400 to-emerald-500",
    shadow: "shadow-emerald-200",
    align: "right",
    image: "/assets/images/3d-couple.png",
    checks: [
      "Group expenses with any number of people",
      "Live settlement tracking",
      "One tap to mark as settled",
    ],
  },
  {
    step: "03",
    title: "See Real Insights",
    desc: "Get your complete financial picture — spending trends, category breakdowns, and net worth — all in one dashboard. No monthly blind spots.",
    icon: <PieChart className="w-6 h-6 text-white" />,
    color: "from-blue-400 to-indigo-500",
    shadow: "shadow-indigo-200",
    align: "left",
    image: "/assets/images/3d-goals.png",
    checks: [
      "Weekly spending summaries",
      "Category trend graphs",
      "Net worth calculation",
    ],
  },
  {
    step: "04",
    title: "File Tax — Autopilot",
    desc: "Enter your PAN. Fiinny fetches your Form 26AS via official Income Tax APIs, calculates your best regime, and generates a ready-to-file ITR JSON — in minutes.",
    icon: <FileText className="w-6 h-6 text-white" />,
    color: "from-violet-400 to-purple-600",
    shadow: "shadow-violet-200",
    align: "right",
    image: "/assets/images/3d-goals.png",
    checks: [
      "Official Income Tax Dept API integration",
      "Old regime vs New regime comparison",
      "One-click ITR-1 JSON download",
    ],
  },
];

export default function HowItWorksClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-32">
        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 mb-32 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-teal-100">
              <Zap className="w-4 h-4" />
              How It Works
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-none">
              Managing money shouldn&apos;t <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                feel like work.
              </span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto mb-10">
              Fiinny removes the clutter. We built a system that fits naturally into your life — auto-tracking, instant splitting, and one-click tax filing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors shadow-lg shadow-teal-200"
              >
                Try it free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm transition-colors"
              >
                Download iOS App
              </a>
            </div>
          </motion.div>
        </section>

        {/* Steps */}
        <section className="max-w-6xl mx-auto px-4 relative">
          {/* Central connector line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/30 via-slate-200 to-transparent -translate-x-1/2 hidden md:block" />

          <div className="space-y-28 relative">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className={`relative flex flex-col md:flex-row items-center gap-12 ${item.align === "right" ? "md:flex-row-reverse" : ""}`}
              >
                {/* Card */}
                <div className="flex-1 w-full">
                  <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-300 relative overflow-hidden group">
                    {/* Step header */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${item.color}`} />
                    <div className="p-8 md:p-10">
                      <div className="flex items-start gap-5 mb-6">
                        <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg ${item.shadow} group-hover:scale-105 transition-transform`}>
                          {item.icon}
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Step {item.step}</span>
                          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{item.title}</h3>
                        </div>
                      </div>
                      <p className="text-slate-500 leading-relaxed font-medium mb-6">{item.desc}</p>
                      <ul className="space-y-2">
                        {item.checks.map((check, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                            {check}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${item.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                  </div>
                </div>

                {/* Center node */}
                <div className="relative z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-slate-50 shadow-lg">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.color}`} />
                </div>

                {/* Screenshot side */}
                <div className="flex-1 hidden md:flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={280}
                      height={280}
                      className="w-56 h-auto drop-shadow-2xl"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mt-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 max-w-2xl mx-auto rounded-[2.5rem] p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4">Ready to start?</h2>
              <p className="text-slate-400 mb-8">Free forever for individuals. No credit card required.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors"
              >
                Get Started Free <ChevronDown className="w-5 h-5 -rotate-90" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
