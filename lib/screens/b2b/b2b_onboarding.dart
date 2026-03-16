import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/b2b_language_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../routes.dart';

class B2BOnboardingScreen extends StatefulWidget {
  final String userId;
  const B2BOnboardingScreen({required this.userId, super.key});

  @override
  State<B2BOnboardingScreen> createState() => _B2BOnboardingScreenState();
}

class _B2BOnboardingScreenState extends State<B2BOnboardingScreen> {
  final TextEditingController _nameController = TextEditingController();
  final B2BLanguageService lang = B2BLanguageService();
  bool _isLoading = false;

  void _completeOnboarding() async {
    final businessName = _nameController.text.trim();
    if (businessName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('Please enter a business name.')))
      );
      return;
    }

    setState(() => _isLoading = true);
    
    // Save locally
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('b2b_business_name_${widget.userId}', businessName);

    // Save to Firestore (Fire and forget, handle offline gracefully via local save)
    try {
      await FirebaseFirestore.instance.collection('users').doc(widget.userId).set({
        'businessName': businessName,
      }, SetOptions(merge: true));
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
      // Navigate to B2B Dashboard, replacing onboarding
      Navigator.pushReplacementNamed(context, '/b2b/dashboard', arguments: widget.userId);
    }
  }

  void _skipOnboarding() {
    Navigator.pushReplacementNamed(context, '/b2b/dashboard', arguments: widget.userId);
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            automaticallyImplyLeading: false, // Match screenshot (no back button)
            title: Row(
               children: [
                 Image.asset('assets/icons/fiinny_logo.png', height: 28, errorBuilder: (ctx,err,stack)=>Icon(Icons.business_rounded, color:Colors.green.shade800)),
                 const SizedBox(width: 8),
                 Text('Fiinny Business', style: TextStyle(color: Colors.green.shade800, fontWeight: FontWeight.bold, fontSize: 20)),
               ]
            ),
            actions: [
              TextButton(
                onPressed: _skipOnboarding,
                style: TextButton.styleFrom(
                   shape: StadiumBorder(side: BorderSide(color: Colors.grey.shade400)),
                   padding: const EdgeInsets.symmetric(horizontal: 20),
                ),
                child: Text(lang.t('Skip'), style: const TextStyle(color: Colors.black87, fontSize: 16)),
              ),
              const SizedBox(width: 16),
            ],
          ),
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                       color: Colors.blue.shade50,
                       borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.storefront_outlined, size: 40, color: Colors.blue.shade700),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    lang.t('Add your business/shop name'),
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    lang.t('This will help your customers identify your business/ shop.'),
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade600, height: 1.4),
                  ),
                  const SizedBox(height: 40),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _nameController,
                          autofocus: true,
                          decoration: InputDecoration(
                            labelText: lang.t('Business/ Shop Name'),
                            labelStyle: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w500),
                            prefixIcon: Icon(Icons.store_mall_directory_outlined, color: Colors.green.shade700),
                            border: OutlineInputBorder(
                               borderRadius: BorderRadius.circular(12),
                               borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            enabledBorder: OutlineInputBorder(
                               borderRadius: BorderRadius.circular(12),
                               borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            focusedBorder: OutlineInputBorder(
                               borderRadius: BorderRadius.circular(12),
                               borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(vertical: 20)
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      InkWell(
                        onTap: _isLoading ? null : _completeOnboarding,
                        borderRadius: BorderRadius.circular(28),
                        child: Container(
                           height: 56,
                           width: 56,
                           decoration: BoxDecoration(
                              color: Colors.green.shade700,
                              shape: BoxShape.circle,
                              boxShadow: [
                                 BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4)
                                 )
                              ]
                           ),
                           child: _isLoading 
                             ? const Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                             : const Icon(Icons.check_rounded, color: Colors.white, size: 32),
                        )
                      )
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      }
    );
  }
}
