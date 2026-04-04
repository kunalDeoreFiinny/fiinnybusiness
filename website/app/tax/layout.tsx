import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Tax Autopilot - Free Income Tax Planning at Fiinny",
  description: "Fiinny's Tax Autopilot securely fetches your income and tax data to automatically calculate your optimal regime. Best free tax planning tool for Indians.",
  keywords: ["tax autopilot India", "free tax planning tool", "ITR JSON generator", "automated income tax India"],
};

export default function TaxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
