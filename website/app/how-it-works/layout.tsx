import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "How Fiinny Works - Automated Expense Tracking & Bill Splitting",
  description: "Discover how Fiinny automates your personal finances using smart SMS tracking and instant bill splitting. Purely automated, zero manual effort.",
  keywords: ["how Fiinny works", "automated expense tracker India", "bill splitting features", "SMS tracking finance"],
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
