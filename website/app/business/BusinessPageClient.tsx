"use client";

import { motion } from "framer-motion";
import { ArrowRight, Package, TrendingUp, ShieldCheck, Globe, Zap, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";

const features = [
  {
    icon: Package,
    title: "Product Catalog Management",
    desc: "Manage your entire product portfolio — from wholesale to retail — in one unified dashboard.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    desc: "Real-time revenue tracking, order trends, and growth insights built for distribution businesses.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    icon: Globe,
    title: "PAN-India Distribution",
    desc: "Built specifically for India's retail supply chain — manage distributors, retailers, and bulk orders.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments via Razorpay",
    desc: "Integrated Razorpay Route for split payments — direct revenue to business accounts instantly.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    icon: Zap,
    title: "Retailer Self-Ordering",
    desc: "Give your retailers a branded portal to place orders directly — no middlemen, no delay.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    icon: Star,
    title: "Partner SaaS Platform",
    desc: "White-label the Fiinny business stack. Your brand, your distributors, your rules.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
];

export default function BusinessPageClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-teal-400/[0.08] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-400/[0.08] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-8">
                <Star className="w-3 h-3 fill-current" />
                Fiinny for Business
              </div>

              <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.05]">
                Power your retail
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
                  distribution business.
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                From wholesale catalog management to PAN-India retailer ordering, Fiinny Business gives
                your distribution empire the technology edge it deserves.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://karanarjun-pvt-ltd.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 group"
                  id="business-cta-primary"
                >
                  Visit Karan Arjun Power Plus
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-teal-300 hover:text-teal-700 transition-all"
                  id="business-cta-contact"
                >
                  Talk to us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right — Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
                {/* Portal Header */}
                <div className="bg-slate-900 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Karan Arjun Power Plus</p>
                    <p className="text-white text-2xl font-black mt-1">Business Portal</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-slate-900 fill-current" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                  {[
                    { label: "Active Retailers", value: "2,400+" },
                    { label: "States Covered", value: "12" },
                    { label: "Orders / Month", value: "18K" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 text-center">
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Product List */}
                <div className="p-6 space-y-3">
                  {[
                    { name: "Power Plus 2000W Inverter", stock: "In Stock", price: "₹12,400" },
                    { name: "KA Solar Panel 550W", stock: "In Stock", price: "₹8,200" },
                    { name: "Lithium Battery Pack 150Ah", stock: "Low Stock", price: "₹22,000" },
                  ].map((product) => (
                    <div key={product.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-teal-50/50 transition-colors group">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{product.name}</p>
                        <p className={`text-xs font-medium mt-0.5 ${product.stock === "Low Stock" ? "text-amber-600" : "text-emerald-600"}`}>
                          {product.stock}
                        </p>
                      </div>
                      <span className="text-sm font-black text-slate-900">{product.price}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <a
                    href="https://karanarjun-pvt-ltd.web.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl transition-colors text-sm"
                  >
                    Browse Full Catalog
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute -top-4 -right-4 bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-teal-600/30 rotate-3">
                Live &amp; Operational ✓
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything your business needs</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Fiinny Business is the operating system for India&apos;s distribution economy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-teal-200 hover:shadow-lg transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${feature.color} mb-5`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            See Karan Arjun Power Plus in action
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            India&apos;s leading power solutions brand, now with a full digital retail portal.
            Browse the catalog, place orders, and get delivery tracking &mdash; all online.
          </p>
          <a
            href="https://karanarjun-pvt-ltd.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl text-lg transition-all hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-1 group"
            id="business-cta-banner"
          >
            Open Karan Arjun Portal
            <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
