import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Fiinny - The Missions and Team behind India's Private Finance App",
  description: "Learn about Fiinny's mission to build a secure, privacy-first financial operating system in Hyderabad, India. No ads, no data selling, just pure utility.",
  keywords: ["Fiinny mission", "finance app Hyderabad", "private finance tracker", "KaranArjun Technologies"],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
