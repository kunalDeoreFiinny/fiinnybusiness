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
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.black87),
              onPressed: () => Navigator.of(context).pop(),
            ),
            actions: [
               Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: buildB2BLanguageDropdown(),
              )
            ],
          ),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Spacer(flex: 1),
                  const Icon(Icons.storefront_rounded, size: 80, color: Colors.indigo),
                  const SizedBox(height: 24),
                  Text(
                    lang.t('Start your Digital Book'),
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    lang.t('Manage your sales, inventory, and udhari easily.'),
                    style: const TextStyle(fontSize: 16, color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  TextField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: lang.t('Business Name'),
                      prefixIcon: const Icon(Icons.business_rounded),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                  ),
                  const Spacer(flex: 2),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _completeOnboarding,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))
                    ),
                    child: _isLoading 
                      ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(lang.t('Continue'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  )
                ],
              ),
            ),
          ),
        );
      }
    );
  }
}
