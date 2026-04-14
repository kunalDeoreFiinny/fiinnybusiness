export type LoanType =
  | "home"
  | "personal"
  | "car"
  | "bike"
  | "business"
  | "other";

export type CibilRange =
  | "below_650"
  | "650_700"
  | "700_750"
  | "750_plus";

export type EmploymentType = "salaried" | "self_employed" | "other";

export type MonthlyIncomeRange =
  | "below_25000"
  | "25000_50000"
  | "50000_100000"
  | "100000_200000"
  | "200000_plus";

export type YesNo = "yes" | "no";

export type BiggestGoal =
  | "reduce_emi"
  | "reduce_tenure"
  | "reduce_total_interest"
  | "switch_lender"
  | "understand_options";

export type OpportunityBand = "High" | "Medium" | "Low";

export interface LoanAuditDraft {
  loanType: LoanType | "";
  lenderName: string;
  interestRate: string;
  loanAmount: string;
  emi: string;
  tenureRemainingMonths: string;
  cibilRange: CibilRange | "";
  employmentType: EmploymentType | "";
  monthlyIncomeRange: MonthlyIncomeRange | "";
  city: string;
  alreadyContactedBank: YesNo | "";
  contactOutcome: string;
  biggestGoal: BiggestGoal | "";
}

export interface LoanAuditInput {
  loanType: LoanType;
  lenderName: string;
  interestRate: number;
  loanAmount: number;
  emi: number;
  tenureRemainingMonths: number;
  cibilRange: CibilRange;
  employmentType: EmploymentType;
  monthlyIncomeRange: MonthlyIncomeRange;
  city: string;
  alreadyContactedBank: YesNo;
  contactOutcome: string;
  biggestGoal: BiggestGoal;
}

export interface LoanAuditResult {
  opportunityBand: OpportunityBand;
  estimatedSavingsRange: string;
  recommendedNextStep: string;
  confidenceNote: string;
  reasons: string[];
}

export interface LoanAuditLead {
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
}

export interface LoanAuditSubmissionPayload {
  auditInput: LoanAuditInput;
  auditResult: LoanAuditResult;
  lead: LoanAuditLead;
}

export interface LoanAuditSubmissionResponse {
  id: string;
  success: boolean;
}

export interface LoanAuditLeadRecord {
  id: string;
  auditInput: LoanAuditInput;
  auditResult: LoanAuditResult;
  lead: LoanAuditLead;
  status: string;
  createdAtMs: number;
  meta: {
    source: string;
    origin: string | null;
    submittedByUid: string | null;
  };
}
