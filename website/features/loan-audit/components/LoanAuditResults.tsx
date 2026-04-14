"use client";

import { motion } from "framer-motion";
import PrimaryButton from "@/components/widgets/PrimaryButton";
import {
  BIGGEST_GOAL_LABELS,
  LOAN_AUDIT_DISCLAIMER,
  LOAN_TYPE_LABELS,
} from "@/features/loan-audit/constants";
import { LoanAuditInput, LoanAuditResult } from "@/features/loan-audit/types";
import {
  ArrowLeft,
  BadgeCheck,
  ClipboardList,
  FileText,
  HelpCircle,
  Landmark,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import {
  buildAuditSupport,
  buildSnapshotLine,
} from "@/features/loan-audit/utils/buildAuditSupport";

interface LoanAuditResultsProps {
  auditInput: LoanAuditInput;
  auditResult: LoanAuditResult;
  onEditInputs: () => void;
}

const bandStyles = {
  High: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
};

const bandThemes = {
  High: {
    panel:
      "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))]",
    icon: "bg-emerald-100 text-emerald-700",
  },
  Medium: {
    panel:
      "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.98))]",
    icon: "bg-amber-100 text-amber-700",
  },
  Low: {
    panel:
      "border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))]",
    icon: "bg-slate-100 text-slate-700",
  },
};

export default function LoanAuditResults({
  auditInput,
  auditResult,
  onEditInputs,
}: LoanAuditResultsProps) {
  const support = buildAuditSupport(auditInput, auditResult);
  const bandTheme = bandThemes[auditResult.opportunityBand];
  const bankNoteIsDenial =
    support.bankResponseNote?.toLowerCase().includes("denial") ||
    support.bankResponseNote?.toLowerCase().includes("refusal");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[2.15rem] border border-white/70 bg-white/94 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Audit result
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Your loan audit snapshot
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            We reviewed your {LOAN_TYPE_LABELS[auditInput.loanType].toLowerCase()} loan
            with {auditInput.lenderName} and matched it against your stated goal:
            {" "}
            {BIGGEST_GOAL_LABELS[auditInput.biggestGoal].toLowerCase()}.
          </p>
        </div>

        <PrimaryButton
          type="button"
          variant="secondary"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={onEditInputs}
        >
          Review inputs
        </PrimaryButton>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className={`rounded-[1.9rem] border p-6 shadow-sm ${bandTheme.panel}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Opportunity band
              </p>
              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${bandStyles[auditResult.opportunityBand]}`}
              >
                <BadgeCheck className="h-4 w-4" />
                {auditResult.opportunityBand}
              </div>
            </div>

            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${bandTheme.icon}`}>
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/80 bg-white/90 p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Estimated savings range
            </p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              {auditResult.estimatedSavingsRange}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Directional estimate based on your current rate, EMI, and remaining tenure.
            </p>
          </div>

          <div className="mt-4 rounded-[1.6rem] border border-white/80 bg-white/90 p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Recommended next step
            </p>
            <p className="mt-3 text-lg font-bold leading-snug text-slate-900">
              {auditResult.recommendedNextStep}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Confidence note
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {auditResult.confidenceNote}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              What this means
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {support.summary}
            </p>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Why this band
              </p>
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Transparent scoring factors
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {auditResult.reasons.map((reason, index) => (
              <div
                key={reason}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700"
              >
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Signal 0{index + 1}
                </p>
                {reason}
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            {LOAN_AUDIT_DISCLAIMER}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Your snapshot
              </p>
              <h3 className="text-xl font-black tracking-tight text-slate-900">
                Context behind the result
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FactPill
              label="Current rate"
              value={`${auditInput.interestRate}%`}
            />
            <FactPill label="Current EMI" value={`Rs ${auditInput.emi.toLocaleString("en-IN")}`} />
            <FactPill
              label="Tenure left"
              value={`${auditInput.tenureRemainingMonths} months`}
            />
            <FactPill
              label="Primary goal"
              value={BIGGEST_GOAL_LABELS[auditInput.biggestGoal]}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            <p>{buildSnapshotLine(auditInput)}</p>
            <p className="mt-2">
              You reported {LOAN_TYPE_LABELS[auditInput.loanType].toLowerCase()} financing
              with {auditInput.lenderName} in {auditInput.city}, plus{" "}
              {auditInput.alreadyContactedBank === "yes"
                ? "some prior bank contact that should shape the next move."
                : "no prior bank conversation yet, which usually means negotiation should be tested first."}
            </p>
            {support.bankResponseNote ? (
              <p
                className={`mt-2 rounded-xl border px-3 py-3 font-medium ${
                  bankNoteIsDenial
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {support.bankResponseNote}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            icon={<ClipboardList className="h-5 w-5" />}
            eyebrow="Next steps"
            title="What to do next"
          />
          <div className="mt-5 space-y-3">
            {support.actionSteps.map((step, index) => (
              <ListCard key={step} text={step} index={index + 1} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <SupportCard
          icon={<ShieldAlert className="h-5 w-5" />}
          eyebrow="Watch-outs"
          title="Before you say yes"
          items={support.watchouts}
          tone="amber"
        />
        <SupportCard
          icon={<FileText className="h-5 w-5" />}
          eyebrow="Keep ready"
          title="Documents that help"
          items={support.documents}
          tone="slate"
        />
        <SupportCard
          icon={<HelpCircle className="h-5 w-5" />}
          eyebrow="Ask clearly"
          title="Questions for the lender"
          items={support.lenderQuestions}
          tone="teal"
        />
      </div>
    </motion.section>
  );
}

interface FactPillProps {
  label: string;
  value: string;
}

function FactPill({ label, value }: FactPillProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}

function SectionHeader({ icon, eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </p>
        <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
      </div>
    </div>
  );
}

interface ListCardProps {
  text: string;
  index?: number;
}

function ListCard({ text, index }: ListCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
      <div className="flex items-start gap-3">
        {typeof index === "number" ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-700 shadow-sm">
            {index}
          </div>
        ) : null}
        <div>{text}</div>
      </div>
    </div>
  );
}

interface SupportCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  items: string[];
  tone: "amber" | "slate" | "teal";
}

const supportToneStyles = {
  amber: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.98))]",
  slate: "border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))]",
  teal: "border-teal-200 bg-[linear-gradient(180deg,rgba(240,253,250,0.96),rgba(255,255,255,0.98))]",
};

function SupportCard({ icon, eyebrow, title, items, tone }: SupportCardProps) {
  return (
    <div className={`rounded-[1.9rem] border p-6 shadow-sm ${supportToneStyles[tone]}`}>
      <SectionHeader icon={icon} eyebrow={eyebrow} title={title} />
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <ListCard key={item} text={item} />
        ))}
      </div>
    </div>
  );
}
