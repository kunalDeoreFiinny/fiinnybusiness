"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import LoanAuditAdminTable from "@/features/loan-audit/components/LoanAuditAdminTable";
import {
  LOAN_TYPE_OPTIONS,
  OPPORTUNITY_BAND_OPTIONS,
} from "@/features/loan-audit/constants";
import { listLoanAuditLeads } from "@/features/loan-audit/services/loanAuditService";
import {
  LoanAuditLeadRecord,
  LoanType,
  OpportunityBand,
} from "@/features/loan-audit/types";

export default function AdminLoanAuditPage() {
  const [records, setRecords] = useState<LoanAuditLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanType | "all">("all");
  const [bandFilter, setBandFilter] = useState<OpportunityBand | "all">("all");

  async function loadLeads() {
    setLoading(true);
    setError(null);

    try {
      const leads = await listLoanAuditLeads();
      setRecords(leads);
    } catch (loadError: unknown) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Could not load loan audit leads.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesLoanType =
      loanTypeFilter === "all" || record.auditInput.loanType === loanTypeFilter;
    const matchesBand =
      bandFilter === "all" || record.auditResult.opportunityBand === bandFilter;
    return matchesLoanType && matchesBand;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>Fiinny Admin</span>
          <span className="text-slate-300">/</span>
          <span className="text-teal-600">Loan Audit</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <button
            type="button"
            onClick={() => void loadLeads()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Loan Audit Leads</h1>
            <p className="mt-2 text-sm text-slate-500">
              Public loan audit submissions stored through Firebase callable
              functions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FilterField
              label="Loan type"
              value={loanTypeFilter}
              onChange={(value) => setLoanTypeFilter(value as LoanType | "all")}
            >
              <option value="all">All loan types</option>
              {LOAN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterField>

            <FilterField
              label="Opportunity band"
              value={bandFilter}
              onChange={(value) => setBandFilter(value as OpportunityBand | "all")}
            >
              <option value="all">All bands</option>
              {OPPORTUNITY_BAND_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </FilterField>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-20 text-slate-500">
            <Loader2 className="mr-3 h-6 w-6 animate-spin text-teal-600" />
            Loading loan audit leads...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-6 text-rose-700">
            {error}
          </div>
        ) : (
          <LoanAuditAdminTable records={filteredRecords} />
        )}
      </main>
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function FilterField({
  label,
  value,
  onChange,
  children,
}: FilterFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      >
        {children}
      </select>
    </label>
  );
}
