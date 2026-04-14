"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import LoanAuditForm from "@/features/loan-audit/components/LoanAuditForm";
import LoanAuditGuide from "@/features/loan-audit/components/LoanAuditGuide";
import LoanAuditHero from "@/features/loan-audit/components/LoanAuditHero";
import LoanAuditLeadForm from "@/features/loan-audit/components/LoanAuditLeadForm";
import LoanAuditResults from "@/features/loan-audit/components/LoanAuditResults";
import { evaluateLoanAudit } from "@/features/loan-audit/utils/auditEngine";
import {
  LoanAuditInput,
  LoanAuditResult,
} from "@/features/loan-audit/types";

export default function LoanAuditPage() {
  const formRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [auditInput, setAuditInput] = useState<LoanAuditInput | null>(null);
  const [auditResult, setAuditResult] = useState<LoanAuditResult | null>(null);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAuditSubmit(input: LoanAuditInput) {
    const result = evaluateLoanAudit(input);
    setAuditInput(input);
    setAuditResult(result);

    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fcfb_0%,#eef6f6_38%,#f8fafc_100%)] font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute right-[-8rem] top-[14rem] h-[24rem] w-[24rem] rounded-full bg-cyan-100/50 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.66)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.66)_1px,transparent_1px)] bg-[size:38px_38px] opacity-40" />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full">
              <Image
                src="/assets/images/logo_icon.png"
                alt="Fiinny"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900 group-hover:text-teal-700">
                Fiinny
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600">
                Loan Audit
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm md:inline-flex">
              2 minute guided audit
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
        <LoanAuditHero onStart={scrollToForm} />

        <section className="mt-8">
          <LoanAuditGuide />
        </section>

        <section ref={formRef} className="mt-8 scroll-mt-28">
          <LoanAuditForm onSubmit={handleAuditSubmit} />
        </section>

        {auditInput && auditResult ? (
          <div ref={resultsRef} className="mt-8 space-y-8">
            <LoanAuditResults
              auditInput={auditInput}
              auditResult={auditResult}
              onEditInputs={scrollToForm}
            />
            <LoanAuditLeadForm
              auditInput={auditInput}
              auditResult={auditResult}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
