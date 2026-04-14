import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AiProvider } from "@/components/ai/AiContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Fiinny - The Secure, Privacy-First Personal Finance App for India",
  description: "Fiinny is an ISO-aligned, private financial operating system. Auto-track expenses via SMS, split bills, and master your money without your data ever leaving your device. Best expense tracker for Indian users.",
  keywords: ["personal finance app India", "expense tracker India", "bill splitting app India", "privacy-first finance app", "IIT startup India", "automated expense tracking SMS"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Fiinny - The Secure, Privacy-First Personal Finance App",
    description: "Automated expense tracking and bill splitting for India. Your data stays on your device.",
    url: "https://fiinny.com",
    siteName: "Fiinny",
    images: [
      {
        url: "/hero-global.png",
        width: 1200,
        height: 630,
        alt: "Fiinny - Personal Finance App",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiinny - Privacy-First Expense Tracker",
    description: "Master your money with India's most secure personal finance app.",
    images: ["/hero-global.png"],
    creator: "@fiinnyapp",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "your-google-verification-code",
    other: {
      "msvalidate.01": "63528BE2F8B1E121FA552EB1015935CE",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3087779657197986"
          crossOrigin="anonymous"
        />
        <Script id="fiinny-schema" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Fiinny",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Android, iOS, Web",
              "datePublished": "2024-01-01",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "description": "Fiinny is a privacy-first personal finance tracker that helps you auto-track expenses from SMS, split bills, and gain total financial control. Your data is encrypted and processed on-device.",
              "author": {
                "@type": "Organization",
                "name": "Fiinny",
                "location": {
                  "@type": "Place",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Hyderabad",
                    "addressCountry": "IN"
                  }
                }
              }
            }
          `}
        </Script>
        <Script id="fiinny-org-schema" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Fiinny",
              "url": "https://fiinny.com",
              "logo": "https://fiinny.com/icon.png",
              "sameAs": [
                "https://www.instagram.com/fiinnyapp/",
                "https://www.linkedin.com/company/fiinny-inc/",
                "https://twitter.com/fiinnyapp",
                "https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482",
                "https://play.google.com/store/apps/details?id=com.fiinny.app"
              ],
              "description": "Fiinny is the privacy-first financial operating system for minimalist expense tracking and bill splitting."
            }
          `}
        </Script>
        <AuthProvider>
          <ThemeProvider>
            <AiProvider>
              {children}
            </AiProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
