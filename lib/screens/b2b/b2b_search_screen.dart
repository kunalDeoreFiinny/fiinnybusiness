import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:url_launcher/url_launcher.dart';

class B2BSearchScreen extends StatefulWidget {
  final String userId;
  const B2BSearchScreen({required this.userId, super.key});

  @override
  State<B2BSearchScreen> createState() => _B2BSearchScreenState();
}

class _B2BSearchScreenState extends State<B2BSearchScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  final TextEditingController _searchController = TextEditingController();
  
  List<Map<String, dynamic>> _allContacts = [];
  List<Map<String, dynamic>> _filteredContacts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAllContacts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAllContacts() async {
    final db = await LocalDatabaseHelper.instance.database;
    
    final result = await db.rawQuery('''
      SELECT c.contactId as customerId, c.name as customerName,
        IFNULL(SUM(CASE WHEN k.type = 'given' THEN k.amount ELSE 0 END), 0) as totalGiven,
        IFNULL(SUM(CASE WHEN k.type = 'received' THEN k.amount ELSE 0 END), 0) as totalReceived
      FROM b2b_contacts c
      LEFT JOIN khata k ON c.contactId = k.customerId
      GROUP BY c.contactId
    ''');

    final List<Map<String, dynamic>> loaded = [];
    for (var row in result) {
      final given = (row['totalGiven'] as num?)?.toDouble() ?? 0.0;
      final received = (row['totalReceived'] as num?)?.toDouble() ?? 0.0;
      loaded.add({
        'customerId': row['customerId'],
        'customerName': row['customerName'],
        'netAmount': given - received,
      });
    }

    if (mounted) {
      setState(() {
        _allContacts = loaded;
        _filteredContacts = loaded; // Initially show all
        _isLoading = false;
      });
    }
  }

  void _filterContacts(String query) {
    if (query.isEmpty) {
      setState(() => _filteredContacts = _allContacts);
      return;
    }
    
    final lowerQuery = query.toLowerCase();
    setState(() {
      _filteredContacts = _allContacts.where((c) {
        final name = (c['customerName'] as String).toLowerCase();
        final phone = (c['customerId'] as String).toLowerCase();
        return name.contains(lowerQuery) || phone.contains(lowerQuery);
      }).toList();
    });
  }

  Future<void> _launchWhatsApp(String phone, double amount) async {
    // Basic reminder text
    final message = "Hello! A polite reminder that Rs ${amount.abs().toStringAsFixed(0)} is pending.";
    final uri = Uri.parse("whatsapp://send?phone=$phone&text=${Uri.encodeComponent(message)}");
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch WhatsApp')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: const AdsBannerCard(
        placement: 'b2b_search_bottom',
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
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: TextField(
          controller: _searchController,
          autofocus: true,
          onChanged: _filterContacts,
          decoration: InputDecoration(
            hintText: 'Search...',
            hintStyle: TextStyle(color: Colors.grey.shade500),
            border: InputBorder.none,
            suffixIcon: const Icon(Icons.search, color: Colors.black54),
          ),
          style: const TextStyle(fontSize: 18, color: Colors.black87),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: Colors.grey.shade200, height: 1.0),
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.separated(
            itemCount: _filteredContacts.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final c = _filteredContacts[index];
              final net = c['netAmount'] as double;
              final isDueToYou = net > 0;
              final isDueByYou = net < 0;

              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.blue.shade100,
                  child: Text(
                    c['customerName']?[0].toUpperCase() ?? '?',
                    style: TextStyle(color: Colors.blue.shade900, fontWeight: FontWeight.bold)
                  ),
                ),
                title: Text(c['customerName'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                subtitle: Text('Balance ₹${net.abs().toStringAsFixed(0)} ${isDueToYou ? 'Due' : (isDueByYou ? 'Advance' : '')}', 
                   style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                trailing: Container(
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: Icon(Icons.wechat, color: Colors.green.shade600), // Using a proxy for whatsapp
                    onPressed: () => _launchWhatsApp(c['customerId'], net),
                  ),
                ),
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/b2b/khata/detail', arguments: {
                    'userId': widget.userId,
                    'customerId': c['customerId'],
                    'customerName': c['customerName'],
                  });
                },
              );
            },
          ),
    );
  }
}
