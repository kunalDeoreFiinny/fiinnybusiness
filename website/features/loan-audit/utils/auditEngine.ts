import {
  BIGGEST_GOAL_LABELS,
  CIBIL_RANGE_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  LOAN_TYPE_LABELS,
  MONTHLY_INCOME_LABELS,
} from "@/features/loan-audit/constants";
import {
  LoanAuditInput,
  LoanAuditResult,
  MonthlyIncomeRange,
  OpportunityBand,
} from "@/features/loan-audit/types";
import { analyzeBankOutcome } from "@/features/loan-audit/utils/bankOutcome";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function midpointForIncomeRange(range: MonthlyIncomeRange): number {
  switch (range) {
    case "below_25000":
      return 20000;
    case "25000_50000":
      return 37500;
    case "50000_100000":
      return 75000;
    case "100000_200000":
      return 150000;
    case "200000_plus":
      return 250000;
    default:
      return 50000;
  }
}

function roundToNearest(value: number, base: number): number {
  if (value <= 0) return 0;
  return Math.max(base, Math.round(value / base) * base);
}

function formatSavingsRange(min: number, max: number): string {
  if (min <= 0) {
    return `Up to ${currencyFormatter.format(max)}`;
  }

  return `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
}

function bandFromScore(score: number): OpportunityBand {
  if (score >= 8) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function confidenceNoteForBand(band: OpportunityBand): string {
  if (band === "High") {
    return "This looks directionally strong, but lender offers, balance transfer fees, and your exact outstanding principal can still change the final savings.";
  }

  if (band === "Medium") {
    return "This is a directional estimate. A real quote can move either way once a lender checks your current outstanding balance and documentation.";
  }

  return "This looks like a weaker refinance window today. The result can improve later with a better score, stronger income profile, or lower market rates.";
}

function recommendedNextStep(input: LoanAuditInput, band: OpportunityBand): string {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);

  if (band === "High" && input.alreadyContactedBank === "no") {
    return "Ask your current lender for a rate review first, then compare one refinance quote so you can judge real savings after fees.";
  }

  if (
    band === "High" &&
    input.alreadyContactedBank === "yes" &&
    bankOutcome.denial
  ) {
    return "Your current bank appears to have denied relief, so do not rely on the same request again. Collect that response and compare one outside lender quote on net savings after fees.";
  }

  if (band === "High" && input.alreadyContactedBank === "yes") {
    return "Collect your latest statement and compare one outside lender quote against your current bank response before you decide.";
  }

  if (
    band === "Medium" &&
    input.alreadyContactedBank === "yes" &&
    bankOutcome.denial
  ) {
    return "Since your current bank appears to have denied relief, validate one outside option only if fees, paperwork, and eligibility still look sensible.";
  }

  if (band === "Medium") {
    return "Use this as a shortlist signal. Recheck with your lender, then compare one or two quotes only if fees stay reasonable.";
  }

  if (input.biggestGoal === "understand_options") {
    return "Hold off on a refinance decision for now and focus on clarifying your current rate, charges, and prepayment options first.";
  }

  return "Improving credit strength or EMI capacity may unlock better options later than a refinance attempt right now.";
}

function buildSavingsRange(input: LoanAuditInput, band: OpportunityBand): string {
  const totalRemainingRepayment = input.emi * input.tenureRemainingMonths;

  // We intentionally estimate savings from remaining repayment instead of
  // outstanding principal because the form does not collect the exact current
  // balance. That keeps the output broad, conservative, and easy to audit.
  let minRate = 0;
  let maxRate = 0.02;

  if (band === "High") {
    minRate = 0.05;
    maxRate = 0.12;
  } else if (band === "Medium") {
    minRate = 0.02;
    maxRate = 0.06;
  }

  const min = roundToNearest(totalRemainingRepayment * minRate, 5000);
  const max = roundToNearest(totalRemainingRepayment * maxRate, 5000);
  return formatSavingsRange(min, Math.max(max, min + 5000));
}

export function evaluateLoanAudit(input: LoanAuditInput): LoanAuditResult {
  let score = 0;
  const reasons: string[] = [];

  // Rule block 1: Higher current rates usually create more room for savings.
  if (input.interestRate >= 13) {
    score += 3;
    reasons.push(`Your ${input.interestRate}% rate is on the expensive side for a ${LOAN_TYPE_LABELS[input.loanType].toLowerCase()} loan.`);
  } else if (input.interestRate >= 10) {
    score += 2;
    reasons.push(`Your ${input.interestRate}% rate may still have room for improvement if the rest of your profile is strong.`);
  } else if (input.interestRate >= 8) {
    score += 1;
  }

  // Rule block 2: Longer remaining tenure creates more time for rate changes to matter.
  if (input.tenureRemainingMonths >= 180) {
    score += 3;
    reasons.push(`You still have ${input.tenureRemainingMonths} months left, so even a modest rate cut can compound into meaningful savings.`);
  } else if (input.tenureRemainingMonths >= 84) {
    score += 2;
  } else if (input.tenureRemainingMonths >= 36) {
    score += 1;
  }

  // Rule block 3: Stronger credit usually improves refinance or renegotiation options.
  switch (input.cibilRange) {
    case "750_plus":
      score += 3;
      reasons.push(`A ${CIBIL_RANGE_LABELS[input.cibilRange]} CIBIL profile typically improves negotiating power.`);
      break;
    case "700_750":
      score += 2;
      break;
    case "650_700":
      score += 1;
      break;
    case "below_650":
      score -= 2;
      reasons.push("Your current credit range may limit lender appetite, which weakens immediate refinance leverage.");
      break;
  }

  // Rule block 4: Stable income and EMI affordability usually improve execution odds.
  if (input.employmentType === "salaried") {
    score += 2;
  } else if (input.employmentType === "self_employed") {
    score += 1;
  }

  const incomeMidpoint = midpointForIncomeRange(input.monthlyIncomeRange);
  const emiLoad = input.emi / incomeMidpoint;
  if (emiLoad <= 0.25) {
    score += 2;
    reasons.push(`Your EMI looks manageable relative to the ${MONTHLY_INCOME_LABELS[input.monthlyIncomeRange].toLowerCase()} bracket.`);
  } else if (emiLoad <= 0.4) {
    score += 1;
  } else if (emiLoad > 0.55) {
    score -= 2;
    reasons.push("Your EMI burden looks high against the income range shared, which can weaken approval or savings quality.");
  } else if (emiLoad > 0.45) {
    score -= 1;
  }

  // Rule block 5: Bank feedback can raise or lower the chance that more effort is worth it.
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);
  if (input.alreadyContactedBank === "yes" && bankOutcome.hasBankOutcome) {
    if (bankOutcome.denial) {
      score += 1;
      reasons.push("Your current bank appears to have denied relief, which makes outside validation more relevant than repeating the same request.");
    }

    if (bankOutcome.bestRateClaim) {
      score -= 1;
    }

    if (bankOutcome.feeUnclear) {
      reasons.push("Your bank response still leaves charges or structure unclear, so total cost matters more than the headline rate alone.");
    }
  }

  if (input.biggestGoal === "switch_lender") {
    score += 1;
  }

  score = Math.max(0, Math.min(score, 12));
  const opportunityBand = bandFromScore(score);

  const trimmedReasons = reasons.slice(0, 3);
  if (trimmedReasons.length < 2) {
    trimmedReasons.push(
      `Your current profile combines ${EMPLOYMENT_TYPE_LABELS[input.employmentType].toLowerCase()} income with a ${BIGGEST_GOAL_LABELS[input.biggestGoal].toLowerCase()} goal.`
    );
  }

  return {
    opportunityBand,
    estimatedSavingsRange: buildSavingsRange(input, opportunityBand),
    recommendedNextStep: recommendedNextStep(input, opportunityBand),
    confidenceNote: confidenceNoteForBand(opportunityBand),
    reasons: trimmedReasons.slice(0, 3),
  };
}
