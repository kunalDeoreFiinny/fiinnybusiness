export interface BankOutcomeSignals {
  hasBankOutcome: boolean;
  denial: boolean;
  formalOffer: boolean;
  bestRateClaim: boolean;
  feeUnclear: boolean;
}

const denialPhrases = [
  "deny",
  "denied",
  "rejected",
  "reject",
  "declined",
  "decline",
  "refused",
  "refuse",
  "not possible",
  "no such rule",
  "cannot",
  "can't",
  "unable",
  "not eligible",
  "ineligible",
];

const offerPhrases = [
  "offered",
  "offer",
  "reduction",
  "reduced",
  "lowered",
  "lower",
  "reprice",
  "repricing",
  "conversion",
  "revised",
];

const bestRatePhrases = [
  "already low",
  "best rate",
  "best possible rate",
  "matched",
  "final rate",
];

const unclearFeePhrases = [
  "fee",
  "fees",
  "charge",
  "charges",
  "processing",
  "legal",
  "unclear",
  "hidden",
];

function hasAnyPhrase(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

export function analyzeBankOutcome(rawOutcome: string): BankOutcomeSignals {
  const normalized = rawOutcome.trim().toLowerCase();
  const hasBankOutcome = normalized.length > 0;

  if (!hasBankOutcome) {
    return {
      hasBankOutcome: false,
      denial: false,
      formalOffer: false,
      bestRateClaim: false,
      feeUnclear: false,
    };
  }

  return {
    hasBankOutcome,
    denial: hasAnyPhrase(normalized, denialPhrases),
    formalOffer: hasAnyPhrase(normalized, offerPhrases),
    bestRateClaim: hasAnyPhrase(normalized, bestRatePhrases),
    feeUnclear: hasAnyPhrase(normalized, unclearFeePhrases),
  };
}
