"use client";

import { motion } from "framer-motion";
import PrimaryButton from "@/components/widgets/PrimaryButton";
import {
  BIGGEST_GOAL_OPTIONS,
  CIBIL_RANGE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  INITIAL_LOAN_AUDIT_DRAFT,
  LOAN_AUDIT_STEPS,
  LOAN_TYPE_OPTIONS,
  MONTHLY_INCOME_OPTIONS,
} from "@/features/loan-audit/constants";
import {
  BiggestGoal,
  CibilRange,
  EmploymentType,
  LoanAuditDraft,
  LoanAuditInput,
  LoanType,
  MonthlyIncomeRange,
  YesNo,
} from "@/features/loan-audit/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";

const STEP_FIELDS: Array<Array<keyof LoanAuditDraft>> = [
  [
    "loanType",
    "lenderName",
    "interestRate",
    "loanAmount",
    "emi",
    "tenureRemainingMonths",
  ],
  ["cibilRange", "employmentType", "monthlyIncomeRange", "city"],
  ["alreadyContactedBank", "contactOutcome", "biggestGoal"],
];

interface LoanAuditFormProps {
  onSubmit: (input: LoanAuditInput) => void;
}

type FormErrors = Partial<Record<keyof LoanAuditDraft, string>>;

function parseDraft(draft: LoanAuditDraft): LoanAuditInput {
  return {
    loanType: draft.loanType as LoanType,
    lenderName: draft.lenderName.trim(),
    interestRate: Number(draft.interestRate),
    loanAmount: Number(draft.loanAmount),
    emi: Number(draft.emi),
    tenureRemainingMonths: Number(draft.tenureRemainingMonths),
    cibilRange: draft.cibilRange as CibilRange,
    employmentType: draft.employmentType as EmploymentType,
    monthlyIncomeRange: draft.monthlyIncomeRange as MonthlyIncomeRange,
    city: draft.city.trim(),
    alreadyContactedBank: draft.alreadyContactedBank as YesNo,
    contactOutcome: draft.contactOutcome.trim(),
    biggestGoal: draft.biggestGoal as BiggestGoal,
  };
}

