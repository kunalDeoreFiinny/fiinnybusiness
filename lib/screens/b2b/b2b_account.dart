import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class B2BAccountScreen extends StatefulWidget {
  final String userId;
  const B2BAccountScreen({required this.userId, super.key});

  @override
  State<B2BAccountScreen> createState() => _B2BAccountScreenState();
}

class _B2BAccountScreenState extends State<B2BAccountScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  bool _isLoading = true;
  String _businessName = '';
  
  double _customerBalance = 0;
  int _customerCount = 0;
  
  double _supplierBalance = 0;
  int _supplierCount = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    // Load Business Name
    final prefs = await SharedPreferences.getInstance();
    final localName = prefs.getString('b2b_business_name_${widget.userId}');
    if (localName != null && localName.isNotEmpty) {
      _businessName = localName;
    } else {
      try {
        final doc = await FirebaseFirestore.instance.collection('users').doc(widget.userId).get();
        if (doc.exists && doc.data() != null) {
          final name = doc.data()!['businessName'] as String?;
          if (name != null) {
            _businessName = name;
            await prefs.setString('b2b_business_name_${widget.userId}', name);
          }
        }
      } catch (_) {}
    }

    if (_businessName.isEmpty) {
      _businessName = lang.t('My Business');
    }

    // Load Balances
    final db = await LocalDatabaseHelper.instance.database;
    final result = await db.rawQuery('''
      SELECT c.type as roleType,
        IFNULL(SUM(CASE WHEN k.type = 'given' THEN k.amount ELSE 0 END), 0) as totalGiven,
        IFNULL(SUM(CASE WHEN k.type = 'received' THEN k.amount ELSE 0 END), 0) as totalReceived
      FROM b2b_contacts c
      LEFT JOIN khata k ON c.contactId = k.customerId
      GROUP BY c.contactId
    ''');

    double custBal = 0;
    int custCount = 0;
    double suppBal = 0;
    int suppCount = 0;

    for (var row in result) {
      final given = (row['totalGiven'] as num?)?.toDouble() ?? 0.0;
      final received = (row['totalReceived'] as num?)?.toDouble() ?? 0.0;
      final netAmount = given - received; 
      
      if (row['roleType'] == 'CUSTOMER') {
        custBal += netAmount;
        custCount++;
      } else if (row['roleType'] == 'SUPPLIER') {
        suppBal += netAmount;
        suppCount++;
      }
    }

    if (mounted) {
      setState(() {
        _customerBalance = custBal;
        _customerCount = custCount;
        _supplierBalance = suppBal;
        _supplierCount = suppCount;
        _isLoading = false;
      });
    }
  }

  Widget _buildBalanceCard({
    required String title,
    required double balance,
    required int count,
    required String countLabel,
    required Color color,
  }) {
    final absBalance = balance.abs();
    final isPositive = balance >= 0;
    
    String statusText;
    if (balance == 0) {
      statusText = lang.t('Settled');
    } else if (title.contains('Customer')) {
      statusText = isPositive ? lang.t("You'll Get") : lang.t("You'll Give");
    } else {
      statusText = isPositive ? lang.t("You'll Give") : lang.t("You'll Get");
    }

    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200)
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
                ),
                Text(
                  '₹${absBalance.toStringAsFixed(0)}',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: color),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$count $countLabel',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                Text(
                  statusText,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.grey.shade50,
          bottomNavigationBar: const AdsBannerCard(
            placement: 'b2b_account_bottom',
            inline: false,
            inlineMaxHeight: 60,
            margin: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            padding: EdgeInsets.zero,
            backgroundColor: Colors.transparent,
            boxShadow: [],
            minHeight: 52,
          ),
          appBar: AppBar(
            backgroundColor: Colors.indigo.shade700,
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
            title: Text(
              _isLoading ? lang.t('Loading...') : _businessName,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)
            ),
          ),
          body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  const SizedBox(height: 16),
                  _buildBalanceCard(
                    title: lang.t('Customer Khata'),
                    balance: _customerBalance,
                    count: _customerCount,
                    countLabel: lang.t('Customers'),
                    color: _customerBalance >= 0 ? Colors.green.shade700 : Colors.red.shade600,
                  ),
                  _buildBalanceCard(
                    title: lang.t('Supplier Khata'),
                    balance: _supplierBalance,
                    count: _supplierCount,
                    countLabel: lang.t('Suppliers'),
                    color: _supplierBalance >= 0 ? Colors.green.shade700 : Colors.red.shade600,
                  ),
                  const Spacer(),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    color: Colors.white,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(lang.t('Backup functionality coming soon.')))
                        );
                      },
                      icon: const Icon(Icons.download_rounded),
                      label: Text(lang.t('Download Backup')),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.indigo.shade700,
                        side: BorderSide(color: Colors.indigo.shade200),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                      ),
                    ),
                  )
                ],
              ),
        );
      }
    );
  }
}
