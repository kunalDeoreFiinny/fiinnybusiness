import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/ads/ads_banner_card.dart';
import '../../services/b2b_language_service.dart';

class B2BProfileScreen extends StatefulWidget {
  final String userId;
  const B2BProfileScreen({required this.userId, super.key});

  @override
  State<B2BProfileScreen> createState() => _B2BProfileScreenState();
}

class _B2BProfileScreenState extends State<B2BProfileScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  bool _isLoading = true;
  String? _businessName;
  String? _phone;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final localName = prefs.getString('b2b_business_name_${widget.userId}');
    
    if (localName != null && localName.isNotEmpty) {
      _businessName = localName;
    }
    
    try {
      final doc = await FirebaseFirestore.instance.collection('users').doc(widget.userId).get();
      if (doc.exists && doc.data() != null) {
        final data = doc.data()!;
        _phone = data['phone'] as String?;
        if (_businessName == null) {
          _businessName = data['businessName'] as String?;
          if (_businessName != null) {
            await prefs.setString('b2b_business_name_${widget.userId}', _businessName!);
          }
        }
      }
    } catch (_) {}
    
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade800,
        ),
      ),
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required String title,
    required String value,
    bool showEdit = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: ListTile(
        leading: Icon(icon, color: Colors.green.shade700),
        title: Text(value, style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.blueGrey)),
        subtitle: Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        trailing: showEdit 
            ? Icon(Icons.edit, color: Colors.black87)
            : const Icon(Icons.chevron_right, color: Colors.black87),
        onTap: () {
          // Placeholder for tap action
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          bottomNavigationBar: const AdsBannerCard(
            placement: 'b2b_profile_bottom',
            inline: false,
            inlineMaxHeight: 60,
            margin: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            padding: EdgeInsets.zero,
            backgroundColor: Colors.transparent,
            boxShadow: [],
            minHeight: 52,
          ),
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.black87),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(lang.t('Profile'), style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
          ),
          body: _isLoading 
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    // Avatar Section
                    Center(
                      child: Stack(
                        children: [
                          CircleAvatar(
                            radius: 48,
                            backgroundColor: Colors.grey.shade300,
                            child: const Icon(Icons.person, size: 60, color: Colors.white),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: Colors.green.shade700,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2)
                              ),
                              child: const Icon(Icons.edit, color: Colors.white, size: 16),
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    _buildSectionHeader(lang.t('Business Information')),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade200)
                      ),
                      child: Column(
                        children: [
                          _buildInfoTile(
                            icon: Icons.store,
                            title: lang.t('Switch to other business'),
                            value: lang.t('Switch Business'),
                          ),
                          _buildInfoTile(
                            icon: Icons.storefront_outlined,
                            title: lang.t('Profile name will be visible to your customers'),
                            value: _businessName ?? lang.t('Not set'),
                          ),
                          _buildInfoTile(
                            icon: Icons.phone_android,
                            title: lang.t('Mobile Number'),
                            value: _phone ?? widget.userId,
                            showEdit: true,
                          ),
                          _buildInfoTile(
                            icon: Icons.domain,
                            title: lang.t('Business Type'),
                            value: lang.t('Select your business type'),
                          ),
                          _buildInfoTile(
                            icon: Icons.category_outlined,
                            title: lang.t('Category'),
                            value: lang.t('Select your category'),
                          ),
                          Container(
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.vertical(bottom: Radius.circular(12))
                            ),
                            child: ListTile(
                              leading: Icon(Icons.location_on_outlined, color: Colors.green.shade700),
                              title: Text(lang.t('Enter your Address'), style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.blueGrey)),
                              subtitle: Text(lang.t('Address'), style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                              trailing: const Icon(Icons.chevron_right, color: Colors.black87),
                            ),
                          ),
                        ],
                      ),
                    ),

                    _buildSectionHeader(lang.t('Other Information')),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade200)
                      ),
                      child: Column(
                        children: [
                          _buildInfoTile(
                            icon: Icons.mail_outline,
                            title: lang.t('Email'),
                            value: lang.t('Enter your Email'),
                          ),
                          _buildInfoTile(
                            icon: Icons.info_outline,
                            title: lang.t('About Us'),
                            value: lang.t('Enter about your business'),
                          ),
                          Container(
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.vertical(bottom: Radius.circular(12))
                            ),
                            child: ListTile(
                              leading: Icon(Icons.person_outline, color: Colors.green.shade700),
                              title: Text(lang.t('Enter Contact Person Name'), style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.blueGrey)),
                              subtitle: Text(lang.t('Contact Person Name'), style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                              trailing: const Icon(Icons.chevron_right, color: Colors.black87),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
        );
      }
    );
  }
}