function numberError(label: string, value: string, min: number, max: number): string {
  const parsed = Number(value);
  if (!value) return `${label} is required.`;
  if (!Number.isFinite(parsed)) return `${label} must be a number.`;
  if (parsed < min || parsed > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return "";
}

export default function LoanAuditForm({ onSubmit }: LoanAuditFormProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<LoanAuditDraft>(INITIAL_LOAN_AUDIT_DRAFT);
  const [errors, setErrors] = useState<FormErrors>({});
  const activeStep = LOAN_AUDIT_STEPS[step];
  const progressPercent = ((step + 1) / LOAN_AUDIT_STEPS.length) * 100;

  function setField(field: keyof LoanAuditDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }) as LoanAuditDraft);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validateStep(currentStep: number): boolean {
    const nextErrors: FormErrors = {};

    for (const field of STEP_FIELDS[currentStep]) {
      switch (field) {
        case "loanType":
          if (!draft.loanType) nextErrors.loanType = "Loan type is required.";
          break;
        case "lenderName":
          if (!draft.lenderName.trim()) {
            nextErrors.lenderName = "Lender name is required.";
          } else if (draft.lenderName.trim().length > 80) {
            nextErrors.lenderName = "Keep lender name under 80 characters.";
          }
          break;
        case "interestRate": {
          const error = numberError("Interest rate", draft.interestRate, 1, 40);
          if (error) nextErrors.interestRate = error;
          break;
        }
        case "loanAmount": {
          const error = numberError("Loan amount", draft.loanAmount, 1000, 500000000);
          if (error) nextErrors.loanAmount = error;
          break;
        }
        case "emi": {
          const error = numberError("EMI", draft.emi, 500, 10000000);
          if (error) nextErrors.emi = error;
          break;
        }
        case "tenureRemainingMonths": {
          const error = numberError(
            "Remaining tenure",
            draft.tenureRemainingMonths,
            1,
            480
          );
          if (error) nextErrors.tenureRemainingMonths = error;
          break;
        }
        case "cibilRange":
          if (!draft.cibilRange) nextErrors.cibilRange = "CIBIL range is required.";
          break;
        case "employmentType":
          if (!draft.employmentType) {
            nextErrors.employmentType = "Employment type is required.";
          }
          break;
        case "monthlyIncomeRange":
          if (!draft.monthlyIncomeRange) {
            nextErrors.monthlyIncomeRange = "Monthly income range is required.";
          }
          break;
        case "city":
          if (!draft.city.trim()) {
            nextErrors.city = "City is required.";
          } else if (draft.city.trim().length > 80) {
            nextErrors.city = "Keep city under 80 characters.";
          }
          break;
        case "alreadyContactedBank":
          if (!draft.alreadyContactedBank) {
            nextErrors.alreadyContactedBank = "Please tell us if you already contacted your bank.";
          }
          break;
        case "contactOutcome":
          if (
            draft.alreadyContactedBank === "yes" &&
            !draft.contactOutcome.trim()
          ) {
            nextErrors.contactOutcome = "Tell us what happened with the bank.";
          } else if (draft.contactOutcome.trim().length > 400) {
            nextErrors.contactOutcome = "Keep this note under 400 characters.";
          }
          break;
        case "biggestGoal":
          if (!draft.biggestGoal) {
            nextErrors.biggestGoal = "Choose the main outcome you want.";
          }
          break;
        default:
          break;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, LOAN_AUDIT_STEPS.length - 1));
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(step)) return;
    onSubmit(parseDraft(draft));
  }

  return (
    <section className="rounded-[2.15rem] border border-white/70 bg-white/92 p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">
            Guided audit
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Share the basics. We will score the opportunity.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
            We use transparent rules only. No hidden black box, and no change to
            your existing Fiinny flows.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(180deg,rgba(240,253,250,0.9),rgba(255,255,255,0.95))] px-5 py-5 text-sm leading-relaxed text-teal-900 lg:max-w-sm">
          <p className="font-black uppercase tracking-[0.16em] text-teal-700">
            What this step does
          </p>
          <p className="mt-2 font-semibold">{activeStep.coachTitle}</p>
          <p className="mt-2 text-teal-800/90">{activeStep.coachDescription}</p>
        </div>
      </div>

      <div className="mt-8 rounded-[1.8rem] border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Progress
            </p>
            <p className="mt-1 text-lg font-black tracking-tight text-slate-900">
              Step {step + 1} of {LOAN_AUDIT_STEPS.length}: {activeStep.title}
            </p>
          </div>
          <div className="rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            Transparent rules. No hidden scoring.
          </div>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6,#0f766e)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
        {LOAN_AUDIT_STEPS.map((item, index) => {
          const isActive = index === step;
          const isCompleted = index < step;
          return (
            <div
              key={item.title}
              className={`rounded-[1.4rem] border px-4 py-4 transition-all ${
                isActive
                  ? "border-teal-500 bg-white shadow-md shadow-teal-900/5"
                  : isCompleted
                    ? "border-teal-200 bg-white"
                    : "border-slate-200 bg-white/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${
                    isActive || isCompleted
                      ? "bg-teal-600 text-white"
                      : "bg-white text-slate-400"
                  }`}
                >
                  0{index + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]"
        >
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {step === 0 && (
              <>
                <StepPanel
                  title="Loan identity"
                  subtitle="Tell us which loan you want to audit and who currently holds it."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <SelectField
                      label="Loan type"
                      value={draft.loanType}
                      onChange={(value) => setField("loanType", value)}
                      error={errors.loanType}
                      helper="Choose the loan you are evaluating right now."
                      placeholder="Select loan type"
                      options={LOAN_TYPE_OPTIONS}
                    />
                    <InputField
                      label="Lender name"
                      value={draft.lenderName}
                      onChange={(value) => setField("lenderName", value)}
                      error={errors.lenderName}
                      helper="Use the current bank or NBFC handling this loan."
                      placeholder="Example: HDFC Bank"
                    />
                  </div>
                </StepPanel>

                <StepPanel
                  title="Numbers that drive the audit"
                  subtitle="These usually decide whether refinancing or renegotiation is worth the effort."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <InputField
                      label="Current interest rate (%)"
                      value={draft.interestRate}
                      onChange={(value) => setField("interestRate", value)}
                      error={errors.interestRate}
                      helper="Use your current effective rate, not an old teaser rate."
                      placeholder="Example: 11.5"
                      type="number"
                      min="1"
                      max="40"
                      step="0.01"
                    />
                    <InputField
                      label="Loan amount (Rs)"
                      value={draft.loanAmount}
                      onChange={(value) => setField("loanAmount", value)}
                      error={errors.loanAmount}
                      helper="Outstanding balance is best. A good current estimate is also fine."
                      placeholder="Example: 2500000"
                      type="number"
                      min="1000"
                      step="1"
                    />
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <InputField
                      label="EMI (Rs)"
                      value={draft.emi}
                      onChange={(value) => setField("emi", value)}
                      error={errors.emi}
                      helper="Use the amount actually debited each month."
                      placeholder="Example: 24500"
                      type="number"
                      min="500"
                      step="1"
                    />
                    <InputField
                      label="Tenure remaining (months)"
                      value={draft.tenureRemainingMonths}
                      onChange={(value) => setField("tenureRemainingMonths", value)}
                      error={errors.tenureRemainingMonths}
                      helper="Longer tenure left usually creates more room for savings to matter."
                      placeholder="Example: 180"
                      type="number"
                      min="1"
                      max="480"
                      step="1"
                    />
                  </div>
                </StepPanel>
              </>
            )}

            {step === 1 && (
              <>
                <StepPanel
                  title="Profile strength"
                  subtitle="This helps us judge whether the opportunity is only theoretical or realistically executable."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <SelectField
                      label="CIBIL range"
                      value={draft.cibilRange}
                      onChange={(value) => setField("cibilRange", value)}
                      error={errors.cibilRange}
                      helper="Closest range is enough. You do not need the exact score."
                      placeholder="Select CIBIL range"
                      options={CIBIL_RANGE_OPTIONS}
                    />
                    <SelectField
                      label="Employment type"
                      value={draft.employmentType}
                      onChange={(value) => setField("employmentType", value)}
                      error={errors.employmentType}
                      helper="This helps estimate how easily a lender may underwrite the case."
                      placeholder="Select employment type"
                      options={EMPLOYMENT_TYPE_OPTIONS}
                    />
                  </div>
                </StepPanel>

                <StepPanel
                  title="Income and location context"
                  subtitle="We keep this broad on purpose. The goal is direction, not false precision."
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <SelectField
                      label="Monthly income range"
                      value={draft.monthlyIncomeRange}
                      onChange={(value) => setField("monthlyIncomeRange", value)}
                      error={errors.monthlyIncomeRange}
                      helper="Choose the range that reflects regular monthly inflow."
                      placeholder="Select monthly income range"
                      options={MONTHLY_INCOME_OPTIONS}
                    />
                    <InputField
                      label="City"
                      value={draft.city}
                      onChange={(value) => setField("city", value)}
                      error={errors.city}
                      helper="Useful because pricing and lender preference can vary by city."
                      placeholder="Example: Hyderabad"
                    />
                  </div>
                </StepPanel>
              </>
            )}

            {step === 2 && (
              <>
                <StepPanel
                  title="Bank interaction"
                  subtitle="This tells us whether the case is untouched, denied, or already partially negotiated."
                >
                  <FieldShell
                    label="Already contacted your bank?"
                    error={errors.alreadyContactedBank}
                    helper="This changes whether we suggest negotiation first or outside comparison first."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ChoiceButton
                        label="Yes"
                        description="They already replied or refused."
                        active={draft.alreadyContactedBank === "yes"}
                        onClick={() => setField("alreadyContactedBank", "yes")}
                      />
                      <ChoiceButton
                        label="No"
                        description="I have not asked them yet."
                        active={draft.alreadyContactedBank === "no"}
                        onClick={() => {
                          setField("alreadyContactedBank", "no");
                          setField("contactOutcome", "");
                        }}
                      />
                    </div>
                  </FieldShell>

                  {draft.alreadyContactedBank === "yes" && (
                    <div className="mt-6">
                      <TextAreaField
                        label="What happened?"
                        value={draft.contactOutcome}
                        onChange={(value) => setField("contactOutcome", value)}
                        error={errors.contactOutcome}
                        helper="A short summary helps us interpret whether to push harder or widen the search."
                        placeholder="Example: They denied the request, or offered a small reduction but fees were unclear."
                      />
                    </div>
                  )}
                </StepPanel>

                <StepPanel
                  title="Decision goal"
                  subtitle="Choose the outcome that matters most so the recommendation stays practical."
                >
                  <SelectField
                    label="Biggest goal"
                    value={draft.biggestGoal}
                    onChange={(value) => setField("biggestGoal", value)}
                    error={errors.biggestGoal}
                    helper="Be honest about what matters most. A lower EMI and lower total interest are not always the same decision."
                    placeholder="Select your goal"
                    options={BIGGEST_GOAL_OPTIONS}
                  />
                </StepPanel>
              </>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <div className="rounded-[1.85rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.96))] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Why we ask this
              </p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                {activeStep.coachTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {activeStep.coachDescription}
              </p>
            </div>

            <div className="rounded-[1.85rem] border border-teal-100 bg-[linear-gradient(180deg,rgba(240,253,250,0.95),rgba(255,255,255,0.95))] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Helpful notes
              </p>
              <div className="mt-4 space-y-3">
                {activeStep.coachChecklist.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-sm leading-relaxed text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.85rem] border border-slate-200 bg-slate-950 px-5 py-5 text-white shadow-lg shadow-slate-900/10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                Audit principle
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                We would rather tell someone to wait than push a weak refinance case.
                This should help users avoid bad applications, not create more of them.
              </p>
            </div>
          </aside>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Step {step + 1} of {LOAN_AUDIT_STEPS.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              We only ask for enough detail to make the next step practical.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton
              type="button"
              variant="ghost"
              icon={<ArrowLeft className="h-4 w-4" />}
              disabled={step === 0}
              onClick={handleBack}
            >
              Previous
            </PrimaryButton>

            {step < LOAN_AUDIT_STEPS.length - 1 ? (
              <PrimaryButton
                type="button"
                icon={<ArrowRight className="h-4 w-4" />}
                onClick={handleNext}
              >
                Continue
              </PrimaryButton>
            ) : (
              <PrimaryButton type="submit" icon={<ArrowRight className="h-4 w-4" />}>
                Show my audit
              </PrimaryButton>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

interface FieldShellProps {
  label: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, helper, children }: FieldShellProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-bold uppercase tracking-wide text-slate-700">
          {label}
        </label>
        {helper ? (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{helper}</p>
        ) : null}
      </div>
      {children}
      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

interface StepPanelProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function StepPanel({ title, subtitle, children }: StepPanelProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Step block
        </p>
        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  placeholder: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}

function InputField({
  label,
  value,
  onChange,
  error,
  helper,
  placeholder,
  type = "text",
  min,
  max,
  step,
}: InputFieldProps) {
  return (
    <FieldShell label={label} error={error} helper={helper}>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
      />
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}

function SelectField({
  label,
  value,
  onChange,
  error,
  helper,
  placeholder,
  options,
}: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} helper={helper}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  placeholder: string;
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
  helper,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <FieldShell label={label} error={error} helper={helper}>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
      />
    </FieldShell>
  );
}

interface ChoiceButtonProps {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}

function ChoiceButton({ label, description, active, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
        active
          ? "border-teal-500 bg-teal-50 text-teal-800 shadow-md shadow-teal-900/5"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <p className="text-lg font-black tracking-tight">{label}</p>
      {description ? (
        <p
          className={`mt-1 text-sm leading-relaxed ${
            active ? "text-teal-700" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      ) : null}
    </button>
  );
}
