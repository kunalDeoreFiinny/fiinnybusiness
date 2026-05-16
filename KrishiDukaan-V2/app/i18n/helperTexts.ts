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

  // --- Market: extended ---
  marketCategories: {
    title: { en: 'Categories', mr: 'श्रेणी', hi: 'श्रेणियाँ' },
    body: {
      en: 'Browse products grouped by Seeds, Fertilizers, Pesticides, or Tools.',
      mr: 'बियाणे, खते, कीटकनाशके किंवा साधने अशा गटांनुसार उत्पादने पाहा.',
      hi: 'बीज, उर्वरक, कीटनाशक या उपकरणों के अनुसार समूहीकृत उत्पाद देखें।',
    },
  },
  marketNearbyStore: {
    title: { en: 'Nearby store', mr: 'जवळील दुकान', hi: 'नज़दीकी दुकान' },
    body: {
      en: 'Sold by this local store, with the distance from your selected location.',
      mr: 'या स्थानिक दुकानात विकले जाते, तुमच्या निवडलेल्या स्थानापासूनचे अंतर.',
      hi: 'इस स्थानीय दुकान द्वारा बेचा जाता है, आपके चयनित स्थान से दूरी सहित।',
    },
  },
  marketPriceInfo: {
    title: { en: 'Price', mr: 'किंमत', hi: 'मूल्य' },
    body: {
      en: 'Latest store price. A struck-through value shows the original price before discount.',
      mr: 'दुकानाची ताजी किंमत. कापलेली किंमत सवलतीपूर्वीची मूळ किंमत दर्शवते.',
      hi: 'दुकान का ताज़ा मूल्य। काटा गया मूल्य छूट से पहले की मूल कीमत दर्शाता है।',
    },
  },
  marketAddToCart: {
    title: { en: 'Quick add', mr: 'त्वरित जोडा', hi: 'त्वरित जोड़ें' },
    body: {
      en: 'Opens the product details to confirm size, stock, and the nearest store before reserving.',
      mr: 'राखीव करण्यापूर्वी आकार, साठा आणि जवळचे दुकान खात्री करण्यासाठी उत्पादन तपशील उघडते.',
      hi: 'आरक्षित करने से पहले आकार, स्टॉक और निकटतम दुकान की पुष्टि के लिए उत्पाद विवरण खोलता है।',
    },
  },
  marketUnits: {
    title: { en: 'Pack size', mr: 'पॅक आकार', hi: 'पैक का आकार' },
    body: {
      en: 'Quantity in one pack — compare sizes before choosing.',
      mr: 'एका पॅकमधील प्रमाण — निवडण्यापूर्वी आकारांची तुलना करा.',
      hi: 'एक पैक में मात्रा — चुनने से पहले आकारों की तुलना करें।',
    },
  },

  // --- Product Detail ---
  productInsights: {
    title: { en: 'Product insights', mr: 'उत्पादन माहिती', hi: 'उत्पाद जानकारी' },
    body: {
      en: 'Key facts about the product — composition, how to apply, and best-fit crops.',
      mr: 'उत्पादनाची प्रमुख माहिती — रचना, वापर पद्धत आणि योग्य पिके.',
      hi: 'उत्पाद के मुख्य तथ्य — संरचना, उपयोग विधि और उपयुक्त फसलें।',
    },
  },
  productComposition: {
    title: { en: 'Composition', mr: 'रचना', hi: 'संरचना' },
    body: {
      en: 'Active nutrient percentages in this product.',
      mr: 'या उत्पादनातील सक्रिय पोषक घटकांची टक्केवारी.',
      hi: 'इस उत्पाद में सक्रिय पोषक तत्वों का प्रतिशत।',
    },
  },
  productDosage: {
    title: { en: 'Recommended dosage', mr: 'शिफारस केलेले प्रमाण', hi: 'अनुशंसित मात्रा' },
    body: {
      en: 'Use this dosage as a starting point. Always follow the label and consult your local agronomist.',
      mr: 'हे प्रमाण सुरुवात म्हणून वापरा. लेबल वाचा आणि स्थानिक कृषितज्ज्ञांचा सल्ला घ्या.',
      hi: 'इस मात्रा को शुरुआती बिंदु मानें। हमेशा लेबल पढ़ें और स्थानीय कृषि विशेषज्ञ से सलाह लें।',
    },
  },
  productApplication: {
    title: { en: 'Application', mr: 'वापर', hi: 'प्रयोग' },
    body: {
      en: 'How and when to apply this product for the best results.',
      mr: 'सर्वोत्तम परिणामांसाठी हे उत्पादन कधी आणि कसे वापरावे.',
      hi: 'सर्वोत्तम परिणामों के लिए इस उत्पाद का उपयोग कब और कैसे करें।',
    },
  },
  productCropSupport: {
    title: { en: 'Best for crops', mr: 'योग्य पिके', hi: 'उपयुक्त फसलें' },
    body: {
      en: 'Crops where this product has shown the most consistent results.',
      mr: 'जिथे या उत्पादनाने सातत्यपूर्ण परिणाम दाखवले आहेत अशी पिके.',
      hi: 'वे फसलें जहाँ इस उत्पाद ने सबसे लगातार परिणाम दिए हैं।',
    },
  },
  productStoreAvailability: {
    title: { en: 'Available stores', mr: 'उपलब्ध दुकाने', hi: 'उपलब्ध दुकानें' },
    body: {
      en: 'Local stores carrying this product. Tap a store to see stock, status, and directions.',
      mr: 'हे उत्पादन ठेवणारी स्थानिक दुकाने. साठा, स्थिती आणि दिशा पाहण्यासाठी दुकानावर टॅप करा.',
      hi: 'इस उत्पाद को रखने वाली स्थानीय दुकानें. स्टॉक, स्थिति और दिशा देखने के लिए दुकान पर टैप करें।',
    },
  },
  productStockStatus: {
    title: { en: 'Stock status', mr: 'साठा स्थिती', hi: 'स्टॉक स्थिति' },
    body: {
      en: '"In Stock" is currently available; "Low Stock" means few units left.',
      mr: '"साठ्यात" सध्या उपलब्ध आहे; "कमी साठा" म्हणजे काही नग शिल्लक.',
      hi: '"स्टॉक में" अभी उपलब्ध है; "कम स्टॉक" का मतलब कुछ इकाइयाँ बची हैं।',
    },
  },
  productDeliveryInfo: {
    title: { en: 'Farm delivery', mr: 'शेतावर पोहोच', hi: 'फार्म डिलीवरी' },
    body: {
      en: 'When available, get supplies delivered directly to your farm.',
      mr: 'जेव्हा उपलब्ध असेल तेव्हा, पुरवठा थेट तुमच्या शेतावर मिळवा.',
      hi: 'जब उपलब्ध हो, आपूर्ति सीधे आपके खेत तक पहुँचाई जाती है।',
    },
  },
  productQualityBadge: {
    title: { en: 'Quality badge', mr: 'गुणवत्ता बॅज', hi: 'गुणवत्ता बैज' },
    body: {
      en: 'Verified quality — Premium / Organic Certified products are checked for authenticity.',
      mr: 'पडताळणी केलेली गुणवत्ता — प्रीमियम / सेंद्रिय प्रमाणित उत्पादनांची सत्यता तपासली जाते.',
      hi: 'सत्यापित गुणवत्ता — प्रीमियम / जैविक प्रमाणित उत्पादों की प्रामाणिकता जाँची जाती है।',
    },
  },
  productReviews: {
    title: { en: 'Reviews', mr: 'पुनरावलोकने', hi: 'समीक्षाएँ' },
    body: {
      en: 'Average rating from verified farmers who bought this product.',
      mr: 'हे उत्पादन घेतलेल्या पडताळणी केलेल्या शेतकऱ्यांची सरासरी रेटिंग.',
      hi: 'इस उत्पाद को खरीदने वाले सत्यापित किसानों की औसत रेटिंग।',
    },
  },
  productContact: {
    title: { en: 'Confirm availability', mr: 'उपलब्धता तपासा', hi: 'उपलब्धता पुष्टि करें' },
    body: {
      en: 'Call the store first to confirm current stock and price before visiting.',
      mr: 'भेट देण्यापूर्वी सध्याचा साठा आणि किंमत खात्री करण्यासाठी आधी दुकानात फोन करा.',
      hi: 'दौरा करने से पहले मौजूदा स्टॉक और कीमत की पुष्टि के लिए पहले दुकान को फ़ोन करें।',
    },
  },

  // --- Store / Map: extended ---
  storeMapInteraction: {
    title: { en: 'Map view', mr: 'नकाशा दृश्य', hi: 'मानचित्र दृश्य' },
    body: {
      en: 'Tap a pin or a store card — the map will recenter and zoom to that store.',
      mr: 'पिन किंवा दुकान कार्डवर टॅप करा — नकाशा त्या दुकानावर केंद्रीत आणि झूम होईल.',
      hi: 'किसी पिन या स्टोर कार्ड पर टैप करें — मानचित्र उस स्टोर पर केंद्रित और ज़ूम होगा।',
    },
  },
  storeDirections: {
    title: { en: 'Get directions', mr: 'दिशा मिळवा', hi: 'दिशा प्राप्त करें' },
    body: {
      en: 'Opens Google Maps with turn-by-turn directions to this store.',
      mr: 'या दुकानापर्यंत वळणवळण दिशांसह Google नकाशे उघडते.',
      hi: 'इस दुकान तक मोड़-दर-मोड़ दिशाओं के साथ Google Maps खोलता है।',
    },
  },
  storeDetails: {
    title: { en: 'Store details', mr: 'दुकान तपशील', hi: 'दुकान विवरण' },
    body: {
      en: 'See address, phone, status, and the products this store currently carries.',
      mr: 'पत्ता, फोन, स्थिती आणि या दुकानात सध्या असलेली उत्पादने पाहा.',
      hi: 'पता, फ़ोन, स्थिति और इस दुकान में मौजूद उत्पाद देखें।',
    },
  },
  storeDistance: {
    title: { en: 'Distance', mr: 'अंतर', hi: 'दूरी' },
    body: {
      en: 'Straight-line distance from your selected location.',
      mr: 'तुमच्या निवडलेल्या स्थानापासूनचे सरळ रेषेतील अंतर.',
      hi: 'आपके चयनित स्थान से सीधी रेखा की दूरी।',
    },
  },
  storeInventory: {
    title: { en: 'In-stock products', mr: 'साठ्यातील उत्पादने', hi: 'स्टॉक में उत्पाद' },
    body: {
      en: 'Popular products this store keeps in stock today.',
      mr: 'या दुकानात आज साठ्यात असलेली लोकप्रिय उत्पादने.',
      hi: 'इस दुकान में आज स्टॉक में मौजूद लोकप्रिय उत्पाद।',
    },
  },
  storeLocateMe: {
    title: { en: 'Use my location', mr: 'माझे स्थान वापरा', hi: 'मेरा स्थान उपयोग करें' },
    body: {
      en: 'Detects your current location so distances and nearby stores update automatically.',
      mr: 'तुमचे सध्याचे स्थान शोधते जेणेकरून अंतर आणि जवळील दुकाने आपोआप अपडेट होतात.',
      hi: 'आपका वर्तमान स्थान पहचानता है ताकि दूरी और नज़दीकी दुकानें स्वतः अपडेट हों।',
    },
  },
  storeCallAction: {
    title: { en: 'Call store', mr: 'दुकानात फोन करा', hi: 'दुकान को कॉल करें' },
    body: {
      en: 'Dial the store directly to confirm stock, pricing, or hold an item.',
      mr: 'साठा, किंमत खात्री करण्यासाठी किंवा वस्तू राखून ठेवण्यासाठी दुकानात थेट फोन करा.',
      hi: 'स्टॉक, मूल्य की पुष्टि या वस्तु रोकने के लिए सीधे दुकान पर कॉल करें।',
    },
  },
  mapZoomControls: {
    title: { en: 'Zoom', mr: 'झूम', hi: 'ज़ूम' },
    body: {
      en: 'Zoom in to inspect a neighborhood or out to see more stores at once.',
      mr: 'परिसर पाहण्यासाठी झूम इन करा किंवा अधिक दुकाने एकाच वेळी पाहण्यासाठी झूम आउट करा.',
      hi: 'किसी क्षेत्र को देखने के लिए ज़ूम इन करें या अधिक दुकानें एक साथ देखने के लिए ज़ूम आउट करें।',
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
