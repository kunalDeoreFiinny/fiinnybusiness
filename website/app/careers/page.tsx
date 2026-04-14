import type { Metadata } from "next";
import CareersPageClient from "./CareersPageClient";
import { LanguageProvider } from "@/app/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "Careers at Fiinny — Join India's Privacy-First Finance Team",
  description: "Join the Fiinny engineering team in Hyderabad. We are hiring Flutter engineers and UI/UX designers. Remote-friendly internships available.",
  openGraph: {
    title: "Careers at Fiinny — Join India's Privacy-First Finance Team",
    description: "Build world-class fintech with a small, ambitious team in Hyderabad. Fiinny is hiring engineers and designers.",
    url: "https://fiinny.com/careers",
  },
};

export default function CareersPage() {
  return <LanguageProvider><CareersPageClient /></LanguageProvider>;
}
