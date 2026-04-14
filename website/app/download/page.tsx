import type { Metadata } from "next";
import DownloadPageClient from "./DownloadPageClient";

export const metadata: Metadata = {
  title: "Download Fiinny — iOS & Android App | Expense Tracker India",
  description: "Download Fiinny on App Store and Play Store. Auto-track your expenses from SMS, split bills with friends, and file your ITR — free on iOS and Android.",
  openGraph: {
    title: "Download Fiinny — iOS & Android App",
    description: "Get Fiinny free on iOS and Android. India's privacy-first expense tracker with automatic SMS parsing and bill splitting.",
    url: "https://fiinny.com/download",
  },
};

export default function DownloadPage() {
  return <DownloadPageClient />;
}
