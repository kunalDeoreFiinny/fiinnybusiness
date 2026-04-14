"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Shield, Clock, Zap, Globe, ArrowLeft, ArrowUpRight, Linkedin, Twitter, MapPin, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";

export default function AboutPageClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      <Navbar />

      <main className="pt-40 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-teal-100">
              Our Story
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-none">
              Engineering Financial Clarity. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Built in Hyderabad.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
              Fiinny is an institution-grade financial operating system. We combine bank-level security with consumer-grade design to give you absolute control over your net worth.
              <span className="block mt-4 font-bold text-slate-900">No ads. No data selling. Just pure utility.</span>
            </p>
          </motion.div>

          <div className="w-full h-px bg-slate-200 mb-20" />

          {/* ── FOUNDER SECTION ──────────────────────────────── */}
          <section className="mb-24">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10 text-center">Meet the Founder</h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Left — photo + social */}
                <div className="md:w-72 bg-gradient-to-br from-teal-600 to-emerald-700 p-10 flex flex-col items-center justify-center text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                  {/* Avatar circle */}
                  <div className="relative w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mb-4 z-10 overflow-hidden">
                    <span className="text-5xl font-black text-white">A</span>
                  </div>

                  <h3 className="text-2xl font-black mb-1 z-10 relative">Arjun Tanpure</h3>
                  <p className="text-teal-100 text-sm font-medium mb-6 z-10 relative">Founder & CEO</p>

                  <div className="flex gap-3 z-10 relative">
                    <a
                      href="https://www.linkedin.com/in/arjuntanpure/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href="https://twitter.com/arjuntanpure"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Right — bio */}
                <div className="flex-1 p-10">
                  <div className="flex flex-wrap gap-4 mb-6 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-500" /> Hyderabad, India</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teal-500" /> Founded 2024</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-teal-500" /> 2,400+ Users</span>
                  </div>

                  <p className="text-slate-600 leading-relaxed font-medium mb-5">
                    Arjun built Fiinny after being frustrated with finance apps that sold user data, showed ads, or required manual entries every day. Coming from a background in product and engineering, he believed the right way to build financial software was <strong className="text-slate-900">privacy-first, automation-first</strong>.
                  </p>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    Fiinny is his answer to a broken industry — a tool he actually uses himself. The mission is simple: <em>make financial clarity accessible to every Indian without compromising their data.</em>
                  </p>

                  {/* Timeline milestones */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                    {[
                      { year: "2024", label: "Fiinny founded in Hyderabad" },
                      { year: "2025 Q1", label: "iOS & Android launch" },
                      { year: "2025 Q3", label: "Tax Autopilot launched" },
                    ].map((m, i) => (
                      <div key={i} className="text-center">
                        <div className="text-teal-600 font-black text-sm mb-1">{m.year}</div>
                        <div className="text-slate-500 text-xs leading-tight">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Mission */}
          <section className="mb-24">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Our Mission</h2>
            <div className="prose prose-lg text-slate-600 font-medium">
              <p className="mb-6">
                In a market flooded with loan apps disguised as trackers, <span className="text-teal-700 font-bold">Fiinny stands apart</span>. We are not here to sell you credit. We are here to help you build wealth.
              </p>
              <p>
                Born in <strong>Hyderabad</strong>, a global hub of technology, our team engineers solutions that respect your privacy and your intelligence. We believe financial data is personal infrastructure, not a commodity.
              </p>
            </div>
          </section>

          {/* Principles Grid */}
          <section className="mb-24">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Our Principles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Privacy First", desc: "We practice data minimization. Your financial records are encrypted and strictly isolated. We do not monetize your behavior." },
                { icon: Clock, title: "Long-Term Reliability", desc: "We ignore short-term trends to build durable infrastructure. This product is designed to manage your finances for decades." },
                { icon: Zap, title: "Speed & Utility", desc: "Latency is a bug. Every interaction is engineered to be instant. We respect the limited time you have to manage your money." },
                { icon: Globe, title: "Global Neutrality", desc: "Fiinny works in 190+ countries and supports any currency. We are not tied to a single banking system or region." },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group"
                >
                  <Icon className="w-8 h-8 text-teal-600 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Closing CTA */}
          <section className="bg-slate-900 text-white p-12 rounded-[2.5rem] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">A standard of care.</h3>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto font-medium">
                We are continuously refining Fiinny to be the most reliable financial tool on the market. Thank you for trusting us with your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/20"
                >
                  Contact Us <ArrowUpRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
              <p className="text-sm font-mono text-teal-400/80 mt-8">Built with care in Hyderabad.</p>
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
