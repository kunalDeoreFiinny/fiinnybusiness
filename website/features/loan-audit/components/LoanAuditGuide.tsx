"use client";

import { FileText, HelpingHand, SearchCheck } from "lucide-react";
import {
  LOAN_AUDIT_HOW_IT_WORKS,
  LOAN_AUDIT_PREP_LIST,
  LOAN_AUDIT_USE_CASES,
} from "@/features/loan-audit/constants";

const guideIcons = [FileText, SearchCheck, HelpingHand];

export default function LoanAuditGuide() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
      <div className="rounded-[2.15rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
          How this helps
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
          More than a score. This should tell you what to do next.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
          Most borrowers do not just need a number. They need clarity on whether
          to negotiate, refinance, or hold off for now. This audit is designed to
          give that kind of decision support.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {LOAN_AUDIT_HOW_IT_WORKS.map((item, index) => {
            const Icon = guideIcons[index] ?? SearchCheck;
            return (
              <div
                key={item.title}
                className="rounded-[1.65rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.95))] p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-black tracking-tight text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2.15rem] border border-teal-100 bg-[linear-gradient(180deg,rgba(240,253,250,0.92),rgba(255,255,255,0.92))] p-6 shadow-[0_20px_60px_-36px_rgba(13,148,136,0.4)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
            Best used when
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            Situations where this adds real value
          </h3>
          <div className="mt-4 space-y-3">
            {LOAN_AUDIT_USE_CASES.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-teal-100 bg-white/95 px-4 py-4 text-sm leading-relaxed text-slate-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.15rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Before you start
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            Keep these nearby
          </h3>
          <div className="mt-5 space-y-3">
            {LOAN_AUDIT_PREP_LIST.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
