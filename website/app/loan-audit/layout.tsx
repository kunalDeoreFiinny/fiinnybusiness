import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fiinny Loan Audit - Check if you are overpaying on your loan",
  description:
    "Run a free Fiinny Loan Audit to estimate whether renegotiation or refinancing could reduce your EMI or total interest burden.",
  keywords: [
    "loan audit India",
    "refinance calculator India",
    "loan savings estimate",
    "renegotiate loan rate",
    "Fiinny loan audit",
  ],
};

export default function LoanAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
