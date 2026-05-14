export type Language = 'en' | 'mr' | 'kn' | 'gu' | 'hi';

export interface Translations {
  // Navbar
  nav_product: string;
  nav_benefits: string;
  nav_shop: string;
  nav_blog: string;
  nav_about: string;
  nav_login: string;
  nav_logout: string;
  nav_admin: string;
  nav_profile: string;
  nav_admin_dashboard: string;

  // Hero
  hero_tagline: string;
  hero_heading_line1: string;
  hero_heading_line2: string;
  hero_shop_now: string;
  hero_trusted_by: string;

  // Videos
  videos_title: string;
  videos_desc: string;

  // Benefits
  benefits_title_line1: string;
  benefits_title_line2: string;
  benefits_subtitle: string;
  drought_title: string;
  drought_desc: string;
  quality_title: string;
  quality_desc: string;
  disease_title: string;
  disease_desc: string;
  root_title: string;
  root_desc: string;
  freshness_title: string;
  freshness_desc: string;
  cta_badge: string;
  cta_title: string;
  cta_desc: string;
  cta_button: string;

  // Support
  support_badge: string;
  support_title: string;
  support_subtitle: string;
  subject_label: string;
  subject_placeholder: string;
  description_label: string;
  description_placeholder: string;
  submit_ticket: string;
  submitting: string;
  track_prefix: string;
  track_link_text: string;
  track_suffix: string;
  admin_signed_in: string;
  admin_panel: string;
  sign_in_title: string;
  sign_in_desc: string;
  sign_in_button: string;

  // Language switcher
  lang_label: string;

  // Footer
  footer_hq_title: string;
  footer_hq_address: string;
  footer_sales_title: string;
  footer_sales_desc: string;
  footer_community_title: string;
  footer_community_desc: string;
  footer_privacy: string;
  footer_terms: string;
  footer_contact: string;
  footer_shipping: string;
  footer_copyright: string;
}

const en: Translations = {
  nav_product: 'Product',
  nav_benefits: 'Benefits',
  nav_shop: 'Shop',
  nav_blog: 'Blog',
  nav_about: 'About',
  nav_login: 'Login',
  nav_logout: 'Logout',
  nav_admin: 'Admin',
  nav_profile: 'Profile',
  nav_admin_dashboard: 'Admin Dashboard',

  hero_tagline: '"Trust with tradition, one step toward modernity"',
  hero_heading_line1: 'Trust with tradition,',
  hero_heading_line2: 'one step toward modernity.',
  hero_shop_now: 'Shop Now',
  hero_trusted_by: 'Trusted by 75,800+ Farmers',

  videos_title: 'Power Plus Videos',
  videos_desc: 'Watch real short videos and field updates from Power Plus.',

  benefits_title_line1: 'Scientific Precision,',
  benefits_title_line2: 'Natural Growth',
  benefits_subtitle: 'Our formulation addresses the most critical challenges in modern farming.',
  drought_title: 'Drought Tolerance',
  drought_desc: 'Advanced water-retention technology helps crops survive and thrive during extended dry periods and water stress.',
  quality_title: 'Premium Quality',
  quality_desc: 'Improves fruit color, shine, and weight for premium market pricing.',
  disease_title: 'Disease Resistance',
  disease_desc: 'Enhanced immunity against common diseases and fungal infections.',
  root_title: 'Root Development',
  root_desc: 'Stimulates deep root growth and increases soil organic carbon.',
  freshness_title: 'Extended Freshness',
  freshness_desc: 'Increases post-harvest fruit freshness and overall shelf life.',
  cta_badge: 'Natural Sugar Content',
  cta_title: 'Ready to Transform Your Yield?',
  cta_desc: 'Join 75,800+ successful farmers who have upgraded to Power Plus™ and seen massive improvements in sweetness and quality.',
  cta_button: 'Get a Free Consultation',

  support_badge: 'Support',
  support_title: 'Need Help? Raise a Ticket',
  support_subtitle: 'Our team responds to every query. You can also track replies in your profile.',
  subject_label: 'Subject',
  subject_placeholder: 'E.g., Order delay, Product damage...',
  description_label: 'Description',
  description_placeholder: 'Describe your issue in detail...',
  submit_ticket: 'Submit Ticket',
  submitting: 'Submitting...',
  track_prefix: 'Track your tickets and admin replies in',
  track_link_text: 'your profile',
  track_suffix: '.',
  admin_signed_in: 'You are signed in as admin. Manage tickets from the',
  admin_panel: 'Admin panel',
  sign_in_title: 'Sign in to raise a support ticket',
  sign_in_desc: 'Your ticket will be tracked and our team will reply directly.',
  sign_in_button: 'Sign In to Continue',

  lang_label: 'Language',

  footer_hq_title: 'Headquarters',
  footer_hq_address: 'Karan Arjun Krushi Seva Kendra\nKarjat, Maharashtra 414402\nIndia',
  footer_sales_title: 'Sales & Support',
  footer_sales_desc: 'WhatsApp Us for Support:',
  footer_community_title: 'Join Our Community',
  footer_community_desc: 'Follow our daily updates',
  footer_privacy: 'Privacy Policy',
  footer_terms: 'Terms of Service',
  footer_contact: 'Contact Support',
  footer_shipping: 'Shipping Info',
  footer_copyright: 'All rights reserved. Precision Agriculture for a Sustainable Future.',
};

