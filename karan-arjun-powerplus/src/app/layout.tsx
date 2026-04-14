import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://karanarjunpowerplus.in"),
  title: {
    default: "Karan Arjun Power Plus™ | करण अर्जुन पावर प्लस | कृषि बायोस्टिमुलेंट",
    template: "%s | Karan Arjun Power Plus™",
  },
  description:
    "Karan Arjun POWER Plus – India's #1 humate & fulvate liquid biostimulant. Boost crop yield, drought resistance, fruit quality & soil health. 22% Humates & Fulvates. PAN India delivery. Sold by Savita Tanpure, Karan Arjun Krushi Seva Kendra, Karjat, Maharashtra. करण अर्जुन पावर प्लस - फसल की पैदावार बढ़ाएं, सूखा प्रतिरोध, कृषि जैव उत्तेजक.",
  keywords: [
    "Karan Arjun Power Plus",
    "करण अर्जुन पावर प्लस",
    "Savita Tanpure",
    "Karan Arjun Krushi Seva Kendra",
    "humate fulvate fertilizer India",
    "liquid biostimulant Maharashtra",
    "agricultural biostimulant buy online",
    "crop yield booster India",
    "soil conditioner PAN India",
    "plant nutrient liquid fertilizer",
    "drought resistant fertilizer",
    "organic fertilizer Maharashtra",
    "कृषि जैव उत्तेजक",
    "फसल उत्पादन बढ़ाने का उपाय",
    "ह्यूमेट फुल्वेट खाद",
    "पावर प्लस खाद",
    "Karjat agri product",
    "Ahmednagar agriculture",
  ],
  authors: [{ name: "Savita Popat Tanpure", url: "https://www.instagram.com/karanarjun_ksk_priyanka_mall/" }],
  creator: "Savita Popat Tanpure",
  publisher: "Karan Arjun Krushi Seva Kendra",
  category: "Agriculture",
  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: ["en_IN", "mr_IN"],
    url: "https://karanarjunpowerplus.in",
    siteName: "Karan Arjun Power Plus",
    title: "Karan Arjun POWER Plus™ – भारत का भरोसेमंद कृषि बायोस्टिमुलेंट",
    description:
      "22% Humates & Fulvates. फसल की गुणवत्ता, वजन, मिठास और उपज बढ़ाएं। PAN India delivery. ₹2,150 से शुरू।",
    images: [
      {
        url: "/images/WhatsApp Image 2026-03-23 at 13.52.56.jpeg",
        width: 1200,
        height: 630,
        alt: "Karan Arjun Power Plus bottle – India's trusted crop biostimulant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karan Arjun POWER Plus™ | करण अर्जुन पावर प्लस",
    description:
      "India's trusted 22% Humates & Fulvates biostimulant. Boost yield, fruit quality & drought resistance. PAN India delivery.",
    images: ["/images/WhatsApp Image 2026-03-23 at 13.52.56.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://karanarjunpowerplus.in",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Karan Arjun POWER Plus",
      description:
        "22% Humates & Fulvates liquid biostimulant for crops. Improves drought resistance, fruit quality, shelf life and soil health. For agricultural use only.",
      brand: { "@type": "Brand", name: "Karan Arjun Power Plus" },
      offers: [
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "2150",
          availability: "https://schema.org/InStock",
          name: "3 Litre",
          seller: { "@type": "Organization", name: "Karan Arjun Krushi Seva Kendra" },
        },
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "3500",
          availability: "https://schema.org/InStock",
          name: "5 Litre",
          seller: { "@type": "Organization", name: "Karan Arjun Krushi Seva Kendra" },
        },
      ],
      image: "/images/WhatsApp Image 2026-03-23 at 13.52.56.jpeg",
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://karanarjunpowerplus.in/#business",
      name: "Karan Arjun Krushi Seva Kendra",
      description: "Agricultural input retailer and proprietor of Karan Arjun POWER Plus biostimulant",
      url: "https://karanarjunpowerplus.in",
      telephone: "+919307199040",
      address: {
        "@type": "PostalAddress",
        streetAddress: "In front of 132 KV, Swami Samarth Nagar, Walvad Road, Karjat",
        addressLocality: "Karjat",
        addressRegion: "Maharashtra",
        postalCode: "414402",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "18.9963",
        longitude: "75.0028",
      },
      sameAs: ["https://www.instagram.com/karanarjun_ksk_priyanka_mall/"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi-IN">
      <head>
        <Script
          id="json-ld-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
