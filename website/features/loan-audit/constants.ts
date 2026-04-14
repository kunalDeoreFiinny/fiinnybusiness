import {
  BiggestGoal,
  CibilRange,
  EmploymentType,
  LoanAuditDraft,
  LoanType,
  MonthlyIncomeRange,
  OpportunityBand,
  YesNo,
} from "@/features/loan-audit/types";

export const LOAN_AUDIT_TRUST_BULLETS = [
  "Step-by-step clarity",
  "Estimate possible savings",
  "Know whether renegotiation or refinance may help",
];

export const LOAN_AUDIT_HOW_IT_WORKS = [
  {
    title: "Start with your current reality",
    description:
      "Share the rate, EMI, tenure left, and lender you are dealing with today. Approximate numbers are okay for a directional check.",
  },
  {
    title: "We pressure-test the opportunity",
    description:
      "The audit weighs rate pressure, remaining tenure, credit strength, EMI burden, and whether your bank has already responded.",
  },
  {
    title: "You get a next-step brief",
    description:
      "Instead of a vague score, you get a savings band, cautions, document prep, and specific questions to ask your bank or the next lender.",
  },
] as const;

export const LOAN_AUDIT_USE_CASES = [
  "You have a high rate and are unsure whether it is worth negotiating now.",
  "Your EMI feels heavy and you want to know whether a refinance would actually help.",
  "Your bank gave a half-answer and you want to sanity-check whether to push further.",
  "You do not want to waste time applying everywhere if the case is still weak.",
] as const;

export const LOAN_AUDIT_PREP_LIST = [
  "Latest loan statement or app screenshot",
  "Current EMI amount and tenure remaining",
  "Your approximate CIBIL range if you know it",
  "A rough idea of what you want most: lower EMI, shorter tenure, or lower total interest",
] as const;

export const LOAN_AUDIT_DISCLAIMER =
  "Fiinny provides educational guidance and process support, not legal or regulated financial advice.";

export const LOAN_AUDIT_STEPS = [
  {
    title: "Loan basics",
    description: "Tell us what loan you have and what you are paying today.",
    coachTitle: "Use the current snapshot, not the ideal one",
    coachDescription:
      "This step is about what the loan looks like today. Even if you do not know the exact outstanding balance, the current rate, EMI, and tenure left are enough for a useful first pass.",
    coachChecklist: [
      "Check the rate in your latest statement, banking app, or sanction email.",
      "If you are unsure about loan amount, your best current estimate is still fine.",
      "Tenure remaining matters because long tails create more room for savings to matter.",
    ],
  },
  {
    title: "Profile fit",
    description: "We use credit and income strength only for a directional audit.",
    coachTitle: "This is about execution strength, not judgment",
    coachDescription:
      "A refinance can look attractive on paper but still be difficult to execute. Credit strength, income stability, and EMI load help us tell the difference.",
    coachChecklist: [
      "Use the closest CIBIL range you know. You do not need an exact score.",
      "Choose the income range that reflects regular take-home or business cash flow.",
      "A stronger profile usually improves quote quality and reduces wasted applications.",
    ],
  },
  {
    title: "Bank context",
    description: "We tailor the recommendation around your current goal and lender response.",
    coachTitle: "Context changes the right next step",
    coachDescription:
      "The same loan can need a different recommendation depending on whether you already spoke to the bank, what they said, and what you care about most.",
    coachChecklist: [
      "If your bank already replied, note what they actually offered or refused.",
      "Be honest about the goal: a lower EMI and a lower total cost can point to different decisions.",
      "This step helps us tell you whether to push your current bank, compare lenders, or wait.",
    ],
  },
] as const;

export const LOAN_AUDIT_FOLLOW_UP_BULLETS = [
  "Pressure-test whether the savings still look good after fees and tenure changes.",
  "Help you frame the right questions for your current bank or the next lender.",
  "Tell you when a refinance does not look worth the effort yet.",
] as const;

export const INITIAL_LOAN_AUDIT_DRAFT: LoanAuditDraft = {
  loanType: "",
  lenderName: "",
  interestRate: "",
  loanAmount: "",
  emi: "",
  tenureRemainingMonths: "",
  cibilRange: "",
  employmentType: "",
  monthlyIncomeRange: "",
  city: "",
  alreadyContactedBank: "",
  contactOutcome: "",
  biggestGoal: "",
};

export const LOAN_TYPE_OPTIONS: Array<{ value: LoanType; label: string }> = [
  { value: "home", label: "Home" },
  { value: "personal", label: "Personal" },
  { value: "car", label: "Car" },
  { value: "bike", label: "Bike" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

export const CIBIL_RANGE_OPTIONS: Array<{ value: CibilRange; label: string }> = [
  { value: "below_650", label: "Below 650" },
  { value: "650_700", label: "650-700" },
  { value: "700_750", label: "700-750" },
  { value: "750_plus", label: "750+" },
];

export const EMPLOYMENT_TYPE_OPTIONS: Array<{
  value: EmploymentType;
  label: string;
}> = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self-employed" },
  { value: "other", label: "Other" },
];

export const MONTHLY_INCOME_OPTIONS: Array<{
  value: MonthlyIncomeRange;
  label: string;
}> = [
  { value: "below_25000", label: "Below Rs 25,000" },
  { value: "25000_50000", label: "Rs 25,000 - Rs 50,000" },
  { value: "50000_100000", label: "Rs 50,000 - Rs 1,00,000" },
  { value: "100000_200000", label: "Rs 1,00,000 - Rs 2,00,000" },
  { value: "200000_plus", label: "Rs 2,00,000+" },
];

export const YES_NO_OPTIONS: Array<{ value: YesNo; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const BIGGEST_GOAL_OPTIONS: Array<{ value: BiggestGoal; label: string }> =
  [
    { value: "reduce_emi", label: "Reduce EMI" },
    { value: "reduce_tenure", label: "Reduce tenure" },
    { value: "reduce_total_interest", label: "Reduce total interest" },
    { value: "switch_lender", label: "Switch lender" },
    { value: "understand_options", label: "Understand options" },
  ];

export const OPPORTUNITY_BAND_OPTIONS: OpportunityBand[] = [
  "High",
  "Medium",
  "Low",
];

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  home: "Home",
  personal: "Personal",
  car: "Car",
  bike: "Bike",
  business: "Business",
  other: "Other",
};

export const CIBIL_RANGE_LABELS: Record<CibilRange, string> = {
  below_650: "Below 650",
  "650_700": "650-700",
  "700_750": "700-750",
  "750_plus": "750+",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  salaried: "Salaried",
  self_employed: "Self-employed",
  other: "Other",
};

export const MONTHLY_INCOME_LABELS: Record<MonthlyIncomeRange, string> = {
  below_25000: "Below Rs 25,000",
  "25000_50000": "Rs 25,000 - Rs 50,000",
  "50000_100000": "Rs 50,000 - Rs 1,00,000",
  "100000_200000": "Rs 1,00,000 - Rs 2,00,000",
  "200000_plus": "Rs 2,00,000+",
};

export const BIGGEST_GOAL_LABELS: Record<BiggestGoal, string> = {
  reduce_emi: "Reduce EMI",
  reduce_tenure: "Reduce tenure",
  reduce_total_interest: "Reduce total interest",
  switch_lender: "Switch lender",
  understand_options: "Understand options",
};
