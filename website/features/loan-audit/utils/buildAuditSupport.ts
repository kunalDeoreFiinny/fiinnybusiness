import {
  BIGGEST_GOAL_LABELS,
  CIBIL_RANGE_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  MONTHLY_INCOME_LABELS,
} from "@/features/loan-audit/constants";
import { LoanAuditInput, LoanAuditResult } from "@/features/loan-audit/types";
import { analyzeBankOutcome } from "@/features/loan-audit/utils/bankOutcome";

interface AuditSupportPlan {
  summary: string;
  actionSteps: string[];
  watchouts: string[];
  documents: string[];
  lenderQuestions: string[];
  bankResponseNote: string | null;
}

export function buildAuditSupport(
  input: LoanAuditInput,
  result: LoanAuditResult
): AuditSupportPlan {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);
  const actionSteps = buildActionSteps(input, result);
  const watchouts = buildWatchouts(input, result);
  const documents = buildDocuments(input);
  const lenderQuestions = buildLenderQuestions(input, result);

  return {
    summary: buildSummary(input, result),
    actionSteps,
    watchouts,
    documents,
    lenderQuestions,
    bankResponseNote: buildBankResponseNote(input, bankOutcome),
  };
}

function buildSummary(input: LoanAuditInput, result: LoanAuditResult): string {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);

  if (input.alreadyContactedBank === "yes" && bankOutcome.denial) {
    if (result.opportunityBand === "High") {
      return `Your current bank appears to have denied relief, but the overall case can still be worth testing outside the same lender. The goal now is to check whether ${BIGGEST_GOAL_LABELS[input.biggestGoal].toLowerCase()} still looks worthwhile after real external pricing and fees.`;
    }

    if (result.opportunityBand === "Medium") {
      return `Your current bank appears to have denied relief, so the question is no longer whether to repeat the same request. It is whether one careful outside comparison can still improve ${BIGGEST_GOAL_LABELS[input.biggestGoal].toLowerCase()} after charges and paperwork.`;
    }

    return `Your current bank appears to have denied relief, and the broader case still looks weak today. The better move may be to understand why the case was refused, protect your profile, and revisit once the setup improves.`;
  }

  if (result.opportunityBand === "High") {
    return `Your current setup shows enough pressure and enough profile strength to justify a real conversation now. The goal is not just a lower headline rate. It is to confirm whether ${BIGGEST_GOAL_LABELS[input.biggestGoal].toLowerCase()} is still worthwhile after fees, revised tenure, and actual lender terms.`;
  }

  if (result.opportunityBand === "Medium") {
    return `There may be room here, but the decision probably depends on fee leakage, actual lender appetite, and whether the revised offer really improves ${BIGGEST_GOAL_LABELS[input.biggestGoal].toLowerCase()}. This is a compare-carefully case, not an apply-everywhere case.`;
  }

  return `This looks like a weaker refinance window right now. That does not mean you are stuck forever. It usually means the better move today is to protect your profile, ask cleaner questions, and revisit once the case is stronger.`;
}

function buildActionSteps(
  input: LoanAuditInput,
  result: LoanAuditResult
): string[] {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);
  const steps = [
    "Pull your latest loan statement or app snapshot so you can verify rate, EMI, and tenure before speaking to any lender.",
  ];

  if (input.alreadyContactedBank === "no") {
    steps.push(
      "Ask your current lender for a written rate review or conversion quote first. A simple retention offer can sometimes save you the work of switching."
    );
  } else if (bankOutcome.denial) {
    steps.push(
      "Keep the denial or refusal note handy. It tells you not to waste time repeating the same verbal request without a different route or a stronger case."
    );
  } else if (bankOutcome.formalOffer) {
    steps.push(
      "Take your bank's response in writing and ask them to show the revised EMI, revised tenure, and total one-time charges instead of just a verbal promise."
    );
  } else {
    steps.push(
      "Summarize your bank's response clearly and get it in writing before you compare next steps."
    );
  }

  if (result.opportunityBand === "High" && bankOutcome.denial) {
    steps.push(
      "Since the current bank refused relief, compare one outside lender or escalation path and calculate break-even after all fees before you act."
    );
  } else if (result.opportunityBand === "High") {
    steps.push(
      "Compare one outside lender quote after that. Use it to calculate break-even after fees before you decide to refinance."
    );
  } else if (result.opportunityBand === "Medium" && bankOutcome.denial) {
    steps.push(
      "Try only one careful outside comparison. If the pricing or eligibility is weak, stop there instead of filing multiple fresh applications."
    );
  } else if (result.opportunityBand === "Medium") {
    steps.push(
      "Compare only one or two options and reject any offer that lowers EMI by simply stretching the loan too long."
    );
  } else {
    steps.push(
      "Hold off on multiple applications for now. Focus on improving the case before you trigger more credit checks or paperwork."
    );
  }

  return steps.slice(0, 3);
}

