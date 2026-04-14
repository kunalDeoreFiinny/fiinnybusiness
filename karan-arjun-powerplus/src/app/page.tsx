"use client";

import { useState, useEffect, useRef } from "react";

// ── Trilingual data ────────────────────────────────────────────────────────
const CROPS = [
  { name: "Grapes / द्राक्ष / अंगूर", emoji: "🍇" },
  { name: "Onion / कांदे / प्याज", emoji: "🧅" },
  { name: "Banana / केळी / केला", emoji: "🍌" },
  { name: "Watermelon / कलिंगड / तरबूज", emoji: "🍉" },
  { name: "Groundnut / भुईमूग / मूंगफली", emoji: "🥜" },
  { name: "Vegetables / भाजीपाला / सब्ज़ियाँ", emoji: "🥦" },
  { name: "Pomegranate / डाळिंब / अनार", emoji: "🍎" },
  { name: "Cotton / कापूस / कपास", emoji: "🌿" },
];

const BENEFITS = [
  {
    icon: "💧",
    en: "Drought Resistance",
    hi: "सूखा प्रतिरोध",
    mr: "पाण्याचा ताण सहन करण्याची क्षमता",
    desc_en: "Significantly increases the plant's ability to withstand water stress and drought — critical for India's erratic monsoons.",
    desc_hi: "पौधों की पानी की कमी और सूखे को सहन करने की क्षमता बढ़ाता है — भारत के अनिश्चित मानसून के लिए अत्यंत उपयोगी।",
    desc_mr: "पाण्याची कमतरता आणि दुष्काळाचा सामना करण्याची वनस्पतीची क्षमता वाढवते — महाराष्ट्राच्या अनियमित पावसासाठी अत्यंत आवश्यक.",
  },
  {
    icon: "✨",
    en: "Premium Fruit Quality",
    hi: "फलों की प्रीमियम गुणवत्ता",
    mr: "फळांचा आकर्षक रंग, चमक व वजन",
    desc_en: "Fruits get better color, shine, and weight. Premium produce sells for higher prices in the market.",
    desc_hi: "फलों को बेहतर रंग, चमक और वजन मिलता है — बाज़ार में ज़्यादा दाम मिलते हैं।",
    desc_mr: "फळांना उत्तम रंग, चमक आणि वजन मिळते — बाजारात जास्त भाव मिळवून देते.",
  },
  {
    icon: "🛡️",
    en: "Disease Resistance",
    hi: "रोग प्रतिरोधक शक्ति",
    mr: "रोगप्रतिकारक क्षमता वाढते",
    desc_en: "Boosts the crop's natural immunity against fungal and bacterial diseases, reducing chemical spray costs.",
    desc_hi: "फसल की रोगों के खिलाफ प्राकृतिक प्रतिरोधक क्षमता बढ़ाता है, रासायनिक स्प्रे का खर्च कम होता है।",
    desc_mr: "रोग आणि बुरशीपासून स्वतःचे संरक्षण करण्याची क्षमता वाढते, फवारणीचा खर्च कमी होतो.",
  },
  {
    icon: "🌱",
    en: "Stronger Roots & Richer Soil",
    hi: "मज़बूत जड़ें और समृद्ध मिट्टी",
    mr: "मुळांची निर्मिती व सेंद्रिय कर्बाचे प्रमाण वाढते",
    desc_en: "Promotes deep root formation, increases soil organic matter, and builds long-term soil health.",
    desc_hi: "गहरी जड़ें बनने में मदद करता है, मिट्टी में कार्बनिक पदार्थ बढ़ाता है।",
    desc_mr: "खोलवर मुळे जाण्यास मदत करते आणि जमिनीत सेंद्रिय कर्बाचे प्रमाण वाढवते.",
  },
  {
    icon: "⏳",
    en: "Longer Shelf Life",
    hi: "लंबी शेल्फ लाइफ",
    mr: "फळे अधिक दिवस टिकतात",
    desc_en: "Produce lasts longer after harvest — reducing post-harvest losses and improving market price realization.",
    desc_hi: "कटाई के बाद उपज अधिक समय तक ताज़ी रहती है — नुकसान कम होते हैं।",
    desc_mr: "काढणीनंतर फळे जास्त काळ ताजी राहतात — नुकसान कमी होते.",
  },
  {
    icon: "🍬",
    en: "Higher Sugar & Sweetness",
    hi: "अधिक मिठास",
    mr: "साखर चांगल्या प्रकारे तयार होऊन गोडी वाढते",
    desc_en: "Helps fruits and vegetables develop higher natural sugar content — tastier, more marketable produce.",
    desc_hi: "फलों और सब्ज़ियों में प्राकृतिक शर्करा बढ़ती है — ज़्यादा स्वादिष्ट और बिकने योग्य उपज।",
    desc_mr: "नैसर्गिक साखरेचे प्रमाण वाढल्याने गोडी वाढते — मालाला जास्त मागणी येते.",
  },
];