const mr: Translations = {
  nav_product: 'उत्पादन',
  nav_benefits: 'फायदे',
  nav_shop: 'खरेदी',
  nav_blog: 'ब्लॉग',
  nav_about: 'आमच्याबद्दल',
  nav_login: 'लॉगिन',
  nav_logout: 'लॉगआउट',
  nav_admin: 'प्रशासक',
  nav_profile: 'प्रोफाइल',
  nav_admin_dashboard: 'प्रशासक डॅशबोर्ड',

  hero_tagline: '"नातं विश्वासचं, एक पाऊल आधुनिकतेचं"',
  hero_heading_line1: 'विश्वास परंपरेसह,',
  hero_heading_line2: 'आधुनिकतेकडे एक पाऊल.',
  hero_shop_now: 'आता खरेदी करा',
  hero_trusted_by: '७५,८०० पेक्षा जास्त शेतकऱ्यांचा विश्वास',

  videos_title: 'पॉवर प्लस व्हिडिओ',
  videos_desc: 'पॉवर प्लसचे खरे व्हिडिओ आणि फील्ड अपडेट पाहा.',

  benefits_title_line1: 'वैज्ञानिक अचूकता,',
  benefits_title_line2: 'नैसर्गिक वाढ',
  benefits_subtitle: 'आमची रचना आधुनिक शेतीतील सर्वात महत्त्वाच्या आव्हानांना सामोरे जाते.',
  drought_title: 'दुष्काळ सहनशीलता',
  drought_desc: 'प्रगत जलधारण तंत्रज्ञान पिकांना दीर्घकाळ कोरड्या काळातही जगण्यास आणि वाढण्यास मदत करते.',
  quality_title: 'उच्च दर्जा',
  quality_desc: 'प्रीमियम बाजारभावासाठी फळांचा रंग, चमक आणि वजन सुधारतो.',
  disease_title: 'रोग प्रतिकारशक्ती',
  disease_desc: 'सामान्य रोग आणि बुरशीजन्य संसर्गाविरुद्ध वाढीव प्रतिकारशक्ती.',
  root_title: 'मुळांचा विकास',
  root_desc: 'खोल मुळांच्या वाढीस प्रोत्साहन देते आणि मातीतील सेंद्रिय कार्बन वाढवतो.',
  freshness_title: 'दीर्घकाळ ताजेपणा',
  freshness_desc: 'काढणीनंतर फळांची ताजेपणा आणि शेल्फ लाइफ वाढवते.',
  cta_badge: 'नैसर्गिक साखर सामग्री',
  cta_title: 'तुमचे उत्पादन वाढवण्यास तयार आहात?',
  cta_desc: '७५,८०० पेक्षा जास्त यशस्वी शेतकऱ्यांच्या गटात सामील व्हा जे पॉवर प्लस™ वापरून मिठास व दर्जात मोठी सुधारणा अनुभवत आहेत.',
  cta_button: 'मोफत सल्ला घ्या',

  support_badge: 'समर्थन',
  support_title: 'मदत हवी आहे? तिकीट काढा',
  support_subtitle: 'आमची टीम प्रत्येक प्रश्नाला उत्तर देते. तुम्ही तुमच्या प्रोफाइलमध्ये उत्तरे ट्रॅक करू शकता.',
  subject_label: 'विषय',
  subject_placeholder: 'उदा., ऑर्डर उशीर, उत्पादन नुकसान...',
  description_label: 'वर्णन',
  description_placeholder: 'तुमची समस्या तपशीलवार सांगा...',
  submit_ticket: 'तिकीट पाठवा',
  submitting: 'पाठवत आहे...',
  track_prefix: 'तुमची तिकिटे आणि उत्तरे',
  track_link_text: 'तुमच्या प्रोफाइलमध्ये',
  track_suffix: 'पाहा.',
  admin_signed_in: 'तुम्ही प्रशासक म्हणून साइन इन केले आहात. तिकिटे व्यवस्थापित करा',
  admin_panel: 'प्रशासक पॅनेलमधून',
  sign_in_title: 'समर्थन तिकीट काढण्यासाठी साइन इन करा',
  sign_in_desc: 'तुमचे तिकीट ट्रॅक केले जाईल आणि आमची टीम थेट उत्तर देईल.',
  sign_in_button: 'पुढे जाण्यासाठी साइन इन करा',

  lang_label: 'भाषा',

  footer_hq_title: 'मुख्यालय',
  footer_hq_address: 'करण अर्जुन कृषी सेवा केंद्र\nकर्जत, महाराष्ट्र ४१४४०२\nभारत',
  footer_sales_title: 'विक्री आणि समर्थन',
  footer_sales_desc: 'व्हॉट्सअॅपवर संपर्क करा:',
  footer_community_title: 'आमच्या समुदायात सामील व्हा',
  footer_community_desc: 'आमचे दैनंदिन अपडेट फॉलो करा',
  footer_privacy: 'गोपनीयता धोरण',
  footer_terms: 'सेवा अटी',
  footer_contact: 'समर्थनाशी संपर्क करा',
  footer_shipping: 'शिपिंग माहिती',
  footer_copyright: 'सर्व हक्क राखीव. शाश्वत भविष्यासाठी अचूक शेती.',
};

