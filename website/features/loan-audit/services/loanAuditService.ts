import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import {
  LoanAuditLeadRecord,
  LoanAuditSubmissionPayload,
  LoanAuditSubmissionResponse,
} from "@/features/loan-audit/types";

const submitLoanAuditLeadFn = httpsCallable<
  LoanAuditSubmissionPayload,
  LoanAuditSubmissionResponse
>(functions, "submitLoanAuditLead");

const listLoanAuditLeadsFn = httpsCallable<void, { leads: LoanAuditLeadRecord[] }>(
  functions,
  "listLoanAuditLeads"
);

export async function submitLoanAuditLead(
  payload: LoanAuditSubmissionPayload
): Promise<LoanAuditSubmissionResponse> {
  const response = await submitLoanAuditLeadFn(payload);
  return response.data;
}

export async function listLoanAuditLeads(): Promise<LoanAuditLeadRecord[]> {
  const response = await listLoanAuditLeadsFn();
  return response.data.leads;
}
