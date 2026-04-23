import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://karanarjunpowerplus.in"),
  title: {
    default: "Karan Arjun Power Plus™ | India's Trusted Biostimulant",
    template: "%s | Karan Arjun Power Plus",
  },
  description:
    "Boost crop yield, fruit quality, and drought resistance safely with Karan Arjun Power Plus, India's #1 humate & fulvate liquid fertilizer. PAN India delivery.",
  keywords: [
    "Karan Arjun Power Plus",
    "करण अर्जुन पावर प्लस",
    "Savita Tanpure",
    "Karan Arjun Krushi Seva Kendra",
    "humate fulvate fertilizer India",
    "liquid biostimulant Maharashtra",
    "agricultural biostimulant buy online",
  ],
  authors: [{ name: "Savita Popat Tanpure", url: "https://www.instagram.com/karanarjun_ksk_priyanka_mall/" }],
  creator: "Savita Popat Tanpure",
  publisher: "Karan Arjun Krushi Seva Kendra",
  category: "Agriculture",
  openGraph: {
    type: "website",
    locale: "mr_IN",
    alternateLocale: ["en_IN", "hi_IN"],
    url: "https://karanarjunpowerplus.in",
    siteName: "Karan Arjun Power Plus",
    title: "Karan Arjun POWER Plus – Premium Crop Biostimulant",
    description: "22% Humates & Fulvates. Boost yield, fruit size & soil health. Shop our 1L, 3L & 5L formulas with PAN India delivery.",
    images: [
      {
        url: "/images/bottle-group.png",
        width: 1200,
        height: 630,
        alt: "Karan Arjun Power Plus 1L, 3L, 5L bottles – India's trusted crop biostimulant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karan Arjun POWER Plus",
    description: "India's trusted 22% Humates & Fulvates biostimulant. PAN India delivery.",
    images: ["/images/bottle-group.png"],
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
      sku: "LCBWD0620250025",
      mpn: "CIN-U24299PN2021PTC200850",
      category: "Agricultural Filters & Biostimulants",
      offers: [
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "500",
          availability: "https://schema.org/InStock",
          name: "1 Litre",
          seller: { "@type": "Organization", name: "Karan Arjun Krushi Seva Kendra" },
        },
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "1350",
          availability: "https://schema.org/InStock",
          name: "3 Litre",
          seller: { "@type": "Organization", name: "Karan Arjun Krushi Seva Kendra" },
        },
        {
          "@type": "Offer",
          priceCurrency: "INR",
          price: "2150",
          availability: "https://schema.org/InStock",
          name: "5 Litre",
          seller: { "@type": "Organization", name: "Karan Arjun Krushi Seva Kendra" },
        },
      ],
      image: "https://karanarjunpowerplus.in/images/bottle-group.png",
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
  // We use javascript effect in LangProvider to handle html lang attribute
  return (
    <html lang="mr-IN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Karjat, Maharashtra" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
