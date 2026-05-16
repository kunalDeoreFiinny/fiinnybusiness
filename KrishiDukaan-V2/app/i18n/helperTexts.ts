/**
 * Centralized dictionary for contextual helper texts and the onboarding tour.
 *
 * Keep the keys flat and stable. Each entry must define an `en` string; `mr`
 * and `hi` translations are encouraged but optional — when a translation is
 * missing the helper falls back to the English text.
 */

export type HelperLang = 'en' | 'mr' | 'hi';

export interface HelperTextEntry {
  en: string;
  mr?: string;
  hi?: string;
}

export interface HelperPair {
  title?: HelperTextEntry;
  body: HelperTextEntry;
}

export const HELPER_TEXTS = {
  // --- Navbar ---
  searchBar: {
    title: { en: 'Search tip', mr: 'शोध टीप', hi: 'खोज सुझाव' },
    body: {
      en: 'Search products, crops, fertilizers, or nearby stores. Example: "Urea", "Tomato Seeds", "NPK 19:19:19"',
      mr: 'उत्पादने, पिके, खते किंवा जवळील दुकाने शोधा. उदा.: "युरिया", "टोमॅटो बियाणे", "एनपीके १९:१९:१९"',
      hi: 'उत्पाद, फसलें, उर्वरक या नज़दीकी दुकानें खोजें। उदाहरण: "यूरिया", "टमाटर के बीज", "एनपीके 19:19:19"',
    },
  },
  location: {
    title: { en: 'Why we ask', mr: 'का विचारतो', hi: 'क्यों पूछते हैं' },
    body: {
      en: 'Your location helps us show nearby stores, stock availability, and delivery range.',
      mr: 'तुमचे स्थान आम्हाला जवळील दुकाने, साठा उपलब्धता आणि वितरण श्रेणी दाखवण्यास मदत करते.',
      hi: 'आपका स्थान हमें नज़दीकी दुकानें, स्टॉक उपलब्धता और डिलीवरी रेंज दिखाने में मदद करता है।',
    },
  },

  // --- Home ---
  hero: {
    title: { en: 'Getting started', mr: 'सुरुवात कशी करावी', hi: 'शुरू कैसे करें' },
    body: {
      en: 'Start by exploring nearby products or browse crop categories below.',
      mr: 'जवळील उत्पादने शोधून सुरुवात करा किंवा खालील पिकांच्या श्रेणी पाहा.',
      hi: 'नज़दीकी उत्पादों को देखकर शुरुआत करें या नीचे फसल श्रेणियाँ ब्राउज़ करें।',
    },
  },
  shopByCrop: {
    title: { en: 'Crop hubs', mr: 'पीक हब', hi: 'फसल हब' },
    body: {
      en: 'Crop hubs organize products, fertilizers, and tools specifically for each crop.',
      mr: 'पीक हब प्रत्येक पिकासाठी विशेषतः उत्पादने, खते आणि साधने व्यवस्थित करतात.',
      hi: 'फसल हब हर फसल के लिए विशेष रूप से उत्पाद, उर्वरक और उपकरण व्यवस्थित करते हैं।',
    },
  },

  // --- Market ---
  marketFilter: {
    title: { en: 'Filters', mr: 'फिल्टर', hi: 'फ़िल्टर' },
    body: {
      en: 'Narrow products by category, availability, or nearby stores.',
      mr: 'श्रेणी, उपलब्धता किंवा जवळील दुकानांनुसार उत्पादने कमी करा.',
      hi: 'श्रेणी, उपलब्धता या नज़दीकी दुकानों के आधार पर उत्पाद सीमित करें।',
    },
  },
  marketDistance: {
    title: { en: 'Distance', mr: 'अंतर', hi: 'दूरी' },
    body: {
      en: 'Increase distance to discover more stores and products.',
      mr: 'अधिक दुकाने आणि उत्पादने शोधण्यासाठी अंतर वाढवा.',
      hi: 'अधिक दुकानें और उत्पाद खोजने के लिए दूरी बढ़ाएँ।',
    },
  },
  stockBadge: {
    title: { en: 'Stock', mr: 'साठा', hi: 'स्टॉक' },
    body: {
      en: '"Low Stock" means limited quantity available nearby.',
      mr: '"कमी साठा" म्हणजे जवळ मर्यादित प्रमाणात उपलब्ध आहे.',
      hi: '"लो स्टॉक" का अर्थ है आस-पास सीमित मात्रा उपलब्ध है।',
    },
  },

  // --- Stores ---
  storeSearch: {
    title: { en: 'Search stores', mr: 'दुकाने शोधा', hi: 'दुकानें खोजें' },
    body: {
      en: 'Search by store name, locality, or available products.',
      mr: 'दुकानाचे नाव, परिसर किंवा उपलब्ध उत्पादांनुसार शोधा.',
      hi: 'दुकान के नाम, स्थान या उपलब्ध उत्पादों से खोजें।',
    },
  },
  storeOpenNow: {
    title: { en: 'Open Now', mr: 'सध्या उघडे', hi: 'अभी खुला' },
    body: {
      en: 'Shows stores currently accepting orders or visits.',
      mr: 'सध्या ऑर्डर किंवा भेटी स्वीकारणारी दुकाने दाखवते.',
      hi: 'अभी ऑर्डर या विज़िट स्वीकार करने वाली दुकानें दिखाता है।',
    },
  },
  storeClosest: {
    title: { en: 'Closest', mr: 'सर्वात जवळचे', hi: 'सबसे नज़दीकी' },
    body: {
      en: '"Closest" is based on your currently selected location.',
      mr: '"सर्वात जवळचे" तुमच्या सध्याच्या निवडलेल्या स्थानावर आधारित आहे.',
      hi: '"सबसे नज़दीकी" आपके वर्तमान चयनित स्थान पर आधारित है।',
    },
  },
  storeMap: {
    title: { en: 'Map legend', mr: 'नकाशा सूचक', hi: 'मानचित्र संकेत' },
    body: {
      en: 'Green markers represent nearby agricultural stores. Click a store card to highlight it on the map.',
      mr: 'हिरवे मार्कर जवळील कृषी दुकाने दर्शवतात. नकाशावर हायलाइट करण्यासाठी दुकान कार्डवर क्लिक करा.',
      hi: 'हरे मार्कर पास की कृषि दुकानों को दर्शाते हैं। मानचित्र पर हाइलाइट करने के लिए स्टोर कार्ड पर क्लिक करें।',
    },
  },

  // --- Hub ---
  hubTabs: {
    title: { en: 'Hubs', mr: 'हब', hi: 'हब' },
    body: {
      en: 'Each hub contains curated seeds, fertilizers, and tools for that crop.',
      mr: 'प्रत्येक हबमध्ये त्या पिकासाठी निवडक बियाणे, खते आणि साधने असतात.',
      hi: 'प्रत्येक हब में उस फसल के लिए चुनिंदा बीज, उर्वरक और उपकरण होते हैं।',
    },
  },
  hubFeatured: {
    title: { en: 'Featured Crop', mr: 'वैशिष्ट्यीकृत पीक', hi: 'विशेष फसल' },
    body: {
      en: 'Explore agricultural solutions tailored for this crop.',
      mr: 'या पिकासाठी तयार केलेले कृषी उपाय एक्सप्लोर करा.',
      hi: 'इस फसल के लिए तैयार किए गए कृषि समाधान देखें।',
    },
  },
  hubNutrition: {
    title: { en: 'Nutrition', mr: 'पोषण', hi: 'पोषण' },
    body: {
      en: 'Targeted nutrition products improve crop growth and yield.',
      mr: 'लक्ष्यित पोषण उत्पादने पिकाची वाढ आणि उत्पादन सुधारतात.',
      hi: 'लक्षित पोषण उत्पाद फसल की वृद्धि और उपज को बेहतर बनाते हैं।',
    },
  },
  hubIrrigation: {
    title: { en: 'Irrigation', mr: 'सिंचन', hi: 'सिंचाई' },
    body: {
      en: 'Efficient irrigation tools help reduce water usage and improve consistency.',
      mr: 'कार्यक्षम सिंचन साधने पाण्याचा वापर कमी करण्यास आणि सातत्य सुधारण्यास मदत करतात.',
      hi: 'कुशल सिंचाई उपकरण पानी का उपयोग कम करने और निरंतरता बढ़ाने में मदद करते हैं।',
    },
  },

  // --- Onboarding tour ---
  tourWelcome: {
    title: {
      en: 'Welcome to Krishidukan',
      mr: 'कृषीदुकानमध्ये स्वागत आहे',
      hi: 'कृषीदुकान में आपका स्वागत है',
    },
    body: {
      en: 'Your one-stop platform for nearby agricultural supplies. Let’s show you around — it only takes a moment.',
      mr: 'जवळील कृषी पुरवठ्यासाठी तुमचे एकमेव व्यासपीठ. चला तुम्हाला फेरफटका दाखवू — फक्त एक क्षण लागेल.',
      hi: 'नज़दीकी कृषि आपूर्ति के लिए आपका एकमात्र मंच. चलिए आपको एक झलक दिखाते हैं — बस एक क्षण लगेगा।',
    },
  },
  tourSearch: {
    title: { en: 'Search anything', mr: 'काहीही शोधा', hi: 'कुछ भी खोजें' },
    body: {
      en: 'Find products, crops, fertilizers, or nearby stores — try "Urea" or "Tomato Seeds".',
      mr: 'उत्पादने, पिके, खते किंवा जवळील दुकाने शोधा — "युरिया" किंवा "टोमॅटो बियाणे" वापरून पहा.',
      hi: 'उत्पाद, फसलें, उर्वरक या नज़दीकी दुकानें खोजें — "यूरिया" या "टमाटर के बीज" आज़माएँ।',
    },
  },
  tourLocation: {
    title: { en: 'Your location', mr: 'तुमचे स्थान', hi: 'आपका स्थान' },
    body: {
      en: 'We use your location to show nearby stores, live stock, and delivery range.',
      mr: 'जवळील दुकाने, थेट साठा आणि वितरण श्रेणी दाखवण्यासाठी आम्ही तुमचे स्थान वापरतो.',
      hi: 'हम नज़दीकी दुकानें, लाइव स्टॉक और डिलीवरी रेंज दिखाने के लिए आपके स्थान का उपयोग करते हैं।',
    },
  },
  tourShopByCrop: {
    title: { en: 'Shop by Crop', mr: 'पिकानुसार खरेदी', hi: 'फसल के अनुसार खरीदें' },
    body: {
      en: 'Open a crop hub to see curated seeds, fertilizers, and tools for that crop.',
      mr: 'त्या पिकासाठी निवडक बियाणे, खते आणि साधने पाहण्यासाठी पीक हब उघडा.',
      hi: 'उस फसल के लिए चुनिंदा बीज, उर्वरक और उपकरण देखने के लिए फसल हब खोलें।',
    },
  },
  tourMarket: {
    title: {
      en: 'Marketplace filters',
      mr: 'बाजार फिल्टर',
      hi: 'मार्केटप्लेस फ़िल्टर',
    },
    body: {
      en: 'Browse products from local stores and filter by category, stock, or distance.',
      mr: 'स्थानिक दुकानांमधील उत्पादने ब्राउझ करा आणि श्रेणी, साठा किंवा अंतरानुसार फिल्टर करा.',
      hi: 'स्थानीय दुकानों के उत्पाद ब्राउज़ करें और श्रेणी, स्टॉक या दूरी से फ़िल्टर करें।',
    },
  },
  tourStores: {
    title: { en: 'Nearby stores', mr: 'जवळील दुकाने', hi: 'नज़दीकी दुकानें' },
    body: {
      en: 'View nearby agri stores on a map and get directions in one tap.',
      mr: 'जवळील कृषी दुकाने नकाशावर पाहा आणि एका टॅपमध्ये दिशा मिळवा.',
      hi: 'नज़दीकी कृषि दुकानें मानचित्र पर देखें और एक टैप में दिशा प्राप्त करें।',
    },
  },
  tourHubs: {
    title: { en: 'Crop Hubs', mr: 'पीक हब', hi: 'फसल हब' },
    body: {
      en: 'Targeted recommendations for seeds, nutrition, and irrigation per crop.',
      mr: 'प्रत्येक पिकासाठी बियाणे, पोषण आणि सिंचनासाठी लक्ष्यित शिफारसी.',
      hi: 'प्रत्येक फसल के लिए बीज, पोषण और सिंचाई की लक्षित सिफारिशें।',
    },
  },
} as const;

export type HelperTextKey = keyof typeof HELPER_TEXTS;

/**
 * Format a HelperTextEntry for the given language.
 * - en  → English only
 * - mr  → English + Marathi (two lines)
 * - hi  → English + Hindi (two lines)
 * Falls back to English if the localized variant is missing.
 */
export function formatHelperEntry(
  entry: HelperTextEntry | undefined,
  language: HelperLang
): string {
  if (!entry) return '';
  const en = entry.en;
  if (language === 'en') return en;
  const localized = entry[language];
  if (!localized || localized === en) return en;
  return `${en}\n${localized}`;
}
