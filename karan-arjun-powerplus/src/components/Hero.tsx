"use client";

import Image from "next/image";
import { useLang } from "@/lib/LangContext";
import { siteConfig } from "@/lib/config";

export default function Hero() {
  const { lang, tx } = useLang();

  return (
    <section className="hero-section" aria-label="Hero section">
      <div className="hero-bg-blob blob-1" aria-hidden="true" />
      <div className="hero-bg-blob blob-2" aria-hidden="true" />
      
      <div className="container hero-grid">
        <div className="hero-text anim-item">
          <div className="hero-badge anim-item delay-100">
            <span className="badge-dot" aria-hidden="true" />
            ISO 9001:2015 {lang === "hi" ? "प्रमाणित" : lang === "mr" ? "प्रमाणित" : "Certified"}
          </div>
          
          <h1 className="hero-h1 anim-item delay-200">
            करण अर्जुन<br />
            <span className="hero-brand">POWER <em>Plus</em></span>
          </h1>
          
          <p className="hero-sub anim-item delay-300">
            <strong>22% Humates &amp; Fulvates (Liquid)</strong> —{" "}
            {lang === "hi"
              ? "भारत का भरोसेमंद बायोस्टिमुलेंट जो फसल की गुणवत्ता, सूखा प्रतिरोध और बाज़ार में दाम बढ़ाता है।"
              : lang === "mr"
              ? "पिकांची गुणवत्ता, उत्पादन आणि नफा वाढवण्यासाठी महाराष्ट्रातील शेतकऱ्यांचा पहिला विश्वास."
              : "India's trusted biostimulant for premium yield quality, drought resilience, and higher market returns."}
          </p>
          
          <div className="hero-marathi anim-item delay-300" role="blockquote">
            <span className="marathi-line">&quot;नातं विश्वासचं, एक पाऊल आधुनिकतेचं ✌️&quot;</span>
            <span className="marathi-hindi">
              {lang === "hi" ? "— 'विश्वास का रिश्ता, आधुनिकता की ओर एक कदम'" : lang === "en" ? "— 'A bond of trust, a step towards modernity'" : ""}
            </span>
            <span className="marathi-attr">— Savita Tanpure, Karan Arjun Krushi Seva Kendra, Karjat</span>
          </div>
          
          <div className="hero-ctas anim-item delay-400">
            <a href="#buy" className="btn btn-primary btn-lg pulse-btn">{tx.orderNow}</a>
            <a href="#benefits" className="btn btn-outline btn-lg">{tx.allBenefits}</a>
          </div>
          
          <div className="hero-stats anim-item delay-400">
            <div className="hero-stat">
              <strong>75.8K+</strong>
              <span>{tx.farmersTag}</span>
            </div>
            <div className="hero-stat-div" aria-hidden="true" />
            <div className="hero-stat">
              <strong>3 {lang === "hi" ? "साल" : lang === "mr" ? "वर्ष" : "Yr"}</strong>
              <span>{lang === "hi" ? "शेल्फ लाइफ" : lang === "mr" ? "शेल्फ लाइफ" : "Shelf Life"}</span>
            </div>
            <div className="hero-stat-div" aria-hidden="true" />
            <div className="hero-stat">
              <strong>ISO</strong>
              <span>9001 {lang === "hi" ? "प्रमाणित" : lang === "mr" ? "प्रमाणित" : "Certified"}</span>
            </div>
          </div>
        </div>

        <div className="hero-product anim-item delay-200">
          <div className="product-glow" aria-hidden="true" />
          <div className="product-card glass">
            <Image
              src="/images/bottle-group.png"
              alt="Karan Arjun Power Plus 1L, 3L, 5L bottles"
              className="product-img"
              width={600}
              height={400}
              priority
            />
          </div>
          <div className="product-price-tag">
            {lang === "hi" ? "शुरू होता है" : lang === "mr" ? "किंमत सुरू" : "Starting at"}{" "}
            <strong>₹{siteConfig.pricing["1L"]}</strong> / 1L
          </div>
        </div>
      </div>
    </section>
  );
}