// ── Animation hook (client-side only, no hydration mismatch) ─────────────
function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hide immediately after mount (not during SSR)
    const children = el.querySelectorAll<HTMLElement>(".anim-item");
    children.forEach((child) => child.classList.add("anim-hidden"));

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("anim-hidden");
            entry.target.classList.add("anim-show");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    children.forEach((child) => obs.observe(child));
    return () => obs.disconnect();
  }, []);

  return ref;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<"3L" | "5L">("3L");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", state: "" });
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState<"en" | "hi" | "mr">("mr");

  const price = size === "3L" ? 2150 : 3500;
  const total = price * quantity;

  const heroRef    = useScrollReveal();
  const benefitRef = useScrollReveal();
  const socialRef  = useScrollReveal();
  const buyRef     = useScrollReveal();
  const footerRef  = useScrollReveal();

  const toggleLang = () => {
    setLang(l => l === "en" ? "hi" : l === "hi" ? "mr" : "en");
  };

  const t = {
    en: {
      orderNow: "🛒 Order Now",
      allBenefits: "See All Benefits ↓",
      farmersTag: "Farmers Trust Us",
      orderOnline: "Order Power Plus Online",
      orderSub: "PAN India delivery. Directly from Karan Arjun KSK to your farm.",
      deliveryDetails: "Delivery Details",
      nameLbl: "Full Name",
      phoneLbl: "Phone Number",
      stateLbl: "State",
      addressLbl: "Full Delivery Address with Pincode",
      placeOrder: `🛒 Place Order for ₹${total.toLocaleString()}`,
      codNote: "Our team will call you to confirm. COD available.",
      orderSuccess: "Order Received!",
      orderSuccessMsg: "Thank you! We will call you shortly to confirm your order.",
      soilApp: "Soil Application",
      soilDose: "1.25 L / hectare",
      soilDesc: "Mix with water and apply through drip or irrigation. Best at early crop growth stages.",
      foliarApp: "Foliar Spray",
      foliarDose: "1.5 – 2 ml / Litre of water",
      foliarDesc: "Spray evenly on leaves — morning or evening. Repeat every 2–3 weeks.",
      safety: "Safety Precautions",
      benfTitle: "Benefits of Power Plus",
      benfSub: "6 proven ways Power Plus transforms your farm",
      cropsTitle: "Suitable Crops",
      cropsSub: "Works across all major Indian cash crops",
      howTitle: "How to Use",
      socialTitle: "Savita Tanpure & Karan Arjun KSK",
      socialP1: "Savita Tanpure runs Karan Arjun Krushi Seva Kendra, Karjat — a trusted name in Maharashtra's agriculture sector. With over 3,791 posts and 75,800+ followers, farmers across India turn to her for trusted agri-inputs.",
      socialP2: "Karan Arjun Power Plus is her flagship product — born from years of hands-on farming experience.",
    },
    hi: {
      orderNow: "🛒 अभी ऑर्डर करें",
      allBenefits: "सभी फायदे देखें ↓",
      farmersTag: "किसानों का भरोसा",
      orderOnline: "पावर प्लस ऑनलाइन ऑर्डर करें",
      orderSub: "पूरे भारत में डिलीवरी। करण अर्जुन KSK से सीधे आपके खेत तक।",
      deliveryDetails: "डिलीवरी विवरण",
      nameLbl: "पूरा नाम / Full Name",
      phoneLbl: "मोबाइल नंबर / Phone",
      stateLbl: "राज्य / State",
      addressLbl: "पूरा पता और पिनकोड / Full Address & Pincode",
      placeOrder: `🛒 ₹${total.toLocaleString()} में ऑर्डर करें`,
      codNote: "हमारी टीम आपको कॉल करके ऑर्डर कन्फर्म करेगी। COD उपलब्ध है।",
      orderSuccess: "ऑर्डर हो गया! 🎉",
      orderSuccessMsg: "धन्यवाद! हम जल्द ही आपको कॉल करेंगे।",
      soilApp: "मिट्टी प्रयोग / Soil Application",
      soilDose: "1.25 लीटर / हेक्टेयर",
      soilDesc: "पर्याप्त पानी के साथ मिलाएं और ड्रिप या सिंचाई से डालें। फसल की शुरुआती अवस्था में सबसे अच्छा।",
      foliarApp: "पत्ती पर छिड़काव / Foliar Spray",
      foliarDose: "1.5 – 2 मिली / लीटर पानी",
      foliarDesc: "सुबह या शाम पत्तियों पर समान रूप से छिड़काव करें। हर 2–3 सप्ताह में दोहराएं।",
      safety: "सुरक्षा सावधानियां / Safety",
      benfTitle: "पावर प्लस के फायदे",
      benfSub: "आपकी खेती को बदलने वाले 6 सिद्ध तरीके",
      cropsTitle: "उपयुक्त फसलें / Suitable Crops",
      cropsSub: "भारत की सभी प्रमुख नकदी फसलों के लिए उपयुक्त",
      howTitle: "उपयोग कैसे करें / How to Use",
      socialTitle: "सविता तनपुरे और करण अर्जुन KSK",
      socialP1: "सविता तनपुरे, करजत (महाराष्ट्र) में करण अर्जुन कृषी सेवा केंद्र चलाती हैं। 3,791 से ज़्यादा पोस्ट और 75,800+ फॉलोअर्स के साथ, पूरे भारत के किसान उन पर भरोसा करते हैं।",
      socialP2: "करण अर्जुन पावर प्लस उनका प्रमुख उत्पाद है — वर्षों के खेती के अनुभव से जन्मा।",
    },
    mr: {
      orderNow: "🛒 आताच ऑर्डर करा",
      allBenefits: "सर्व फायदे पहा ↓",
      farmersTag: "शेतकऱ्यांचा विश्वास",
      orderOnline: "पॉवर प्लस ऑनलाइन ऑर्डर करा",
      orderSub: "पॅन इंडिया डिलिव्हरी. करण अर्जुन कृषी सेवा केंद्रातून थेट तुमच्या शेतात.",
      deliveryDetails: "वितरण तपशील",
      nameLbl: "पूर्ण नाव",
      phoneLbl: "मोबाइल नंबर",
      stateLbl: "राज्य",
      addressLbl: "पिनकोडसह संपूर्ण पत्ता",
      placeOrder: `🛒 ₹${total.toLocaleString()} ची ऑर्डर द्या`,
      codNote: "आमची टीम ऑर्डर कन्फर्म करण्यासाठी कॉल करेल. COD उपलब्ध.",
      orderSuccess: "ऑर्डर प्राप्त झाली! 🎉",
      orderSuccessMsg: "धन्यवाद! आम्ही तुमच्या ऑर्डरची पुष्टी करण्यासाठी लवकरच कॉल करू.",
      soilApp: "जमिनीत वापर (Soil Application)",
      soilDose: "1.25 L / हेक्टर",
      soilDesc: "पाण्यात मिसळून ठिबक किंवा पाटपाण्यातून द्या. पिकाच्या सुरुवातीच्या वाढीच्या टप्प्यात उत्तम.",
      foliarApp: "फवारणी (Foliar Spray)",
      foliarDose: "1.5 – 2 ml / लिटर पाणी",
      foliarDesc: "सकाळी किंवा संध्याकाळी पानांवर फवारणी करा. दर 2-3 आठवड्यांनी पुनरावृत्ती करा.",
      safety: "सुरक्षा सूचना",
      benfTitle: "पॉवर प्लस चे फायदे",
      benfSub: "तुमची शेती बदलणारे 6 सिद्ध मार्ग",
      cropsTitle: "उपयुक्त पिके",
      cropsSub: "भारतातील सर्व प्रमुख पिकांसाठी उपयुक्त",
      howTitle: "कसा वापरावा (How to Use)",
      socialTitle: "सविता तनपुरे आणि करण अर्जुन KSK",
      socialP1: "सविता तनपुरे ह्या कर्जतमध्ये 'करण अर्जुन कृषी सेवा केंद्र' चालवतात. 3,791+ पोस्ट्स आणि 75,800+ फॉलोअर्ससह, देशभरातील शेतकरी त्यांच्यावर विश्वास ठेवतात.",
      socialP2: "करण अर्जुन पॉवर प्लस हे त्यांचे मुख्य उत्पादन आहे - त्यांच्या शेतीच्या अनुभवातून बनलेले.",
    },
  };

  const tx = t[lang];

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main>
      {/* ── NAVBAR ── */}
      <nav className="navbar glass" aria-label="Main navigation">
        <div className="container nav-inner">
          <a href="#" className="nav-logo" aria-label="Karan Arjun Power Plus home">
            <span className="logo-karan">करण अर्जुन</span>
            <span className="logo-power"> POWER</span>
            <span className="logo-plus"> Plus</span>
            <sup className="logo-tm">™</sup>
          </a>
          <div className="nav-links">
            <a href="#benefits">{lang === "hi" ? "फायदे" : lang === "mr" ? "फायदे" : "Benefits"}</a>
            <a href="#how-to-use">{lang === "hi" ? "उपयोग" : lang === "mr" ? "उपयोग" : "Usage"}</a>
            {/* Language toggle */}
            <button
              className="lang-toggle"
              onClick={toggleLang}
              aria-label="Toggle language"
              title="Change Language"
            >
              {lang === "hi" ? "हिं" : lang === "mr" ? "मरा" : "EN"}
            </button>
            <a href="#buy" className="btn btn-primary nav-cta">
              {tx.orderNow.replace("🛒 ", "")}
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="hero-section"
        aria-label="Hero section"
      >
        <div className="hero-bg-blob blob-1" aria-hidden="true" />
        <div className="hero-bg-blob blob-2" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-text anim-item">
            <div className="hero-badge anim-item delay-100">
              <span className="badge-dot" aria-hidden="true" />
              ISO 9001:2015 Certified · Trademark Registered (TM-A)
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
              <span className="marathi-line">"नातं विश्वासचं, एक पाऊल आधुनिकतेचं ✌️"</span>
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
              <img
                src="/images/WhatsApp Image 2026-03-23 at 13.52.56.jpeg"
                alt="Karan Arjun Power Plus 3L bottle – humate fulvate biostimulant"
                className="product-img"
                width={400}
                height={500}
              />
              <div className="product-tag-float">
                <span>™ {lang === "hi" ? "ट्रेडमार्क रजिस्टर्ड" : lang === "mr" ? "ट्रेडमार्क रजिस्टर्ड" : "Trademark Registered"}</span>
              </div>
            </div>
            <div className="product-price-tag">
              {lang === "hi" ? "शुरू होता है" : lang === "mr" ? "किंमत सुरू" : "Starting at"}{" "}
              <strong>₹2,150</strong> / 3L
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTI-COUNTERFEIT ── */}
      <div className="anti-fake-strip" role="alert" aria-label="Anti-counterfeit warning">
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
              <a href="tel:9637773785">9637773785</a>
            </p>
          </div>
          <img
            src="/images/WhatsApp Image 2026-03-15 at 17.02.35.jpeg"
            alt="Genuine Karan Arjun Power Plus product with hologram QR"
            className="anti-fake-img"
            width={180}
            height={120}
          />
        </div>
      </div>

      {/* ── SPECS ── */}
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

      {/* ── BENEFITS ── */}
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

      {/* ── CROPS ── */}
      <section className="crops-section" aria-label="Suitable crops">
        <div className="container">
          <h2 className="section-title text-center anim-item">{tx.cropsTitle}</h2>
          <p className="section-subtitle text-center anim-item delay-100">{tx.cropsSub}</p>
          <div className="crops-grid">
            {CROPS.map((c, i) => (
              <div className="crop-chip anim-item" key={c.name} style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="crop-emoji" aria-hidden="true">{c.emoji}</span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO USE ── */}
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

      {/* ── SOCIAL PROOF ── */}
      <section
        ref={socialRef as React.RefObject<HTMLElement>}
        className="social-section"
        aria-label="About Savita Tanpure"
      >
        <div className="container social-grid">
          <div className="social-image-wrap anim-item">
            <img
              src="/images/WhatsApp Image 2026-03-23 at 13.52.56.jpeg"
              alt="Karan Arjun Power Plus – flagship product of Savita Tanpure"
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
                href="https://www.instagram.com/karanarjun_ksk_priyanka_mall/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                aria-label="Follow on Instagram"
              >
                📸 Instagram
              </a>
              <a
                href="https://maps.app.goo.gl/STZ57xiVG2esTzrK9"
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

      {/* ── BUY ── */}
      <section
        id="buy"
        ref={buyRef as React.RefObject<HTMLElement>}
        className="buy-section"
        aria-label="Order section"
      >
        <div className="container">
          <h2 className="section-title text-center anim-item">{tx.orderOnline}</h2>
          <p className="section-subtitle text-center anim-item delay-100">{tx.orderSub}</p>

          <div className="buy-grid">
            {/* Pricing Card */}
            <div className="pricing-card glass anim-item delay-200">
              <img
                src="/images/WhatsApp Image 2026-03-23 at 13.52.56.jpeg"
                alt="Karan Arjun Power Plus bottle"
                style={{ width: "120px", margin: "0 auto 1.5rem", borderRadius: "12px" }}
                width={120}
                height={150}
              />
              <h3>Karan Arjun Power Plus™</h3>
              <p style={{ color: "var(--text-600)", marginBottom: "1rem" }}>
                Humates &amp; Fulvates 22% (Liquid)
              </p>

              <div className="size-selector">
                <button
                  className={`size-btn ${size === "3L" ? "active" : ""}`}
                  onClick={() => setSize("3L")}
                  aria-pressed={size === "3L"}
                >
                  3 {lang === "hi" ? "लीटर" : lang === "mr" ? "लिटर" : "Litre"} — ₹2,150/-
                </button>
                <button
                  className={`size-btn ${size === "5L" ? "active" : ""}`}
                  onClick={() => setSize("5L")}
                  aria-pressed={size === "5L"}
                >
                  5 {lang === "hi" ? "लीटर" : lang === "mr" ? "लिटर" : "Litre"} — ₹3,500/-
                </button>
              </div>

              <div className="pricing-details">
                <div className="pricing-row">
                  <span>{lang === "hi" ? "प्रति बोतल" : lang === "mr" ? "प्रति युनिट किंमत" : "Price per unit"}:</span>
                  <span>₹{price.toLocaleString()}</span>
                </div>
                <div className="pricing-row">
                  <span>{lang === "hi" ? "मात्रा" : lang === "mr" ? "प्रमाण" : "Quantity"}:</span>
                  <div className="qty-control">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
                    <span aria-live="polite">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div className="pricing-row total-row">
                  <span>{lang === "hi" ? "कुल" : lang === "mr" ? "एकूण" : "Total"}:</span>
                  <strong>₹{total.toLocaleString()}</strong>
                </div>
              </div>

              <div className="trust-badges">
                <span>✅ {lang === "hi" ? "सभी टैक्स सहित" : lang === "mr" ? "सर्व करांसह" : "Incl. all taxes"}</span>
                <span>🚚 PAN India</span>
                <span>™ {lang === "hi" ? "पंजीकृत ब्रांड" : lang === "mr" ? "नोंदणीकृत ब्रँड" : "Trademarked"}</span>
                <span>💵 COD {lang === "hi" ? "उपलब्ध" : lang === "mr" ? "उपलब्ध" : "Available"}</span>
              </div>
            </div>

            {/* Order Form */}
            <div className="order-form-wrap glass anim-item delay-300">
              {submitted ? (
                <div className="order-success">
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                  <h3>{tx.orderSuccess}</h3>
                  <p>{tx.orderSuccessMsg}</p>
                  <p style={{ color: "var(--text-400)", marginTop: "1rem", fontSize: "0.9rem" }}>
                    {lang === "hi" ? "तत्काल ऑर्डर के लिए:" : lang === "mr" ? "तातडीच्या ऑर्डरसाठी:" : "For urgent orders:"}{" "}
                    <a href="tel:9307199040">93071 99040</a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePurchase} className="order-form" aria-label="Order form">
                  <h3>{tx.deliveryDetails}</h3>

                  <div className="form-field">
                    <label htmlFor="buyer-name">{tx.nameLbl}</label>
                    <input
                      id="buyer-name"
                      required
                      type="text"
                      placeholder={lang === "hi" ? "आपका पूरा नाम" : lang === "mr" ? "तुमचे पूर्ण नाव" : "Your full name"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoComplete="name"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="buyer-phone">{tx.phoneLbl}</label>
                    <input
                      id="buyer-phone"
                      required
                      type="tel"
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="buyer-state">{tx.stateLbl}</label>
                    <select
                      id="buyer-state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    >
                      <option value="">{lang === "hi" ? "राज्य चुनें" : lang === "mr" ? "राज्य निवडा" : "Select State"}</option>
                      {[
                        "Maharashtra", "Andhra Pradesh", "Bihar", "Chhattisgarh",
                        "Gujarat", "Haryana", "Karnataka", "Madhya Pradesh",
                        "Punjab", "Rajasthan", "Telangana", "Uttar Pradesh",
                        "West Bengal", "Other"
                      ].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="buyer-address">{tx.addressLbl}</label>
                    <textarea
                      id="buyer-address"
                      required
                      placeholder={lang === "hi" ? "गाँव/शहर, तालुका, जिला, पिनकोड" : lang === "mr" ? "गाव/शहर, तालुका, जिल्हा, पिनकोड" : "Village / Town, Taluka, District, PIN"}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="order-summary">
                    <span>{quantity}× {size} — {formData.state || "India"}</span>
                    <strong>₹{total.toLocaleString()}</strong>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full pulse-btn">
                    {tx.placeOrder}
                  </button>

                  <p className="form-note">{tx.codNote}</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" ref={footerRef as React.RefObject<HTMLElement>}>
        <div className="container footer-grid">
          <div className="footer-brand anim-item delay-100">
            <h3>Karan Arjun<br /><span>POWER Plus™</span></h3>
            <p>
              {lang === "hi"
                ? "सविता पोपट तनपुरे द्वारा ट्रेडमार्क पंजीकृत कृषि उत्पाद — करण अर्जुन कृषी सेवा केंद्र, करजत, महाराष्ट्र।"
                : lang === "mr"
                ? "सविता पोपट तनपुरे यांचे ट्रेडमार्क नोंदणीकृत कृषी उत्पादन — करण अर्जुन कृषी सेवा केंद्र, कर्जत, महाराष्ट्र."
                : "A trademark-registered agriculture product by Savita Popat Tanpure — Karan Arjun Krushi Seva Kendra, Karjat, Maharashtra."}
            </p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/karanarjun_ksk_priyanka_mall/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://maps.app.goo.gl/STZ57xiVG2esTzrK9" target="_blank" rel="noreferrer">Google Map</a>
              <a href="https://www.youtube.com/@KaranarjunKrushisevakendra6812" target="_blank" rel="noreferrer">YouTube</a>
            </div>
          </div>

          <div className="footer-contact reveal delay-200">
            <h4>{lang === "hi" ? "संपर्क" : lang === "mr" ? "संपर्क" : "Contact"}</h4>
            <p>📞 <a href="tel:9307199040">93071 99040</a></p>
            <p>Karan Arjun Krushi Seva Kendra<br />Karjat, Ahmednagar,<br />Maharashtra — 414402</p>
          </div>

          <div className="footer-links reveal delay-300">
            <h4>{lang === "hi" ? "त्वरित लिंक" : lang === "mr" ? "क्विक लिंक्स" : "Quick Links"}</h4>
            <a href="#benefits">{lang === "hi" ? "फायदे" : lang === "mr" ? "फायदे" : "Benefits"}</a>
            <a href="#how-to-use">{lang === "hi" ? "उपयोग" : lang === "mr" ? "वापर कसा करावा" : "How to Use"}</a>
            <a href="#buy">{lang === "hi" ? "ऑर्डर करें" : lang === "mr" ? "ऑर्डर करा" : "Order Online"}</a>
          </div>
        </div>

        {/* Legal footnote — UNIMAX mentioned only here as legally required */}
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
    </main>
  );
}
