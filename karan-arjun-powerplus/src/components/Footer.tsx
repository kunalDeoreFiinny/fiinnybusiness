"use client";

import { useLang } from "@/lib/LangContext";
import { siteConfig } from "@/lib/config";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Footer() {
  const { lang } = useLang();
  const footerRef = useScrollReveal();

  return (
    <footer className="footer" ref={footerRef as React.RefObject<HTMLElement>}>
      <div className="container footer-grid">
        <div className="footer-brand anim-item delay-100">
          <h3>Karan Arjun<br /><span>POWER Plus</span></h3>
          <p>
            {lang === "hi"
              ? "सविता पोपट तनपुरे द्वारा ट्रेडमार्क पंजीकृत कृषि उत्पाद — करण अर्जुन कृषी सेवा केंद्र, करजत, महाराष्ट्र।"
              : lang === "mr"
              ? "सविता पोपट तनपुरे यांचे ट्रेडमार्क नोंदणीकृत कृषी उत्पादन — करण अर्जुन कृषी सेवा केंद्र, कर्जत, महाराष्ट्र."
              : "A trademark-registered agriculture product by Savita Popat Tanpure — Karan Arjun Krushi Seva Kendra, Karjat, Maharashtra."}
          </p>
          <div className="footer-socials">
            <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            <a href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer">Google Map</a>
            <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>

        <div className="footer-contact reveal delay-200">
          <h4>{lang === "hi" ? "संपर्क" : lang === "mr" ? "संपर्क" : "Contact"}</h4>
          <p>📞 <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a></p>
          <p>Karan Arjun Krushi Seva Kendra<br />{siteConfig.city}, {siteConfig.state},<br />Maharashtra — {siteConfig.pincode}</p>
        </div>

        <div className="footer-links reveal delay-300">
          <h4>{lang === "hi" ? "त्वरित लिंक" : lang === "mr" ? "क्विक लिंक्स" : "Quick Links"}</h4>
          <a href="#benefits">{lang === "hi" ? "फायदे" : lang === "mr" ? "फायदे" : "Benefits"}</a>
          <a href="#how-to-use">{lang === "hi" ? "उपयोग" : lang === "mr" ? "वापर कसा करावा" : "How to Use"}</a>
          <a href="#buy">{lang === "hi" ? "ऑर्डर करें" : lang === "mr" ? "ऑर्डर करा" : "Order Online"}</a>
        </div>
      </div>

      <div className="footer-legal">
        <p>
          Mfg. by Unimax Agri Bio-Technologies (I) Pvt. Ltd., Karjat, M.H. · CIN: U24299PN2021PTC200850 ·
          DRC Lic: LCBWD0620250025 · For Agriculture Use Only · Keep out of reach of children.
        </p>
      </div>

      <div className="footer-bottom">
        © 2026 Savita Popat Tanpure. TM: Karan Arjun POWER Plus (LABEL) &nbsp;|&nbsp; All Rights Reserved.
      </div>
    </footer>
  );
}
