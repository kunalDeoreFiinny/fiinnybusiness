"use client";

import {
  BIGGEST_GOAL_LABELS,
  LOAN_TYPE_LABELS,
} from "@/features/loan-audit/constants";
import { LoanAuditLeadRecord } from "@/features/loan-audit/types";

interface LoanAuditAdminTableProps {
  records: LoanAuditLeadRecord[];
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const amountFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const bandStyles = {
  High: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-700",
};

export default function LoanAuditAdminTable({
  records,
}: LoanAuditAdminTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
        No loan audit leads match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Loan</th>
              <th className="px-6 py-4">Opportunity</th>
              <th className="px-6 py-4">Goal</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="align-top hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">
                    {record.lead.fullName}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {record.lead.phone}
                  </div>
                  <div className="text-sm text-slate-400">{record.lead.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-semibold text-slate-800">
                    {LOAN_TYPE_LABELS[record.auditInput.loanType]}
                  </div>
                  <div className="mt-1">{record.auditInput.lenderName}</div>
                  <div className="mt-1 text-slate-400">
                    {amountFormatter.format(record.auditInput.loanAmount)} at{" "}
                    {record.auditInput.interestRate}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${bandStyles[record.auditResult.opportunityBand]}`}
                  >
                    {record.auditResult.opportunityBand}
                  </span>
                  <div className="mt-2 text-sm font-medium text-slate-700">
                    {record.auditResult.estimatedSavingsRange}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                    {record.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {BIGGEST_GOAL_LABELS[record.auditInput.biggestGoal]}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {dateFormatter.format(record.createdAtMs)}
                </td>
                <td className="px-6 py-4 text-sm leading-relaxed text-slate-600">
                  <div>{record.auditResult.recommendedNextStep}</div>
                  {record.auditInput.contactOutcome ? (
                    <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Bank note: {record.auditInput.contactOutcome}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
