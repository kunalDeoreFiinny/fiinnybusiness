import type { Metadata } from "next";
import HowItWorksClient from "./HowItWorksClient";
import { LanguageProvider } from "@/app/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "How Fiinny Works — Auto Track, Split Bills, File Tax",
  description: "See exactly how Fiinny automatically tracks your expenses from SMS, splits bills with friends, and files your ITR — all in 3 simple steps.",
  openGraph: {
    title: "How Fiinny Works — Auto Track, Split Bills, File Tax",
    description: "3 steps to full financial clarity. Fiinny auto-captures transactions, splits bills instantly, and gives you real-time insights.",
    url: "https://fiinny.com/how-it-works",
  },
};

export default function HowItWorks() {
  return <LanguageProvider><HowItWorksClient /></LanguageProvider>;
}
