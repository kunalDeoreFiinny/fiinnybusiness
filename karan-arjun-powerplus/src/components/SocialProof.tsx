"use client";

import Image from "next/image";
import { useLang } from "@/lib/LangContext";
import { siteConfig } from "@/lib/config";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function SocialProof() {
  const { lang, tx } = useLang();
  const socialRef = useScrollReveal();

  return (
    <section
      ref={socialRef as React.RefObject<HTMLElement>}
      className="social-section"
      aria-label="About Savita Tanpure"
    >
      <div className="container social-grid">
        <div className="social-image-wrap anim-item">
          <Image
            src="/images/store-photo.jpg"
            alt="Karan Arjun Krushi Seva Kendra Profile"
            className="social-img"
            width={500}
            height={480}
          />
          <div className="social-img-badge">
            <span>📸 75.8K {lang === "hi" ? "फॉलोअर्स" : lang === "mr" ? "फॉलोअर्स" : "Followers"} @karanarjun_ksk_priyanka_mall</span>
          </div>
        </div>
        <div className="social-text anim-item delay-200">
          <h2 className="section-title" style={{ textAlign: "left" }}>{tx.socialTitle}</h2>
          <p>{tx.socialP1}</p>
          <p style={{ marginTop: "1rem" }}>{tx.socialP2}</p>
          <div className="social-links">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              aria-label="Follow on Instagram"
            >
              📸 Instagram
            </a>
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              aria-label="Find us on Google Maps"
            >
              📍 {lang === "hi" ? "नक्शे पर खोजें" : lang === "mr" ? "गुगल मॅप्सवर शोधा" : "Find on Map"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
