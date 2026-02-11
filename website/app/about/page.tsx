"use client";

import { motion } from "framer-motion";
<<<<<<< Updated upstream
import Link from "next/link";
import { Shield, Clock, Zap, Globe, ArrowLeft } from "lucide-react";
=======
import { Shield, Zap, Globe, Clock, ArrowUpRight } from "lucide-react";
>>>>>>> Stashed changes
import Image from "next/image";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 120, damping: 12 },
    },
};

const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.08,
            type: "spring",
            stiffness: 100,
            damping: 10,
        },
    }),
};

const cardHover = {
    hover: {
        y: -8,
        boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { type: "spring", stiffness: 200, damping: 15 },
    },
};

const darkCardHover = {
    hover: {
        y: -8,
        boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 200, damping: 15 },
    },
};

const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 200, damping: 10 },
    },
    hover: {
        scale: 1.15,
        rotate: 5,
        transition: { type: "spring", stiffness: 300, damping: 8 },
    },
};

const footerArrowVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 200, damping: 10 },
    },
    hover: {
        scale: 1.2,
        rotate: 45,
        transition: { type: "spring", stiffness: 300, damping: 8 },
    },
};

const letterContainer = {
    visible: {
        transition: {
            staggerChildren: 0.03,
        },
    },
};

const letterAnimation = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", damping: 12, stiffness: 200 },
    },
};

const AnimatedTitle = ({ text, className }) => (
    <motion.span
        variants={letterContainer}
        initial="hidden"
        animate="visible"
        className={`inline-block overflow-hidden ${className}`}
    >
        {text.split("").map((char, index) => (
            <motion.span key={index} variants={letterAnimation} className="inline-block">
                {char === " " ? "\u00A0" : char}
            </motion.span>
        ))}
    </motion.span>
);