const kn: Translations = {
  nav_product: 'ಉತ್ಪನ್ನ',
  nav_benefits: 'ಪ್ರಯೋಜನಗಳು',
  nav_shop: 'ಅಂಗಡಿ',
  nav_blog: 'ಬ್ಲಾಗ್',
  nav_about: 'ನಮ್ಮ ಬಗ್ಗೆ',
  nav_login: 'ಲಾಗಿನ್',
  nav_logout: 'ಲಾಗ್ ಔಟ್',
  nav_admin: 'ನಿರ್ವಾಹಕ',
  nav_profile: 'ಪ್ರೊಫೈಲ್',
  nav_admin_dashboard: 'ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',

  hero_tagline: '"ನಂಬಿಕೆ ಮತ್ತು ಸಂಪ್ರದಾಯ, ಆಧುನಿಕತೆಯ ಕಡೆ ಒಂದು ಹೆಜ್ಜೆ"',
  hero_heading_line1: 'ನಂಬಿಕೆ ಮತ್ತು ಸಂಪ್ರದಾಯ,',
  hero_heading_line2: 'ಆಧುನಿಕತೆಯ ಕಡೆ ಒಂದು ಹೆಜ್ಜೆ.',
  hero_shop_now: 'ಈಗ ಖರೀದಿಸಿ',
  hero_trusted_by: '೭೫,೮೦೦+ ರೈತರ ವಿಶ್ವಾಸ',

  videos_title: 'ಪವರ್ ಪ್ಲಸ್ ವಿಡಿಯೋಗಳು',
  videos_desc: 'ಪವರ್ ಪ್ಲಸ್‌ನಿಂದ ನೈಜ ಸಣ್ಣ ವಿಡಿಯೋಗಳು ಮತ್ತು ಕ್ಷೇತ್ರ ನವೀಕರಣಗಳನ್ನು ವೀಕ್ಷಿಸಿ.',

  benefits_title_line1: 'ವೈಜ್ಞಾನಿಕ ನಿಖರತೆ,',
  benefits_title_line2: 'ನೈಸರ್ಗಿಕ ಬೆಳವಣಿಗೆ',
  benefits_subtitle: 'ನಮ್ಮ ಸೂತ್ರೀಕರಣವು ಆಧುನಿಕ ಕೃಷಿಯ ನಿರ್ಣಾಯಕ ಸವಾಲುಗಳನ್ನು ಪರಿಹರಿಸುತ್ತದೆ.',
  drought_title: 'ಬರ ಸಹಿಷ್ಣುತೆ',
  drought_desc: 'ಮುಂದುವರಿದ ಜಲ ಧಾರಣ ತಂತ್ರಜ್ಞಾನವು ಬೆಳೆಗಳಿಗೆ ದೀರ್ಘ ಬರಗಾಲದಲ್ಲೂ ಬದುಕಲು ಮತ್ತು ಬೆಳೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
  quality_title: 'ಉನ್ನತ ಗುಣಮಟ್ಟ',
  quality_desc: 'ಪ್ರೀಮಿಯಂ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗೆ ಹಣ್ಣಿನ ಬಣ್ಣ, ಹೊಳಪು ಮತ್ತು ತೂಕ ಸುಧಾರಿಸುತ್ತದೆ.',
  disease_title: 'ರೋಗ ನಿರೋಧಕತೆ',
  disease_desc: 'ಸಾಮಾನ್ಯ ರೋಗಗಳು ಮತ್ತು ಶಿಲೀಂಧ್ರ ಸೋಂಕುಗಳ ವಿರುದ್ಧ ವರ್ಧಿತ ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ.',
  root_title: 'ಬೇರು ಬೆಳವಣಿಗೆ',
  root_desc: 'ಆಳವಾದ ಬೇರಿನ ಬೆಳವಣಿಗೆಯನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ ಮತ್ತು ಮಣ್ಣಿನ ಸಾವಯವ ಇಂಗಾಲವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.',
  freshness_title: 'ದೀರ್ಘ ತಾಜಾತನ',
  freshness_desc: 'ಸುಗ್ಗಿಯ ನಂತರ ಹಣ್ಣಿನ ತಾಜಾತನ ಮತ್ತು ಶೆಲ್ಫ್ ಲೈಫ್ ಹೆಚ್ಚಿಸುತ್ತದೆ.',
  cta_badge: 'ನೈಸರ್ಗಿಕ ಸಕ್ಕರೆ ಅಂಶ',
  cta_title: 'ನಿಮ್ಮ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
  cta_desc: '೭೫,೮೦೦+ ಯಶಸ್ವಿ ರೈತರ ಜೊತೆ ಸೇರಿ ಪವರ್ ಪ್ಲಸ್™ ಅಳವಡಿಸಿಕೊಂಡು ಮಿಠಾಣ್ ಮತ್ತು ಗುಣಮಟ್ಟದಲ್ಲಿ ಅಪಾರ ಸುಧಾರಣೆ ಕಂಡಿದ್ದಾರೆ.',
  cta_button: 'ಉಚಿತ ಸಮಾಲೋಚನೆ ಪಡೆಯಿರಿ',

  support_badge: 'ಬೆಂಬಲ',
  support_title: 'ಸಹಾಯ ಬೇಕೇ? ಟಿಕೆಟ್ ಹಾಕಿ',
  support_subtitle: 'ನಮ್ಮ ತಂಡವು ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುತ್ತದೆ. ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಉತ್ತರಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು.',
  subject_label: 'ವಿಷಯ',
  subject_placeholder: 'ಉದಾ., ಆರ್ಡರ್ ವಿಳಂಬ, ಉತ್ಪನ್ನ ಹಾನಿ...',
  description_label: 'ವಿವರಣೆ',
  description_placeholder: 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ತಿಳಿಸಿ...',
  submit_ticket: 'ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ',
  submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
  track_prefix: 'ನಿಮ್ಮ ಟಿಕೆಟ್‌ಗಳನ್ನು',
  track_link_text: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ',
  track_suffix: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
  admin_signed_in: 'ನೀವು ನಿರ್ವಾಹಕರಾಗಿ ಸೈನ್ ಇನ್ ಆಗಿದ್ದೀರಿ. ಟಿಕೆಟ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
  admin_panel: 'ನಿರ್ವಾಹಕ ಪ್ಯಾನೆಲ್‌ನಿಂದ',
  sign_in_title: 'ಟಿಕೆಟ್ ಹಾಕಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
  sign_in_desc: 'ನಿಮ್ಮ ಟಿಕೆಟ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ ಮತ್ತು ನಮ್ಮ ತಂಡವು ನೇರವಾಗಿ ಉತ್ತರಿಸುತ್ತದೆ.',
  sign_in_button: 'ಮುಂದೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',

  lang_label: 'ಭಾಷೆ',

  footer_hq_title: 'ಪ್ರಧಾನ ಕಚೇರಿ',
  footer_hq_address: 'ಕರಣ್ ಅರ್ಜುನ್ ಕೃಷಿ ಸೇವಾ ಕೇಂದ್ರ\nಕರ್ಜತ್, ಮಹಾರಾಷ್ಟ್ರ 414402\nಭಾರತ',
  footer_sales_title: 'ಮಾರಾಟ ಮತ್ತು ಬೆಂಬಲ',
  footer_sales_desc: 'ಬೆಂಬಲಕ್ಕಾಗಿ ವಾಟ್ಸಾಪ್ ಮಾಡಿ:',
  footer_community_title: 'ನಮ್ಮ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ',
  footer_community_desc: 'ನಮ್ಮ ದೈನಂದಿನ ನವೀಕರಣಗಳನ್ನು ಅನುಸರಿಸಿ',
  footer_privacy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
  footer_terms: 'ಸೇವಾ ನಿಯಮಗಳು',
  footer_contact: 'ಬೆಂಬಲ ಸಂಪರ್ಕಿಸಿ',
  footer_shipping: 'ಶಿಪ್ಪಿಂಗ್ ಮಾಹಿತಿ',
  footer_copyright: 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ. ಸುಸ್ಥಿರ ಭವಿಷ್ಯಕ್ಕಾಗಿ ನಿಖರ ಕೃಷಿ.',
};

