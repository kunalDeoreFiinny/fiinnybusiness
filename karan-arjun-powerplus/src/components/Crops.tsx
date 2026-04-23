"use client";

import { useLang } from "@/lib/LangContext";
import { CROPS } from "@/lib/data";

export default function Crops() {
  const { tx, lang } = useLang();

  return (
    <section className="crops-section" aria-label="Suitable crops">
      <div className="container">
        <h2 className="section-title text-center anim-item">{tx.cropsTitle}</h2>
        <p className="section-subtitle text-center anim-item delay-100">{tx.cropsSub}</p>
        <div className="crops-grid">
          {CROPS.map((c, i) => {
            const parts = c.name.split(" / "); // "Grapes / द्राक्ष / अंगूर"
            const name = lang === "en" ? parts[0] : lang === "mr" ? parts[1] : parts[2];
            
            return (
              <div className="crop-chip anim-item" key={name} style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="crop-emoji" aria-hidden="true">{c.emoji}</span>
                <span>{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
