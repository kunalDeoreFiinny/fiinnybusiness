import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:fl_chart/fl_chart.dart';

class B2BAnalyticsScreen extends StatefulWidget {
  final String userId;

  const B2BAnalyticsScreen({required this.userId, super.key});

  @override
  State<B2BAnalyticsScreen> createState() => _B2BAnalyticsScreenState();
}

class _B2BAnalyticsScreenState extends State<B2BAnalyticsScreen> {
  final B2BLanguageService lang = B2BLanguageService();

  bool _isLoading = true;
  double _totalOwedToUs = 0.0; // Customers owe us
  double _totalWeOwe = 0.0; // We owe suppliers
  
  List<Map<String, dynamic>> _topDefaulters = [];
  
  int _totalCustomers = 0;
  int _totalSuppliers = 0;

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    final db = await LocalDatabaseHelper.instance.database;
    
    // Fetch all aggregated balances
    final result = await db.rawQuery('''
      SELECT customerId, customerName,
      SUM(CASE WHEN type = 'given' THEN amount ELSE 0 END) as totalGiven,
      SUM(CASE WHEN type = 'received' THEN amount ELSE 0 END) as totalReceived
      FROM khata
      GROUP BY customerId
    ''');

    double owedToUs = 0.0;
    double weOwe = 0.0;
    
    int customers = 0;
    int suppliers = 0;
    
    List<Map<String, dynamic>> customersList = [];

    for (var row in result) {
      final given = (row['totalGiven'] as num?)?.toDouble() ?? 0.0;
      final received = (row['totalReceived'] as num?)?.toDouble() ?? 0.0;
      final net = given - received;

      if (net > 0) {
        owedToUs += net;
        customers++;
        customersList.add({
          'customerId': row['customerId'],
          'customerName': row['customerName'],
          'netAmount': net,
        });
      } else if (net < 0) {
        weOwe += net.abs();
        suppliers++;
      } else {
        // Balance is 0, we can ignore or count as neutral customer
      }
    }

    // Sort to find top defaulters (highest netAmount > 0)
    customersList.sort((a, b) => (b['netAmount'] as double).compareTo(a['netAmount'] as double));
    final topDefaulters = customersList.take(5).toList();

    if (mounted) {
      setState(() {
        _totalOwedToUs = owedToUs;
        _totalWeOwe = weOwe;
        _totalCustomers = customers;
        _totalSuppliers = suppliers;
        _topDefaulters = topDefaulters;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Text(lang.t('Business Analytics'), style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      bottomNavigationBar: const AdsBannerCard(
        placement: 'b2b_analytics_bottom',
        inline: false,
        inlineMaxHeight: 60,
        margin: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: EdgeInsets.zero,
        backgroundColor: Colors.transparent,
        boxShadow: [],
        minHeight: 52,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadAnalytics,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildSummaryCards(),
                  const SizedBox(height: 24),
                  _buildPieChartSection(),
                  const SizedBox(height: 24),
                  _buildTopDefaulters(),
                ],
              ),
            ),
          ),
    );
  }

  Widget _buildSummaryCards() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
              border: Border.all(color: Colors.green.shade100, width: 2)
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.arrow_downward_rounded, color: Colors.green.shade700, size: 20),
                    const SizedBox(width: 8),
                    Text(lang.t("You'll Get"), style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 12),
                Text('₹${_totalOwedToUs.toStringAsFixed(0)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87)),
                const SizedBox(height: 4),
                Text(lang.t("From $_totalCustomers Customers"), style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
              border: Border.all(color: Colors.red.shade100, width: 2)
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.arrow_upward_rounded, color: Colors.red.shade700, size: 20),
                    const SizedBox(width: 8),
                    Text(lang.t("You'll Give"), style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 12),
                Text('₹${_totalWeOwe.toStringAsFixed(0)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87)),
                const SizedBox(height: 4),
                Text(lang.t("To $_totalSuppliers Suppliers"), style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPieChartSection() {
    if (_totalOwedToUs == 0 && _totalWeOwe == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(lang.t('Cash Flow Distribution'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sectionsSpace: 4,
                centerSpaceRadius: 50,
                sections: [
                  PieChartSectionData(
                    color: Colors.green.shade500,
                    value: _totalOwedToUs,
                    title: '₹${_totalOwedToUs.toStringAsFixed(0)}',
                    radius: 60,
                    titleStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  if (_totalWeOwe > 0)
                    PieChartSectionData(
                      color: Colors.red.shade400,
                      value: _totalWeOwe,
                      title: '₹${_totalWeOwe.toStringAsFixed(0)}',
                      radius: 50,
                      titleStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildIndicator(Colors.green.shade500, lang.t("Owed to you")),
              const SizedBox(width: 16),
              _buildIndicator(Colors.red.shade400, lang.t("You owe")),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildIndicator(Color color, String text) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(fontSize: 14, color: Colors.black54, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildTopDefaulters() {
    if (_topDefaulters.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.orange),
              const SizedBox(width: 8),
              Text(lang.t('Top Udhari Holders'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          ..._topDefaulters.map((c) => _buildDefaulterTile(c)),
        ],
      ),
    );
  }

  Widget _buildDefaulterTile(Map<String, dynamic> c) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.indigo.shade50,
            radius: 20,
            child: Text(c['customerName']?[0].toUpperCase() ?? '?', style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(c['customerName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(c['customerId'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('₹${(c['netAmount'] as double).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 16)),
              Text(lang.t('Due'), style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}
