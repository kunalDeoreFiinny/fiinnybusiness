"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Landmark,
  Shield,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import PrimaryButton from "@/components/widgets/PrimaryButton";
import {
  LOAN_AUDIT_DISCLAIMER,
  LOAN_AUDIT_TRUST_BULLETS,
} from "@/features/loan-audit/constants";

interface LoanAuditHeroProps {
  onStart: () => void;
}

export default function LoanAuditHero({ onStart }: LoanAuditHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.3rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,250,0.92)_60%,rgba(240,249,255,0.92))] px-6 py-10 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.35)] sm:px-8 lg:px-12 lg:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_42%)]" />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-teal-100/80 bg-white/40" />
      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-700 shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Fiinny Loan Audit
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Check if you are overpaying on your loan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-slate-600"
          >
            Get a free loan audit in 2 minutes. We estimate whether
            renegotiation or refinancing may help, and what kind of next step is
            worth your time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <PrimaryButton
              type="button"
              icon={<ArrowRight className="h-4 w-4" />}
              className="px-8 py-3.5 text-base shadow-xl shadow-teal-600/20"
              onClick={onStart}
            >
              Check My Loan
            </PrimaryButton>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
              <Clock3 className="h-4 w-4 text-teal-600" />
              Most people finish the check in under 2 minutes
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <InfoChip label="2-minute guided check" />
            <InfoChip label="Clear next-step brief" />
            <InfoChip label="Transparent rule-based logic" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-500"
          >
            {LOAN_AUDIT_DISCLAIMER}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mt-8 grid gap-4 sm:grid-cols-3"
          >
            <SignalCard label="Good for" value="Rate reset check" />
            <SignalCard label="Helpful when" value="Bank denied or confused you" />
            <SignalCard label="Output" value="Savings range plus next move" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="rounded-[2rem] border border-white/70 bg-slate-950/[0.03] p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm"
        >
          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  What you get
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  A calm second opinion
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {LOAN_AUDIT_TRUST_BULLETS.map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4"
                >
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                  <p className="font-medium text-slate-700">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(180deg,rgba(240,253,250,0.95),rgba(255,255,255,0.95))] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
                <SearchCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight text-slate-900">
                  Useful if you are asking:
                </p>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                  <p>Should I push my current bank first or check outside lenders?</p>
                  <p>Will a lower EMI actually save money or just extend the pain?</p>
                  <p>Is my profile strong enough to make renegotiation worthwhile now?</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TrustStat
              icon={<Shield className="h-4 w-4" />}
              label="Approach"
              value="Educational and practical"
            />
            <TrustStat
              icon={<Clock3 className="h-4 w-4" />}
              label="Start"
              value="No document upload needed"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface InfoChipProps {
  label: string;
}

function InfoChip({ label }: InfoChipProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
      {label}
    </div>
  );
}

interface SignalCardProps {
  label: string;
  value: string;
}

function SignalCard({ label, value }: SignalCardProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/80 bg-white/85 px-4 py-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-800">{value}</p>
    </div>
  );
}

interface TrustStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function TrustStat({ icon, label, value }: TrustStatProps) {
  return (
    <div className="rounded-[1.35rem] border border-white/80 bg-white/90 px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-teal-600">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-800">{value}</p>
    </div>
  );
}
