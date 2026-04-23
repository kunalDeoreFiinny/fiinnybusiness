import type { Metadata } from "next";
import BusinessPageClient from "./BusinessPageClient";

export const metadata: Metadata = {
  title: "Fiinny Business — Retail Distribution & SaaS Platform",
  description: "Fiinny Business powers India's distribution economy. Manage retail orders, catalogs, and payments at scale. Featuring Karan Arjun Power Plus — India's leading power solutions portal.",
  openGraph: {
    title: "Fiinny Business — Retail Distribution & SaaS Platform",
    description: "Powering India's distribution economy with smart catalog management, retailer self-ordering, and Razorpay-integrated payments.",
    url: "https://fiinny.com/business",
  },
};

export default function BusinessPage() {
  return <BusinessPageClient />;
}
