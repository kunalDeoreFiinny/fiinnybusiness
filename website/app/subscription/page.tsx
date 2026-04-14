import type { Metadata } from "next";
import { LanguageProvider } from "@/app/i18n/LanguageContext";
import SubscriptionPageClient from "./SubscriptionPageClient";

export const metadata: Metadata = {
  title: "Fiinny Pricing — Free, Premium & Pro Plans | INR",
  description: "Start free forever. Upgrade to Fiinny Premium (₹199/mo) for AI Insights and Pro (₹299/mo) for unlimited forecasts. Pay securely via Razorpay.",
  openGraph: {
    title: "Fiinny Pricing — Free, Premium & Pro",
    description: "Start free. Upgrade to unlock AI-powered financial insights. Secure INR payments via Razorpay.",
    url: "https://fiinny.com/subscription",
  },
};

export default function SubscriptionPage() {
  return <LanguageProvider><SubscriptionPageClient /></LanguageProvider>;
}
