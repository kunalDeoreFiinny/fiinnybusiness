"use client";

import { useLang } from "@/lib/LangContext";
import { BENEFITS } from "@/lib/data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Benefits() {
  const { lang, tx } = useLang();
  const benefitRef = useScrollReveal();

  return (
    <section
      id="benefits"
      ref={benefitRef as React.RefObject<HTMLElement>}
      className="section benefits-section"
      aria-label="Product benefits"
    >
      <div className="container">
        <h2 className="section-title text-center anim-item">{tx.benfTitle}</h2>
        <p className="section-subtitle text-center anim-item delay-100">{tx.benfSub}</p>
        <div className="benefits-grid">
          {BENEFITS.map((b, i) => (
            <article className="benefit-card glass anim-item" key={i} style={{ transitionDelay: `${Math.min(i * 100, 500)}ms` }}>
              <div className="benefit-icon" aria-hidden="true">{b.icon}</div>
              <div>
                <h3 className="benefit-title">{b[lang]}</h3>
                <p className="benefit-desc">{lang === "hi" ? b.desc_hi : lang === "mr" ? b.desc_mr : b.desc_en}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