const gu: Translations = {
  nav_product: 'ઉત્પાદ',
  nav_benefits: 'ફાયદા',
  nav_shop: 'ખરીદી',
  nav_blog: 'બ્લૉગ',
  nav_about: 'અમારા વિશે',
  nav_login: 'લૉગઇન',
  nav_logout: 'લૉગ આઉટ',
  nav_admin: 'એડ્મિન',
  nav_profile: 'પ્રોફાઇલ',
  nav_admin_dashboard: 'એડ્મિન ડૅશબોર્ડ',

  hero_tagline: '"વિશ્વાસ અને પરંપરા, આધુનિકતા તરફ એક પગલું"',
  hero_heading_line1: 'વિશ્વાસ અને પરંપરા,',
  hero_heading_line2: 'આધુનિકતા તરફ એક પગલું.',
  hero_shop_now: 'હમણાં ખરીદો',
  hero_trusted_by: '૭૫,૮૦૦+ ખેડૂતોનો વિશ્વાસ',

  videos_title: 'પાવર પ્લસ વિડિઓ',
  videos_desc: 'પાવર પ્લસના સાચા ટૂંકા વિડિઓ અને ક્ષેત્ર અપડેટ જુઓ.',

  benefits_title_line1: 'વૈજ્ઞાનિક ચોકસાઈ,',
  benefits_title_line2: 'કુદરતી વૃદ્ધિ',
  benefits_subtitle: 'અમારી ફોર્મ્યુલેશન આધુનિક ખેતીના સૌથી મહત્ત્વના પડકારોને સામોનો કરે છે.',
  drought_title: 'દુષ્કાળ સહનશીલતા',
  drought_desc: 'અદ્યતન જળ-ધારણ ટેક્નોલૉજી પાકને લાંબા સૂકા સમયગાળા દરમ્યાન ટકી રહેવા અને ઉગવામાં મદદ કરે છે.',
  quality_title: 'ઉચ્ચ ગુણવત્તા',
  quality_desc: 'પ્રીમિયમ બજાર ભાવ માટે ફળનો રંગ, ચળકાટ અને વજન સુધારે છે.',
  disease_title: 'રોગ પ્રતિકાર',
  disease_desc: 'સામાન્ય રોગો અને ફૂગ ચેપ સામે વધારેલ રોગ પ્રતિકારક ક્ષમતા.',
  root_title: 'મૂળ વિકાસ',
  root_desc: 'ઊંડા મૂળ વૃદ્ધિ ઉત્તેજિત કરે છે અને જમીનમાં કાર્બનિક કાર્બન વધારે છે.',
  freshness_title: 'વધારેલ તાજગી',
  freshness_desc: 'લણણી પછી ફળની તાજગી અને શેલ્ફ-લાઈફ વધારે છે.',
  cta_badge: 'કુદરતી ખાંડ સામગ્રી',
  cta_title: 'તમારી ઉપજ વધારવા તૈયાર છો?',
  cta_desc: '૭૫,૮૦૦+ સફળ ખેડૂતોમાં જોડાઓ જેઓ પાવર પ્લસ™ અપગ્રેડ કરી ગ્રેટ ગુણવત્તા અને મીઠાસ અનુભવ્યા છે.',
  cta_button: 'મફત સલાહ મેળવો',

  support_badge: 'સહાય',
  support_title: 'સહાય જોઈએ? ટિકિટ ઉઠાવો',
  support_subtitle: 'અમારી ટીમ દરેક પ્રશ્નનો જવાબ આપે છે. તમે તમારી પ્રોફાઇલમાં જવાબ ટ્રૅક કરી શકો છો.',
  subject_label: 'વિષય',
  subject_placeholder: 'ઉ.દ., ઑર્ડર વિલંબ, ઉત્પાદ નુકસાન...',
  description_label: 'વર્ણન',
  description_placeholder: 'તમારી સમસ્યા વિગતવાર જણાવો...',
  submit_ticket: 'ટિકિટ મોકલો',
  submitting: 'મોકલી રહ્યા છીએ...',
  track_prefix: 'ટિકિટ અને જવાબો',
  track_link_text: 'તમારી પ્રોફાઇલ',
  track_suffix: 'માં ટ્રૅક કરો.',
  admin_signed_in: 'તમે એડ્મિન તરીકે સાઇન ઇન કર્યા છો. ટિકિટ સંચાલિત કરો',
  admin_panel: 'એડ્મિન પૅનલ',
  sign_in_title: 'સહાય ટિકિટ ઉઠાવવા સાઇન ઇન કરો',
  sign_in_desc: 'તમારી ટિકિટ ટ્રૅક થશે અને અમારી ટીમ સીધો જવાબ આપશે.',
  sign_in_button: 'આગળ વધવા સાઇન ઇન કરો',

  lang_label: 'ભાષા',

  footer_hq_title: 'મુખ્ય કાર્યાલય',
  footer_hq_address: 'કરણ અર્જુન કૃષિ સેવા કેન્દ્ર\nકર્જત, મહારાષ્ટ્ર 414402\nભારત',
  footer_sales_title: 'વેચાણ અને સહાય',
  footer_sales_desc: 'સહાય માટે વ્હૉટ્સઍપ કરો:',
  footer_community_title: 'અમારા સમુદાયમાં જોડાઓ',
  footer_community_desc: 'અમારા દૈનિક અપડેટ ફૉલો કરો',
  footer_privacy: 'ગોપનીયતા નીતિ',
  footer_terms: 'સેવાની શરતો',
  footer_contact: 'સહાય સંપર્ક',
  footer_shipping: 'શિપિંગ માહિતી',
  footer_copyright: 'સર્વ અધિકાર સુરક્ષિત. ટકાઉ ભવિષ્ય માટે ચોક્સ ખેતી.',
};

