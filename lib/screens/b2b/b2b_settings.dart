import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:firebase_auth/firebase_auth.dart';

class B2BSettingsScreen extends StatelessWidget {
  const B2BSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final B2BLanguageService lang = B2BLanguageService();

    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          bottomNavigationBar: const AdsBannerCard(
            placement: 'b2b_settings_bottom',
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
            foregroundColor: Colors.black87,
            elevation: 0,
            title: Text(lang.t('Settings'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(color: Colors.grey.shade200, height: 1),
            ),
          ),
          body: Column(
            children: [
              _buildListTile(
                icon: Icons.backup_outlined,
                title: lang.t('Backup Photos'),
                onTap: () {},
                iconColor: Colors.green.shade700,
              ),
              const Divider(height: 1),
              _buildListTile(
                icon: Icons.privacy_tip_outlined,
                title: lang.t('Privacy Policy & Security'),
                onTap: () {},
                iconColor: Colors.green.shade700,
              ),
              const Divider(height: 1),
              _buildListTile(
                icon: Icons.info_outline,
                title: lang.t('Terms & Conditions'),
                onTap: () {},
                iconColor: Colors.green.shade700,
              ),
              const Divider(height: 1),
              _buildListTile(
                icon: Icons.delete_outline,
                title: lang.t('Delete Account'),
                onTap: () {},
                iconColor: Colors.green.shade700,
              ),
              const Divider(height: 1),
              
              // Gray Section break
              Container(height: 8, color: Colors.grey.shade50),
              
              _buildListTile(
                icon: Icons.exit_to_app,
                title: lang.t('Sign out from all devices'),
                onTap: () {},
                iconColor: Colors.green.shade700,
              ),
              const Divider(height: 1),
              
              // Gray Section break
              Container(height: 8, color: Colors.grey.shade50),

              _buildListTile(
                icon: Icons.power_settings_new,
                title: lang.t('Sign out'),
                onTap: () async {
                  await FirebaseAuth.instance.signOut();
                  if (context.mounted) {
                    Navigator.pushNamedAndRemoveUntil(context, '/login', (r) => false);
                  }
                },
                iconColor: Colors.red,
                textColor: Colors.red,
              ),
              const Divider(height: 1),
              
              const Spacer(),
              
              // Footer
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 24.0),
                child: Column(
                  children: [
                    Text(
                      'Version 2.6.3',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Made with ♥ in India',
                      style: TextStyle(color: Colors.grey.shade800, fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              )
            ],
          ),
        );
      }
    );
  }

  Widget _buildListTile({
    required IconData icon, 
    required String title, 
    required VoidCallback onTap,
    Color? iconColor,
    Color? textColor,
  }) {
    return ListTile(
      leading: Icon(icon, color: iconColor),
      title: Text(
        title, 
        style: TextStyle(
          color: textColor ?? Colors.black87,
          fontWeight: FontWeight.w600,
          fontSize: 15
        )
      ),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
    );
  }
}
