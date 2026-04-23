"use client";

import { useLang } from "@/lib/LangContext";

export default function HowToUse() {
  const { lang, tx } = useLang();

  return (
    <section id="how-to-use" className="howto-section container" aria-label="How to use">
      <h2 className="section-title text-center anim-item">{tx.howTitle}</h2>
      <div className="howto-grid">
        <div className="howto-card glass anim-item delay-100">
          <div className="howto-icon" aria-hidden="true">🌍</div>
          <h3>{tx.soilApp}</h3>
          <p className="howto-dose">{tx.soilDose}</p>
          <p>{tx.soilDesc}</p>
        </div>
        <div className="howto-card glass anim-item delay-200">
          <div className="howto-icon" aria-hidden="true">🌿</div>
          <h3>{tx.foliarApp}</h3>
          <p className="howto-dose">{tx.foliarDose}</p>
          <p>{tx.foliarDesc}</p>
        </div>
        <div className="howto-card glass safety-card anim-item delay-300">
          <div className="howto-icon" aria-hidden="true">🧤</div>
          <h3>{tx.safety}</h3>
          <ul>
            {(lang === "hi" ? [
              "उपयोग से पहले अच्छी तरह हिलाएं",
              "नाइट्राइल दस्ताने और फुल-स्लीव शर्ट पहनें",
              "सुरक्षा चश्मा अवश्य पहनें",
              "छिड़काव के बाद हाथ धोएं",
              "बच्चों की पहुंच से दूर रखें",
            ] : lang === "mr" ? [
              "वापरण्यापूर्वी चांगली हलवून घ्या",
              "हातमोजे आणि पूर्ण बाह्यांचे शर्ट घाला",
              "सुरक्षा चष्मा नक्की घाला",
              "फवारणीनंतर हात चांगले धुवा",
              "लहान मुलांपासून दूर ठेवा",
            ] : [
              "Shake well before use",
              "Wear nitrile gloves & full-sleeve shirts",
              "Use safety goggles",
              "Wash hands after application",
              "Keep out of reach of children",
            ]).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
