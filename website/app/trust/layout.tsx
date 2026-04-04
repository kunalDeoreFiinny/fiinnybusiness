import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Trust & Security at Fiinny - ISO Aligned Finance Tracking",
  description: "Fiinny is built on zero-knowledge architecture. Your financial data is encrypted and never sold. Trusted by privacy-conscious users in India.",
  keywords: ["Fiinny security", "privacy-first finance", "zero-knowledge encryption", "trusted Indian startup"],
};

export default function TrustLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
