"use client";

import React from "react";
import Link from "next/link";
import HeroSection from "./HeroSection";
import BentoGrid from "./BentoGrid";
import AuditBadge from "./AuditBadge";
import DataTransparencyTable from "./DataTransparencyTable";
import ConsentLifecycle from "./ConsentLifecycle";
import FAQSection from "./FAQSection";
import FraudReporting from "./FraudReporting";
import ComplianceStrip from "./ComplianceStrip";
import SMSTransparency from "./SMSTransparency";
import Navbar from "@/components/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";

export default function TrustPageContent() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">

            <Navbar />

            <main className="pt-16">
                {/* 1. The Antigravity Intro & Compliance */}
                <HeroSection />
                <ComplianceStrip />

                <div className="h-24" /> {/* Spacing */}

                {/* 2. The Credibility Anchor */}
                <AuditBadge />

                {/* 3. The Features (Glassmorphism) */}
                <BentoGrid />

                <div className="my-24 font-bold text-center text-slate-300 text-sm uppercase tracking-widest">
                    • • •
                </div>

                {/* 4. The Compliance Flow & SMS Transparency */}
                <ConsentLifecycle />

                {/* Dedicated Play Store Compliance Section */}
                <SMSTransparency />

                <DataTransparencyTable />

                {/* 5. The Anxiety Killers (PhonePe Inspired) */}
                <div className="bg-slate-50/50 border-t border-slate-100 mt-24">
                    <FAQSection />
                </div>

                {/* 6. Emergency Action */}
                <FraudReporting />
            </main>

            <LandingFooter />
        </div>
    );
}
