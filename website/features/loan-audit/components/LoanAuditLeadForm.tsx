"use client";

import PrimaryButton from "@/components/widgets/PrimaryButton";
import { LOAN_AUDIT_FOLLOW_UP_BULLETS } from "@/features/loan-audit/constants";
import { submitLoanAuditLead } from "@/features/loan-audit/services/loanAuditService";
import {
  LoanAuditInput,
  LoanAuditLead,
  LoanAuditResult,
} from "@/features/loan-audit/types";
import { CheckCircle2, PhoneCall, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface LoanAuditLeadFormProps {
  auditInput: LoanAuditInput;
  auditResult: LoanAuditResult;
}

export default function LoanAuditLeadForm({
  auditInput,
  auditResult,
}: LoanAuditLeadFormProps) {
  const [lead, setLead] = useState<LoanAuditLead>({
    fullName: "",
    phone: "",
    email: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    setLead({
      fullName: "",
      phone: "",
      email: "",
      consent: false,
    });
    setSubmitting(false);
    setError(null);
    setSuccessId(null);
  }, [auditInput, auditResult]);

  function updateField(field: keyof LoanAuditLead, value: string | boolean) {
    setLead((current) => ({ ...current, [field]: value }) as LoanAuditLead);
  }

  function validateLead(): string | null {
    if (!lead.fullName.trim()) return "Full name is required.";
    if (lead.fullName.trim().length > 120) {
      return "Keep your name under 120 characters.";
    }

    const digitCount = lead.phone.replace(/\D/g, "").length;
    if (digitCount < 10 || digitCount > 15) {
      return "Enter a valid phone number.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(lead.email.trim())) return "Enter a valid email address.";
    if (!lead.consent) return "Please confirm your consent to continue.";
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateLead();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await submitLoanAuditLead({
        auditInput,
        auditResult,
        lead: {
          fullName: lead.fullName.trim(),
          phone: lead.phone.trim(),
          email: lead.email.trim().toLowerCase(),
          consent: lead.consent,
        },
      });

      setSuccessId(response.id);
    } catch (submissionError: unknown) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Could not save your loan audit lead. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2.15rem] border border-white/70 bg-white/94 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[1.95rem] border border-teal-100 bg-[linear-gradient(180deg,rgba(240,253,250,0.96),rgba(255,255,255,0.98))] p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Free follow-up
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Save this audit and get a follow-up path
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Share your details only if you want this audit saved and you want help
            turning it into an actual bank conversation or comparison process.
          </p>

          <div className="mt-6 space-y-3">
            {LOAN_AUDIT_FOLLOW_UP_BULLETS.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-sm leading-relaxed text-slate-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <TrustBlock
              icon={<PhoneCall className="h-4 w-4" />}
              label="Follow-up style"
              text="Process support and comparison clarity, not pressure."
            />
            <TrustBlock
              icon={<ShieldCheck className="h-4 w-4" />}
              label="How we use it"
              text="Stored only to support this audit and related follow-up."
            />
          </div>
        </div>

        <div className="rounded-[1.95rem] border border-slate-200 bg-white p-6 shadow-sm">
      {successId ? (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="text-lg font-black tracking-tight">
                Audit saved successfully
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                We captured your loan audit snapshot and contact details. Reference
                ID: <span className="font-bold">{successId}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                Next best step: keep your latest statement and any lender reply handy
                so the comparison stays grounded in actual terms, not just headline rates.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Contact details
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Request follow-up only if you want help
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Full name"
              value={lead.fullName}
              onChange={(value) => updateField("fullName", value)}
              placeholder="Example: Karan Gupta"
            />
            <Field
              label="Phone"
              value={lead.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="Example: +91 98765 43210"
              type="tel"
            />
          </div>

          <Field
            label="Email"
            value={lead.email}
            onChange={(value) => updateField("email", value)}
            placeholder="Example: name@example.com"
            type="email"
          />

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-600">
            <input
              type="checkbox"
              checked={lead.consent}
              onChange={(event) => updateField("consent", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              I consent to Fiinny contacting me about this loan audit and storing
              the information I submitted for follow-up support.
            </span>
          </label>

          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : null}

          <PrimaryButton type="submit" loading={submitting} className="px-7 py-3.5 text-base">
            Save my audit and request follow-up
          </PrimaryButton>
        </form>
      )}
        </div>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold uppercase tracking-wide text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
      />
    </div>
  );
}

interface TrustBlockProps {
  icon: React.ReactNode;
  label: string;
  text: string;
}

function TrustBlock({ icon, label, text }: TrustBlockProps) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 shadow-sm">
      <div className="flex items-center gap-2 text-teal-600">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
