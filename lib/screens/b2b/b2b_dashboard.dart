import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/ads/ads_banner_card.dart';
import '../../services/b2b_language_service.dart';

class B2BDashboardScreen extends StatefulWidget {
  final String userId;
  const B2BDashboardScreen({required this.userId, super.key});

  @override
  State<B2BDashboardScreen> createState() => _B2BDashboardScreenState();
}

class _B2BDashboardScreenState extends State<B2BDashboardScreen> {
  String _businessName = '';

  @override
  void initState() {
    super.initState();
    _loadBusinessName();
  }

  Future<void> _loadBusinessName() async {
    final prefs = await SharedPreferences.getInstance();
    final name = prefs.getString('b2b_business_name_${widget.userId}') ?? '';
    if (mounted) {
      setState(() {
        _businessName = name;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = B2BLanguageService();
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.grey[50],
          appBar: AppBar(
            title: Text(
              lang.t('Business Dashboard'),
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
            ),
            backgroundColor: Colors.white,
            elevation: 1,
            systemOverlayStyle: Theme.of(context).appBarTheme.systemOverlayStyle,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.black87),
              onPressed: () => Navigator.of(context).pop(),
              tooltip: 'Back to Personal',
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: buildB2BLanguageDropdown(),
              )
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        _businessName.isNotEmpty ? _businessName : lang.t('Welcome to Retailer Mode'),
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_square, color: Colors.indigo),
                      tooltip: lang.t('Edit Profile'),
                      onPressed: () async {
                        final changed = await Navigator.pushNamed(context, '/b2b/profile', arguments: widget.userId);
                        if (changed == true) {
                          _loadBusinessName();
                        }
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildActionGrid(context, lang),
                const SizedBox(height: 24),
                AdsBannerCard(
                  placement: 'b2b_dashboard_mid',
                  inline: false,
                  inlineMaxHeight: 120,
                  minHeight: 96,
                  margin: EdgeInsets.zero,
                  backgroundColor: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Text(
                  lang.t('Recent Activity'),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Center(
                    child: Text(
                      lang.t('No recent orders yet.\nStart billing to see activity!'),
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.grey, height: 1.5),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    );
  }

  Widget _buildActionGrid(BuildContext context, B2BLanguageService lang) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.1, // slightly taller
      children: [
        _buildActionCard(
          context,
          title: lang.t('Digital Khata'),
          subtitle: lang.t('Manage your udhar and jama natively'),
          icon: Icons.menu_book_rounded,
          color: Colors.orange,
          onTap: () {
            Navigator.pushNamed(context, '/b2b/khata', arguments: widget.userId);
          },
        ),
        _buildActionCard(
          context,
          title: lang.t('POS Billing'),
          subtitle: lang.t('Fast checkout offline or online'),
          icon: Icons.point_of_sale_rounded,
          color: Colors.blue,
          onTap: () {
            Navigator.pushNamed(context, '/b2b/pos', arguments: widget.userId);
          },
        ),
        _buildActionCard(
          context,
          title: lang.t('Inventory'),
          subtitle: lang.t('Add or manage stock'),
          icon: Icons.inventory_2_rounded,
          color: Colors.green,
          onTap: () {
            Navigator.pushNamed(context, '/b2b/inventory', arguments: widget.userId);
          },
        ),
        _buildActionCard(
          context,
          title: lang.t('Order History'),
          subtitle: lang.t('View past sales summaries (Coming Soon)'),
          icon: Icons.history_rounded,
          color: Colors.purple,
          onTap: () {
            // Navigator.pushNamed(context, '/b2b/history', arguments: widget.userId);
          },
        ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.1),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const Spacer(),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