function buildWatchouts(
  input: LoanAuditInput,
  result: LoanAuditResult
): string[] {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);
  const watchouts = [
    "Do not judge the deal on EMI alone. A lower EMI can still mean more total interest if the loan gets stretched.",
    "Ask for the full fee stack: processing, legal, valuation, MOD, foreclosure, and any bundled insurance.",
  ];

  if (bankOutcome.denial) {
    watchouts.push(
      "A denial from your current bank does not automatically mean every outside lender will refuse, but it does mean you should compare carefully instead of assuming easy approval."
    );
  } else if (input.cibilRange === "below_650") {
    watchouts.push(
      "If your score is already strained, avoid unnecessary fresh applications. Too many hard inquiries can make the case harder."
    );
  } else if (input.tenureRemainingMonths >= 180) {
    watchouts.push(
      "Long remaining tenure can magnify savings, but it can also hide poor offers. Compare break-even months and total cost, not just monthly relief."
    );
  } else if (result.opportunityBand === "High") {
    watchouts.push(
      "A strong opportunity can still be spoiled by conversion charges or a lender quietly resetting the loan for much longer."
    );
  } else {
    watchouts.push(
      "If the case is only moderate or weak, small rate cuts can disappear once charges and documentation effort are included."
    );
  }

  return watchouts.slice(0, 3);
}

function buildDocuments(input: LoanAuditInput): string[] {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);
  const documents = [
    "Latest loan statement, sanction letter, or lender app screenshot",
    "An ID proof and address proof if you end up comparing outside lenders",
  ];

  if (input.employmentType === "salaried") {
    documents.push("Recent salary slips or salary credits, plus bank statements");
  } else if (input.employmentType === "self_employed") {
    documents.push("Recent bank statements, ITR, GST, or business income proof");
  } else {
    documents.push("Any stable income proof you can show consistently");
  }

  if (input.alreadyContactedBank === "yes" && bankOutcome.denial) {
    documents.push("Any email, SMS, or note showing the denial or refusal from your bank");
  } else if (input.alreadyContactedBank === "yes") {
    documents.push("Any email, SMS, or note showing what your bank already offered");
  }

  return documents.slice(0, 4);
}

function buildLenderQuestions(
  input: LoanAuditInput,
  result: LoanAuditResult
): string[] {
  const bankOutcome = analyzeBankOutcome(input.contactOutcome);
  const questions = bankOutcome.denial
    ? [
        "Was the denial policy-based, profile-based, or simply branch-level guidance?",
        "If I test one outside option, what exact rate and total one-time cost would I need to beat for the switch to make sense?",
      ]
    : [
        "What exact rate can you offer me today in writing, and does it change my EMI, tenure, or both?",
        "What is the complete one-time cost of this change, including any hidden processing or legal charges?",
      ];

  if (result.opportunityBand === "High") {
    questions.push(
      "After all charges, how many months would it take for me to recover the cost and start saving net?"
    );
  } else {
    questions.push(
      "If you cannot improve the rate meaningfully, what would make this case stronger in the next few months?"
    );
  }

  if (input.biggestGoal === "reduce_tenure") {
    questions.push("Can I keep my EMI similar and cut tenure instead of stretching the loan?");
  } else if (input.biggestGoal === "reduce_emi") {
    questions.push("If the EMI is reduced, what happens to the total interest over the remaining life of the loan?");
  } else {
    questions.push(
      `How does this offer specifically improve my goal of ${BIGGEST_GOAL_LABELS[input.biggestGoal].toLowerCase()}?`
    );
  }

  return questions.slice(0, 4);
}

export function buildSnapshotLine(input: LoanAuditInput): string {
  return `${CIBIL_RANGE_LABELS[input.cibilRange]} CIBIL, ${EMPLOYMENT_TYPE_LABELS[input.employmentType].toLowerCase()} profile, ${MONTHLY_INCOME_LABELS[input.monthlyIncomeRange].toLowerCase()}.`;
}

function buildBankResponseNote(
  input: LoanAuditInput,
  bankOutcome: ReturnType<typeof analyzeBankOutcome>
): string | null {
  if (input.alreadyContactedBank !== "yes" || !bankOutcome.hasBankOutcome) {
    return null;
  }

  if (bankOutcome.denial) {
    return "Your note reads like a denial, so the follow-up should treat this as a refusal case, not as an active lender offer.";
  }

  if (bankOutcome.formalOffer) {
    return "Your note reads like the bank gave some kind of offer or concession, so the next step is comparing the written terms carefully.";
  }

  return "You already contacted the bank, but the outcome is still ambiguous. Try to get a written response before deciding what to do next.";
}
