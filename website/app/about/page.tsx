import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";
import { LanguageProvider } from "@/app/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "About Fiinny — Built in Hyderabad, Privacy-First Finance",
  description: "Learn about Fiinny's mission to build India's most private and powerful personal finance app. Meet the founder and understand why we never sell your data.",
  openGraph: {
    title: "About Fiinny — Built in Hyderabad, Privacy-First Finance",
    description: "Fiinny is an institution-grade financial operating system built by engineers in Hyderabad. No ads. No data selling. Just pure utility.",
    url: "https://fiinny.com/about",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}