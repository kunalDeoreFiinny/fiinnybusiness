"use client";

import { useLang } from "@/lib/LangContext";

export default function Specs() {
  const { lang } = useLang();

  return (
    <section className="specs-section container" aria-label="Product specifications">
      <h2 className="section-title text-center">
        {lang === "hi" ? "उत्पाद विशिष्टताएं" : lang === "mr" ? "उत्पाद तपशील" : "Product Specifications"}
      </h2>
      <p className="section-subtitle text-center">
        {lang === "mr" 
          ? "प्रयोगशाळा-प्रमाणित फॉर्म्युला. गुणवत्तेशी कोणतीही तडजोड नाही." 
          : lang === "hi" 
          ? "प्रयोगशाला-सत्यापित फॉर्मूला। गुणवत्ता में कोई समझौता नहीं।"
          : "Lab-verified formula. Zero compromise on quality."}
      </p>
      <div className="specs-grid">
        {[
          { label: lang === "hi" ? "सक्रिय तत्व" : lang === "mr" ? "सक्रिय घटक" : "Active Ingredient",    value: "Humates & Fulvates (min.) 22%" },
          { label: "pH", value: "9.0 (Min.)" },
          { label: lang === "hi" ? "विशिष्ट गुरुत्व" : lang === "mr" ? "विशिष्ट घनत्व" : "Specific Gravity", value: "1.05" },
          { label: "CIN No.",                                                 value: "U24299PN2021PTC200850" },
          { label: "DRC LIC No.",                                             value: "LCBWD0620250025" },
          { label: lang === "hi" ? "समाप्ति" : lang === "mr" ? "मुदतपूर्ती" : "Expiry",                    value: lang === "hi" ? "निर्माण से 3 वर्ष" : lang === "mr" ? "उत्पादनापासून 3 वर्षे" : "3 Years from Manufacture" },
        ].map((s, i) => (
          <div className="spec-item glass reveal" key={s.label} style={{ transitionDelay: `${i * 100}ms` }}>
            <span className="spec-label">{s.label}</span>
            <span className="spec-value">{s.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
