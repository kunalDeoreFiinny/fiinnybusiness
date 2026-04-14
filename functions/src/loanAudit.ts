import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

if (getApps().length === 0) initializeApp();

const db = getFirestore();
const COLLECTION_NAME = "loan_audit_leads";

const LOAN_TYPES = ["home", "personal", "car", "bike", "business", "other"] as const;
const CIBIL_RANGES = ["below_650", "650_700", "700_750", "750_plus"] as const;
const EMPLOYMENT_TYPES = ["salaried", "self_employed", "other"] as const;
const MONTHLY_INCOME_RANGES = [
  "below_25000",
  "25000_50000",
  "50000_100000",
  "100000_200000",
  "200000_plus",
] as const;
const YES_NO = ["yes", "no"] as const;
const BIGGEST_GOALS = [
  "reduce_emi",
  "reduce_tenure",
  "reduce_total_interest",
  "switch_lender",
  "understand_options",
] as const;
const OPPORTUNITY_BANDS = ["High", "Medium", "Low"] as const;

type LoanType = (typeof LOAN_TYPES)[number];
type CibilRange = (typeof CIBIL_RANGES)[number];
type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
type MonthlyIncomeRange = (typeof MONTHLY_INCOME_RANGES)[number];
type YesNo = (typeof YES_NO)[number];
type BiggestGoal = (typeof BIGGEST_GOALS)[number];
type OpportunityBand = (typeof OPPORTUNITY_BANDS)[number];

interface LoanAuditInput {
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

interface LoanAuditResult {
  opportunityBand: OpportunityBand;
  estimatedSavingsRange: string;
  recommendedNextStep: string;
  confidenceNote: string;
  reasons: string[];
}

interface LoanAuditLead {
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
}

interface LoanAuditLeadRecord {
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

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", `${label} is required.`);
  }
  return value as Record<string, unknown>;
}

function readEnum<T extends readonly string[]>(
  value: unknown,
  label: string,
  allowed: T
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value as T[number])) {
    throw new HttpsError("invalid-argument", `${label} is invalid.`);
  }
  return value as T[number];
}

function readString(
  value: unknown,
  label: string,
  maxLength: number,
  required = true
): string {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new HttpsError("invalid-argument", `${label} is required.`);
  }

  const cleaned = value.trim();
  if (required && !cleaned) {
    throw new HttpsError("invalid-argument", `${label} is required.`);
  }

  if (cleaned.length > maxLength) {
    throw new HttpsError("invalid-argument", `${label} is too long.`);
  }

  return cleaned;
}

function readNumber(
  value: unknown,
  label: string,
  min: number,
  max: number
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new HttpsError("invalid-argument", `${label} is invalid.`);
  }
  return parsed;
}

function readEmail(value: unknown): string {
  const email = readString(value, "Email", 160);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new HttpsError("invalid-argument", "Email is invalid.");
  }
  return email.toLowerCase();
}

function readPhone(value: unknown): string {
  const phone = readString(value, "Phone", 30);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    throw new HttpsError("invalid-argument", "Phone is invalid.");
  }
  return phone;
}

function readReasons(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 5) {
    throw new HttpsError("invalid-argument", "Reasons are invalid.");
  }

  return value.map((item) => readString(item, "Reason", 220));
}

function readAuditInput(value: unknown): LoanAuditInput {
  const data = asRecord(value, "auditInput");
  const alreadyContactedBank = readEnum(
    data.alreadyContactedBank,
    "alreadyContactedBank",
    YES_NO
  );
  const contactOutcome = readString(
    data.contactOutcome,
    "contactOutcome",
    400,
    alreadyContactedBank === "yes"
  );

  return {
    loanType: readEnum(data.loanType, "loanType", LOAN_TYPES),
    lenderName: readString(data.lenderName, "lenderName", 80),
    interestRate: readNumber(data.interestRate, "interestRate", 1, 40),
    loanAmount: readNumber(data.loanAmount, "loanAmount", 1000, 500000000),
    emi: readNumber(data.emi, "emi", 500, 10000000),
    tenureRemainingMonths: readNumber(
      data.tenureRemainingMonths,
      "tenureRemainingMonths",
      1,
      480
    ),
    cibilRange: readEnum(data.cibilRange, "cibilRange", CIBIL_RANGES),
    employmentType: readEnum(
      data.employmentType,
      "employmentType",
      EMPLOYMENT_TYPES
    ),
    monthlyIncomeRange: readEnum(
      data.monthlyIncomeRange,
      "monthlyIncomeRange",
      MONTHLY_INCOME_RANGES
    ),
    city: readString(data.city, "city", 80),
    alreadyContactedBank,
    contactOutcome,
    biggestGoal: readEnum(data.biggestGoal, "biggestGoal", BIGGEST_GOALS),
  };
}

function readAuditResult(value: unknown): LoanAuditResult {
  const data = asRecord(value, "auditResult");
  return {
    opportunityBand: readEnum(
      data.opportunityBand,
      "opportunityBand",
      OPPORTUNITY_BANDS
    ),
    estimatedSavingsRange: readString(
      data.estimatedSavingsRange,
      "estimatedSavingsRange",
      80
    ),
    recommendedNextStep: readString(
      data.recommendedNextStep,
      "recommendedNextStep",
      240
    ),
    confidenceNote: readString(data.confidenceNote, "confidenceNote", 240),
    reasons: readReasons(data.reasons),
  };
}

function readLead(value: unknown): LoanAuditLead {
  const data = asRecord(value, "lead");
  const consent = data.consent;
  if (consent !== true) {
    throw new HttpsError("invalid-argument", "Consent is required.");
  }

  return {
    fullName: readString(data.fullName, "fullName", 120),
    phone: readPhone(data.phone),
    email: readEmail(data.email),
    consent: true,
  };
}

export const submitLoanAuditLead = onCall(
  { region: "asia-south1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    const data = asRecord(request.data, "request");
    const auditInput = readAuditInput(data.auditInput);
    const auditResult = readAuditResult(data.auditResult);
    const lead = readLead(data.lead);

    const originHeader = request.rawRequest.headers.origin;
    const origin = typeof originHeader === "string" ? originHeader : null;
    const docRef = await db.collection(COLLECTION_NAME).add({
      auditInput,
      auditResult,
      lead,
      status: "new",
      meta: {
        source: "website_loan_audit_v1",
        origin,
        submittedByUid: request.auth?.uid ?? null,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      id: docRef.id,
      success: true,
    };
  }
);

export const listLoanAuditLeads = onCall(
  { region: "asia-south1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const leads: LoanAuditLeadRecord[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAtMs =
        typeof data.createdAt?.toMillis === "function"
          ? data.createdAt.toMillis()
          : Date.now();

      return {
        id: doc.id,
        auditInput: data.auditInput as LoanAuditInput,
        auditResult: data.auditResult as LoanAuditResult,
        lead: data.lead as LoanAuditLead,
        status: typeof data.status === "string" ? data.status : "new",
        createdAtMs,
        meta: {
          source:
            typeof data.meta?.source === "string"
              ? data.meta.source
              : "website_loan_audit_v1",
          origin:
            typeof data.meta?.origin === "string" ? data.meta.origin : null,
          submittedByUid:
            typeof data.meta?.submittedByUid === "string"
              ? data.meta.submittedByUid
              : null,
        },
      };
    });

    return { leads };
  }
);