export default function AboutPage() {
    return (
<<<<<<< Updated upstream
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">

            {/* Premium Split Island Navigation */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 pointer-events-none">
                <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-teal-700 transition-colors font-bold text-sm group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform stroke-[3px]" />
                        Back to Home
                    </Link>
                </div>
                <div className="pointer-events-auto bg-white/80 backdrop-blur-xl rounded-full border border-white/40 shadow-xl shadow-slate-200/40 px-6 py-3 flex items-center hover:bg-white transition-colors">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden">
                            <Image src="/assets/images/logo_icon.png" alt="Fiinny" fill className="object-cover" />
                        </div>
                        <span className="text-xl font-black text-teal-950 tracking-tight group-hover:text-teal-700 transition-colors">Fiinny</span>
                    </Link>
=======
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Navbar */}
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.1 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none"
            >
                <div className="bg-white/80 backdrop-blur-md rounded-full shadow-md border border-gray-200/50 px-5 py-2 flex items-center space-x-6 pointer-events-auto">
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/assets/images/logo_icon.png"
                            alt="Fiinny"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                        <span className="text-lg font-bold text-gray-900">Fiinny</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                        Close
                    </button>
>>>>>>> Stashed changes
                </div>
            </motion.nav>

            {/* Main Content */}
<<<<<<< Updated upstream
            <main className="pt-40 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Intro */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-20 text-center md:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-teal-100">
                            Our Story
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-none">
                            Engineering Financial Clarity. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Built in Hyderabad.</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed font-medium">
                            Fiinny is an institution-grade financial operating system. We combine bank-level security with consumer-grade design to give you absolute control over your net worth.
                            <span className="block mt-4 font-bold text-slate-900">No ads. No data selling. Just pure utility.</span>
=======
            <main className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
                {/* Hero Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col lg:flex-row items-start justify-between mb-24 lg:space-x-12"
                >
                    <div className="lg:w-2/3">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6 flex flex-wrap">
                            <AnimatedTitle
                                text="Engineering"
                                className="text-gray-900 mr-4 mb-2"
                            />
                            <AnimatedTitle
                                text="Financial"
                                className="text-gray-900 mr-4 mb-2"
                            />
                            <AnimatedTitle text="Clarity." className="text-teal-500 mb-2" />
                        </h1>
                    </div>
                    <motion.div variants={itemVariants} className="lg:w-1/3 mt-8 lg:mt-2">
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            We combine bank-level security with consumer-grade design to give
                            you absolute control.
>>>>>>> Stashed changes
                        </p>
                        <div className="flex items-center space-x-2">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 10,
                                    delay: 0.8,
                                }}
                                className="relative flex h-2.5 w-2.5"
                            >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                            </motion.span>
                            <span className="text-sm font-bold text-gray-500 tracking-wider uppercase">
                                BUILT IN HYDERABAD
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* Card 1 */}
                    <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between h-full card-hover"
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            className="p-3 bg-teal-50 rounded-2xl w-14 h-14 flex items-center justify-center mb-6"
                            variants={iconVariants}
                        >
                            <Shield className="w-7 h-7 text-teal-500" />
                        </motion.div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Privacy by Design
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                We practice radical data minimization. Your financial records
                                are encrypted at rest and strictly isolated. We physically
                                cannot monetize what we cannot see.
                            </p>
                        </div>
                    </motion.div>

<<<<<<< Updated upstream
                    <div className="w-full h-px bg-slate-200 mb-20" />

                    {/* The Mission */}
                    <section className="mb-24">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Our Mission</h2>
                        <div className="prose prose-lg text-slate-600 font-medium">
                            <p className="mb-6">
                                In a market flooded with loan apps disguised as trackers, <span className="text-teal-700 font-bold">Fiinny stands apart</span>. We are not here to sell you credit. We are here to help you build wealth.
                            </p>
                            <p>
                                Born in <strong>Hyderabad</strong>, a global hub of technology, our team engineers solutions that respect your privacy and your intelligence. We believe financial data is personal infrastructure, not a commodity.
=======
                    {/* Card 2 */}
                    <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between h-full card-hover"
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            className="p-3 bg-blue-50 rounded-2xl w-14 h-14 flex items-center justify-center mb-6"
                            variants={iconVariants}
                        >
                            <Zap className="w-7 h-7 text-blue-500" />
                        </motion.div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Instant Latency
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Every interaction is engineered to be under 100ms. Speed is a
                                feature.
>>>>>>> Stashed changes
                            </p>
                        </div>
                    </motion.div>

<<<<<<< Updated upstream
                    {/* Principles Grid */}
                    <section className="mb-24">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Our Principles</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group">
                                <Shield className="w-8 h-8 text-teal-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    We practice data minimization. Your financial records are encrypted and strictly isolated. We do not monetize your behavior.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group">
                                <Clock className="w-8 h-8 text-teal-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Long-Term Reliability</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    We ignore short-term trends to build durable infrastructure. This product is designed to manage your finances for decades.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group">
                                <Zap className="w-8 h-8 text-teal-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Speed & Utility</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Latency is a bug. Every interaction is engineered to be instant. We respect the limited time you have to manage your money.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group">
                                <Globe className="w-8 h-8 text-teal-600 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Global Neutrality</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Fiinny works in 190+ countries and supports any currency. We are not tied to a single banking system or region.
                                </p>
                            </div>
=======
                    {/* Card 3 */}
                    <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between h-full card-hover"
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            className="p-3 bg-purple-50 rounded-2xl w-14 h-14 flex items-center justify-center mb-6"
                            variants={iconVariants}
                        >
                            <Globe className="w-7 h-7 text-purple-500" />
                        </motion.div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Global Neutrality
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                190+ countries. Any currency. Unbiased by local banking systems.
                            </p>
>>>>>>> Stashed changes
                        </div>
                    </motion.div>

<<<<<<< Updated upstream
                    {/* Closing */}
                    <section className="bg-slate-900 text-white p-12 rounded-[2.5rem] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">A standard of care.</h3>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto font-medium">
                                We are continuously refining Fiinny to be the most reliable financial tool on the market. Thank you for trusting us with your journey.
                            </p>
                            <p className="text-sm font-mono text-teal-400/80">
                                Built with care in Hyderabad.
                            </p>
                        </div>
                    </section>
=======
                    {/* Dark Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        className="bg-gray-900 rounded-3xl p-8 shadow-lg text-white flex flex-col justify-between h-full lg:col-span-2 lg:flex-row lg:items-center dark-card-hover"
                        style={{ perspective: 1000 }}
                    >
                        <div className="flex-1 pr-6">
                            <motion.div
                                className="p-3 bg-gray-800/50 rounded-2xl w-14 h-14 flex items-center justify-center mb-6"
                                variants={iconVariants}
                            >
                                <Clock className="w-7 h-7 text-teal-400" />
                            </motion.div>
                            <h3 className="text-3xl font-bold mb-3">Decades, not Months.</h3>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                We ignore short-term trends to build durable infrastructure.
                                This product is designed to manage your finances for the next 30
                                years.
                            </p>
                        </div>
                        <div className="hidden lg:block relative h-64 w-64 opacity-80">
                            {/* Abstract clock/time visual - optional, can be an image or SVG */}
                            <svg
                                viewBox="0 0 200 200"
                                className="absolute inset-0 w-full h-full animate-spin-slow"
                            >
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="2"
                                />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="60"
                                    fill="none"
                                    stroke="rgba(20, 184, 166, 0.3)"
                                    strokeWidth="4"
                                    strokeDasharray="30 10"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="100"
                                    y2="50"
                                    stroke="rgba(20, 184, 166, 0.8)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="100"
                                    y1="100"
                                    x2="140"
                                    y2="100"
                                    stroke="rgba(20, 184, 166, 0.6)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </motion.div>
                </motion.div>
>>>>>>> Stashed changes

                {/* Footer Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-24"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]"></div>
                        <div className="mb-8 md:mb-0 relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                No ads. No selling data.
                            </h2>
                            <p className="text-gray-300 text-lg">
                                Just pure utility. Built with care in Hyderabad.
                            </p>
                        </div>
                        <motion.a
                            href="/"
                            whileHover="hover"
                            initial="hidden"
                            animate="visible"
                            variants={footerArrowVariants}
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md relative z-10 group"
                        >
                            <ArrowUpRight className="w-7 h-7 text-gray-900 group-hover:text-teal-600 transition-colors" />
                        </motion.a>
                    </motion.div>
                </motion.div>
            </main>

            <style jsx global>{`
        .card-hover:hover {
          transform: translateY(-8px) rotateX(2deg) rotateY(2deg);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .dark-card-hover:hover {
          transform: translateY(-8px) rotateX(2deg) rotateY(2deg);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.1);
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}