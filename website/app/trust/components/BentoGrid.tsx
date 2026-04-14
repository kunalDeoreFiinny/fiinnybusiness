'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Smartphone, Eye, ShieldAlert, Cpu } from 'lucide-react';
import Image from 'next/image';

const BentoCard = ({ title, description, icon: Icon, className, children, delay = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -5, scale: 1.005 }}
        className={`bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 ${className}`}
    >
        {/* Refractive Edge on Hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 h-full flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Icon size={28} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">{description}</p>

            {children}
        </div>
    </motion.div>
);

export default function BentoGrid() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-12 -mt-20 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto">

                {/* Large Left Card - Local Intelligence */}
                <BentoCard
                    title="Smarter, Local Processing"
                    description="Unlike others, we don't upload your raw SMS data to a cloud server. Our ML engine runs 100% on your phone's Neural Engine."
                    icon={Cpu}
                    className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-white to-slate-50 min-h-[500px]"
                    delay={0.1}
                >
                    <div className="mt-auto flex-shrink-0 relative w-full aspect-square bg-white rounded-2xl border border-slate-100 flex items-center justify-center p-6 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)]" />
                        <svg viewBox="0 0 120 120" className="w-32 h-32 object-contain relative z-10 group-hover:scale-110 transition-transform duration-700 hover:rotate-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="30" y="30" width="60" height="60" rx="8" fill="#0d9488" opacity="0.1" stroke="#0d9488" strokeWidth="1.5"/>
                          <rect x="40" y="40" width="40" height="40" rx="4" fill="#0d9488" opacity="0.15" stroke="#0d9488" strokeWidth="1"/>
                          <rect x="50" y="50" width="20" height="20" rx="2" fill="#0d9488" opacity="0.4"/>
                          <line x1="20" y1="50" x2="30" y2="50" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="20" y1="60" x2="30" y2="60" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="20" y1="70" x2="30" y2="70" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="90" y1="50" x2="100" y2="50" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="90" y1="60" x2="100" y2="60" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="90" y1="70" x2="100" y2="70" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="50" y1="20" x2="50" y2="30" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="60" y1="20" x2="60" y2="30" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="70" y1="20" x2="70" y2="30" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="50" y1="90" x2="50" y2="100" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="60" y1="90" x2="60" y2="100" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="70" y1="90" x2="70" y2="100" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-teal-100 text-teal-700 text-[10px] font-mono shadow-sm flex justify-between items-center">
                            <span>STATUS</span>
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> ON DEVICE</span>
                        </div>
                    </div>
                </BentoCard>

                {/* Top Middle - Encryption Vault */}
                <BentoCard
                    title="The Vault Standard"
                    description="Your database is encrypted with AES-256 at rest. Even if your phone is stolen and rooted, your financial history remains a jumbled mess of characters to anyone else."
                    icon={Lock}
                    className="md:col-span-2 md:row-span-1 min-h-[300px]"
                    delay={0.2}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <Image
                            src="/digital-vault.png"
                            alt="Vault"
                            width={300}
                            height={300}
                            className="object-contain"
                        />
                    </div>
                </BentoCard>

                {/* Bottom Left - Biometrics */}
                <BentoCard
                    title="Biological Key"
                    description="FaceID & Fingerprint locked. Your biometrics are the only key we accept."
                    icon={Smartphone}
                    className="md:col-span-1 md:row-span-1"
                    delay={0.3}
                />

                {/* Bottom Right - Security Tips (Educational) */}
                <BentoCard
                    title="Proactive Defense Tips"
                    description="Stay ahead of scammers with live updates."
                    icon={ShieldAlert}
                    className="md:col-span-1 md:row-span-1 bg-violet-50/50 border-violet-100"
                    delay={0.4}
                >
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-700 bg-white p-2 rounded-lg border border-violet-100 shadow-sm">
                            <span className="text-red-500 font-bold">Never</span>
                            <span>Share OTPs with anyone.</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-700 bg-white p-2 rounded-lg border border-violet-100 shadow-sm">
                            <span className="text-teal-600 font-bold">Always</span>
                            <span>Verify UPI IDs before pay.</span>
                        </div>
                    </div>
                </BentoCard>

            </div>
        </section>
    );
}