const hi: Translations = {
  nav_product: 'उत्पाद',
  nav_benefits: 'फ़ायदे',
  nav_shop: 'खरीदें',
  nav_blog: 'ब्लॉग',
  nav_about: 'हमारे बारे में',
  nav_login: 'लॉगिन',
  nav_logout: 'लॉगआउट',
  nav_admin: 'एडमिन',
  nav_profile: 'प्रोफ़ाइल',
  nav_admin_dashboard: 'एडमिन डैशबोर्ड',

  hero_tagline: '"विश्वास और परंपरा, आधुनिकता की ओर एक कदम"',
  hero_heading_line1: 'विश्वास और परंपरा,',
  hero_heading_line2: 'आधुनिकता की ओर एक कदम।',
  hero_shop_now: 'अभी खरीदें',
  hero_trusted_by: '७५,८०० से अधिक किसानों का भरोसा',

  videos_title: 'पावर प्लस वीडियो',
  videos_desc: 'पावर प्लस के असली वीडियो और फील्ड अपडेट देखें।',

  benefits_title_line1: 'वैज्ञानिक सटीकता,',
  benefits_title_line2: 'प्राकृतिक विकास',
  benefits_subtitle: 'हमारा फॉर्मूलेशन आधुनिक खेती की सबसे महत्वपूर्ण चुनौतियों का समाधान करता है।',
  drought_title: 'सूखा सहनशीलता',
  drought_desc: 'उन्नत जल-धारण तकनीक फसलों को लंबे सूखे दौर में भी जीवित और विकसित रहने में मदद करती है।',
  quality_title: 'प्रीमियम गुणवत्ता',
  quality_desc: 'प्रीमियम बाज़ार मूल्य के लिए फल का रंग, चमक और वज़न बेहतर करता है।',
  disease_title: 'रोग प्रतिरोध',
  disease_desc: 'सामान्य रोगों और फंगल संक्रमण के खिलाफ बेहतर रोग प्रतिरोधक क्षमता।',
  root_title: 'जड़ विकास',
  root_desc: 'गहरी जड़ वृद्धि को प्रोत्साहित करता है और मिट्टी में कार्बनिक कार्बन बढ़ाता है।',
  freshness_title: 'लंबी ताज़गी',
  freshness_desc: 'कटाई के बाद फल की ताज़गी और शेल्फ लाइफ बढ़ाता है।',
  cta_badge: 'प्राकृतिक शुगर सामग्री',
  cta_title: 'अपनी पैदावार बढ़ाने के लिए तैयार हैं?',
  cta_desc: '७५,८०० से अधिक सफल किसानों के साथ जुड़ें जिन्होंने पावर प्लस™ अपनाया और मिठास व गुणवत्ता में जबरदस्त सुधार देखा।',
  cta_button: 'मुफ़्त परामर्श लें',

  support_badge: 'सहायता',
  support_title: 'मदद चाहिए? टिकट दर्ज करें',
  support_subtitle: 'हमारी टीम हर सवाल का जवाब देती है। आप अपनी प्रोफ़ाइल में जवाब ट्रैक कर सकते हैं।',
  subject_label: 'विषय',
  subject_placeholder: 'जैसे, ऑर्डर में देरी, उत्पाद क्षति...',
  description_label: 'विवरण',
  description_placeholder: 'अपनी समस्या विस्तार से बताएं...',
  submit_ticket: 'टिकट सबमिट करें',
  submitting: 'सबमिट हो रहा है...',
  track_prefix: 'टिकट और जवाब',
  track_link_text: 'अपनी प्रोफ़ाइल',
  track_suffix: 'में ट्रैक करें।',
  admin_signed_in: 'आप एडमिन के रूप में साइन इन हैं। टिकट प्रबंधित करें',
  admin_panel: 'एडमिन पैनल',
  sign_in_title: 'सहायता टिकट दर्ज करने के लिए साइन इन करें',
  sign_in_desc: 'आपका टिकट ट्रैक किया जाएगा और हमारी टीम सीधे जवाब देगी।',
  sign_in_button: 'आगे बढ़ने के लिए साइन इन करें',

  lang_label: 'भाषा',

  footer_hq_title: 'मुख्यालय',
  footer_hq_address: 'करण अर्जुन कृषि सेवा केंद्र\nकर्जत, महाराष्ट्र 414402\nभारत',
  footer_sales_title: 'बिक्री और सहायता',
  footer_sales_desc: 'सहायता के लिए WhatsApp करें:',
  footer_community_title: 'हमारे समुदाय से जुड़ें',
  footer_community_desc: 'हमारे दैनिक अपडेट फॉलो करें',
  footer_privacy: 'गोपनीयता नीति',
  footer_terms: 'सेवा की शर्तें',
  footer_contact: 'सहायता से संपर्क',
  footer_shipping: 'शिपिंग जानकारी',
  footer_copyright: 'सर्वाधिकार सुरक्षित। टिकाऊ भविष्य के लिए सटीक खेती।',
};

export const translations: Record<Language, Translations> = { en, mr, kn, gu, hi };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  mr: 'मराठी',
  kn: 'ಕನ್ನಡ',
  gu: 'ગુજરાતી',
  hi: 'हिंदी',
};
