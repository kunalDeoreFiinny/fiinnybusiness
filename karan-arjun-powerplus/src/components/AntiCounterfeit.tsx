"use client";

import Image from "next/image";
import { useLang } from "@/lib/LangContext";
import { siteConfig } from "@/lib/config";

export default function AntiCounterfeit() {
  const { lang } = useLang();

  return (
    <aside className="anti-fake-strip" aria-label="Anti-counterfeit warning">
      <div className="container anti-fake-inner">
        <span className="anti-fake-icon" aria-hidden="true">⚠️</span>
        <div className="anti-fake-text">
          <strong>डुब्लिकेट पासून सावधान! &nbsp;|&nbsp; नकली उत्पाद से सावधान!</strong>
          <p>
            {lang === "mr" 
              ? "खरेदी करण्यापूर्वी नेहमी होलोग्राफिक लोगो टॅग आणि QR कोड तपासा. बनावट उत्पादनांची तक्रार करा: "
              : lang === "hi"
              ? "खरीदने से पहले हमेशा होलोग्राफिक लोगो टैग और QR कोड जांचें। नकली उत्पाद की रिपोर्ट करें: "
              : "Always verify the holographic logo tag and QR code before purchasing. Report fakes: "}
            <a href={siteConfig.whatsappUrl}>{siteConfig.phone}</a>
          </p>
        </div>
        <Image
          src="/images/genuine-hologram-qr.jpg"
          alt="Genuine Karan Arjun Power Plus product with hologram QR"
          className="anti-fake-img"
          width={180}
          height={120}
        />
      </div>
    </aside>
  );
}
