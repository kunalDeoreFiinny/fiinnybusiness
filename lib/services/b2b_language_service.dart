import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class B2BLanguageService {
  static final B2BLanguageService _instance = B2BLanguageService._internal();
  factory B2BLanguageService() => _instance;
  B2BLanguageService._internal();

  static const String _prefKey = 'b2b_language_code';
  
  // Expose the current language code globally so UI can listen to it
  final ValueNotifier<String> currentLanguage = ValueNotifier<String>('en');

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedCode = prefs.getString(_prefKey) ?? 'en';
    currentLanguage.value = savedCode;
  }

  Future<void> changeLanguage(String langCode) async {
    if (['en', 'hi', 'mr'].contains(langCode)) {
      currentLanguage.value = langCode;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, langCode);
    }
  }

  String t(String key) {
    final langMap = _dictionary[currentLanguage.value] ?? _dictionary['en']!;
    return langMap[key] ?? key;
  }

  // --- Dictionary ---
  static const Map<String, Map<String, String>> _dictionary = {
    'en': {
      'Business Dashboard': 'Business Dashboard',
      'Welcome to Retailer Mode': 'Welcome to Retailer Mode',
      'POS Billing': 'POS Billing',
      'Create new bill': 'Create new bill',
      'Inventory': 'Inventory',
      'Manage stock': 'Manage stock',
      'Worklist': 'Worklist',
      'Daily tasks': 'Daily tasks',
      'Order History': 'Order History',
      'Past invoices': 'Past invoices',
      'Recent Activity': 'Recent Activity',
      'No recent orders yet.\nStart billing to see activity!': 'No recent orders yet.\nStart billing to see activity!',
      
      'New Invoice (POS)': 'New Invoice (POS)',
      'Customer Phone': 'Customer Phone',
      'Customer Name (Optional)': 'Customer Name (Optional)',
      'Cart Items': 'Cart Items',
      'Add Item': 'Add Item',
      'Scan a barcode or add an item to begin.': 'Scan a barcode or add an item to begin.',
      'Total Amount': 'Total Amount',
      'Confirm & Print Bill': 'Confirm & Print Bill',
      'Cart is empty!': 'Cart is empty!',
      'Bill saved offline (will sync automatically)': 'Bill saved offline (will sync automatically)',
      'Added Product: ': 'Added Product: ',
    },
    'hi': {
      'Business Dashboard': 'व्यापार डैशबोर्ड',
      'Welcome to Retailer Mode': 'रिटेलर मोड में आपका स्वागत है',
      'POS Billing': 'पीओएस बिलिंग',
      'Create new bill': 'नया बिल बनाएं',
      'Inventory': 'स्टॉक (इन्वेंट्री)',
      'Manage stock': 'स्टॉक प्रबंधित करें',
      'Worklist': 'कार्य सूची',
      'Daily tasks': 'दैनिक कार्य',
      'Order History': 'ऑर्डर का इतिहास',
      'Past invoices': 'पिछले बिल',
      'Recent Activity': 'हाल की गतिविधि',
      'No recent orders yet.\nStart billing to see activity!': 'अभी तक कोई ऑर्डर नहीं।\nगतिविधि देखने के लिए बिलिंग शुरू करें!',
      
      'New Invoice (POS)': 'नया बिल (POS)',
      'Customer Phone': 'ग्राहक का फोन',
      'Customer Name (Optional)': 'ग्राहक का नाम (वैकल्पिक)',
      'Cart Items': 'कार्ट आइटम',
      'Add Item': 'आइटम जोड़ें',
      'Scan a barcode or add an item to begin.': 'शुरू करने के लिए बारकोड स्कैन करें या आइटम जोड़ें।',
      'Total Amount': 'कुल राशि',
      'Confirm & Print Bill': 'पुष्टि करें और बिल प्रिंट करें',
      'Cart is empty!': 'कार्ट खाली है!',
      'Bill saved offline (will sync automatically)': 'बिल ऑफ़लाइन सेव हो गया (सिंक हो जाएगा)',
      'Added Product: ': 'उत्पाद जोड़ा गया: ',
      'Digital Khata': 'डिजिटल खाता',
      "You'll Give": 'आपको देना है',
      "You'll Get": 'आपको मिलेगा',
      'No customers yet.': 'अभी तक कोई ग्राहक नहीं।',
      'Add a customer to start tracking udhari.': 'उधारी ট্র্যাক करने के लिए एक ग्राहक जोड़ें।',
      'Add Customer': 'ग्राहक जोड़ें',
      'Settled Up': 'चुका दिया गया',
      'Settled': 'चुका',
      'ENTRIES': 'प्रविष्टियां',
      'GAVE': 'दिया',
      'GOT': 'मिला',
      'GAVE ₹': 'दिया ₹',
      'GOT ₹': 'मिला ₹',
      'Save': 'सेव करें',
      'Enter Details (Bill No, Items, etc)': 'विवरण दर्ज करें (बिल नंबर, आइटम, आदि)',
      'You Gave ₹': 'आपने दिया ₹',
      'You Got ₹': 'आपको मिला ₹',
      'No entries yet.\nTap below to add.': 'अभी तक कोई प्रविष्टि नहीं।\nजोड़ने के लिए नीचे टैप करें।',
      'Start your Digital Book': 'अपना डिजिटल खाता शुरू करें',
      'Manage your sales, inventory, and udhari easily.': 'अपनी बिक्री, स्टॉक और उधारी आसानी से प्रबंधित करें।',
      'Business Name': 'व्यवसाय का नाम',
      'Continue': 'आगे बढ़ें',
      'Please enter a business name.': 'कृपया व्यवसाय का नाम दर्ज करें।',
      "Note: This contact also owes you ₹": "नोट: इस व्यक्ति को आपको ₹",
      "Note: You owe this contact ₹": "नोट: आपको इस व्यक्ति को ₹",
      " in your personal splits.": " व्यक्तिगत खर्चों में भी देने हैं।",
    },
    'mr': {
      'Business Dashboard': 'व्यवसाय डॅशबोर्ड',
      'Welcome to Retailer Mode': 'किरकोळ विक्रेता मोडमध्ये आपले स्वागत आहे',
      'POS Billing': 'बिलाची पावती',
      'Create new bill': 'नवीन बिल बनवा',
      'Inventory': 'स्टॉक (इन्व्हेंटरी)',
      'Manage stock': 'स्टॉक व्यवस्थापित करा',
      'Worklist': 'कामाची यादी',
      'Daily tasks': 'रोजची कामे',
      'Order History': 'ऑर्डरचा इतिहास',
      'Past invoices': 'मागील बिले',
      'Recent Activity': 'अलीकडील घडामोडी',
      'No recent orders yet.\nStart billing to see activity!': 'अद्याप कोणतीही ऑर्डर नाही.\nव्यवहार पाहण्यासाठी बिलिंग सुरू करा!',
      
      'New Invoice (POS)': 'नवीन बिल (POS)',
      'Customer Phone': 'ग्राहकाचा फोन',
      'Customer Name (Optional)': 'ग्राहकाचे नाव (पर्यायी)',
      'Cart Items': 'कार्ट आयटम',
      'Add Item': 'आयटम जोडा',
      'Scan a barcode or add an item to begin.': 'सुरू करण्यासाठी बारकोड स्कॅन करा किंवा आयटम जोडा.',
      'Total Amount': 'एकूण रक्कम',
      'Confirm & Print Bill': 'निश्चित करा आणि बिल प्रिंट करा',
      'Cart is empty!': 'कार्ट रिक्त आहे!',
      'Bill saved offline (will sync automatically)': 'बिल ऑफलाइन सेव्ह केले (सिंक होईल)',
      'Added Product: ': 'उत्पादन जोडले: ',

      'Digital Khata': 'डिजिटल खाता',
      "You'll Give": 'तुम्हाला द्यायचे आहेत',
      "You'll Get": 'तुम्हाला मिळतील',
      'No customers yet.': 'अद्याप कोणतेही ग्राहक नाहीत.',
      'Add a customer to start tracking udhari.': 'उधारी ट्रॅक करण्यासाठी ग्राहक जोडा.',
      'Add Customer': 'ग्राहक जोडा',
      'Settled Up': 'चुकते केले',
      'Settled': 'चुकते',
      'ENTRIES': 'नोंदी',
      'GAVE': 'दिले',
      'GOT': 'मिळाले',
      'GAVE ₹': 'दिले ₹',
      'GOT ₹': 'मिळाले ₹',
      'Save': 'सेव्ह करा',
      'Enter Details (Bill No, Items, etc)': 'तपशील भरा (बिल क्रमांक, आयटम, इ)',
      'You Gave ₹': 'तुम्ही दिले ₹',
      'You Got ₹': 'तुम्हाला मिळाले ₹',
      'No entries yet.\nTap below to add.': 'अद्याप कोणतीही नोंद नाही.\nजोडण्यासाठी खाली टॅप करा.',
      'Start your Digital Book': 'तुमचे डिजिटल खाते सुरू करा',
      'Manage your sales, inventory, and udhari easily.': 'तुमची विक्री, स्टॉक आणि उधारी सहज व्यवस्थापित करा.',
      'Business Name': 'व्यवसायाचे नाव',
      'Continue': 'पुढे जा',
      'Please enter a business name.': 'कृपया व्यवसायाचे नाव भरा.',
      "Note: This contact also owes you ₹": "टीप: या संपर्काने तुम्हाला ₹",
      "Note: You owe this contact ₹": "टीप: तुमचे या संपर्काला ₹",
      " in your personal splits.": " वैयक्तिक खर्चात देणे बाकी आहे.",
    }
  };
}

Widget buildB2BLanguageDropdown({bool iconOnly = false}) {
  return ValueListenableBuilder<String>(
    valueListenable: B2BLanguageService().currentLanguage,
    builder: (context, lang, child) {
      return DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: lang,
          icon: Icon(Icons.language_rounded, color: iconOnly ? Colors.white : Colors.indigo),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(12),
          items: const [
            DropdownMenuItem(value: 'en', child: Text('English', style: TextStyle(fontWeight: FontWeight.bold))),
            DropdownMenuItem(value: 'hi', child: Text('हिन्दी', style: TextStyle(fontWeight: FontWeight.bold))),
            DropdownMenuItem(value: 'mr', child: Text('मराठी', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
          onChanged: (String? newLang) {
            if (newLang != null) {
              B2BLanguageService().changeLanguage(newLang);
            }
          },
        ),
      );
    },
  );
}
