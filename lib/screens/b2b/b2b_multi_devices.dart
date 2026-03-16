import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
import '../../core/ads/ads_banner_card.dart';

class B2BMultiDevicesScreen extends StatelessWidget {
  final String userId;

  const B2BMultiDevicesScreen({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final B2BLanguageService lang = B2BLanguageService();

    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          bottomNavigationBar: const AdsBannerCard(
            placement: 'b2b_multidevices_bottom',
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
            title: Text(lang.t('Multi Devices'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(color: Colors.grey.shade200, height: 1),
            ),
          ),
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Illustration Section
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                  color: Colors.grey.shade50,
                  child: Column(
                    children: [
                      Container(
                        height: 160,
                        width: 160,
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.devices_other, size: 80, color: Colors.green.shade600),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        lang.t('Use same account on multiple devices'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        lang.t('To add a new device, simply download the app on another phone and login with your mobile number.'),
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.4),
                      ),
                    ],
                  ),
                ),
                
                // Active Devices Section
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('SIGNED IN DEVICES'),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade500,
                          letterSpacing: 1.2
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Current Device Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.grey.shade200),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.02),
                              blurRadius: 8,
                              offset: const Offset(0, 2)
                            )
                          ]
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(Icons.phone_android, color: Colors.green.shade700),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(lang.t('This Device'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text('Active now', style: TextStyle(color: Colors.green.shade600, fontSize: 13, fontWeight: FontWeight.w500)),
                                  const SizedBox(height: 4),
                                  Text('App Version 2.6.3', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Info Tip
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.amber.shade100)
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.lightbulb_outline, color: Colors.amber.shade700, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                lang.t('Your data is automatically synced across all signed-in devices.'),
                                style: TextStyle(color: Colors.amber.shade900, fontSize: 13, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                )
              ],
            ),
          )
        );
      }
    );
  }
}
