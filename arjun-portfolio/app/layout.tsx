import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arjun Tanpure — Founder & Builder",
  description:
    "Arjun Tanpure is a founder building at the intersection of finance, product, and systems. Creator of Fiinny — a personal finance product for a more financially aware life.",
  keywords: [
    "Arjun Tanpure",
    "founder",
    "product builder",
    "Fiinny",
    "personal finance",
    "systems thinking",
    "startup",
  ],
  openGraph: {
    title: "Arjun Tanpure — Founder & Builder",
    description:
      "Founder of Fiinny. Product thinker with a background in systems, consulting, and real-world execution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
