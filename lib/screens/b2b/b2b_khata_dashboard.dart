import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import '../../services/contact_name_service.dart';
import '../../widgets/contact_picker_dialog.dart';
import 'package:permission_handler/permission_handler.dart';

class B2BKhataDashboardScreen extends StatefulWidget {
  final String userId;
  const B2BKhataDashboardScreen({required this.userId, super.key});

  @override
  State<B2BKhataDashboardScreen> createState() => _B2BKhataDashboardScreenState();
}

class _B2BKhataDashboardScreenState extends State<B2BKhataDashboardScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  
  List<Map<String, dynamic>> _customers = [];
  bool _isLoading = true;

  double get _totalUdhar => _customers.fold(0.0, (sum, c) => (c['netAmount'] < 0) ? sum + c['netAmount'].abs() : sum);
  double get _totalJama => _customers.fold(0.0, (sum, c) => (c['netAmount'] > 0) ? sum + c['netAmount'] : sum);

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  Future<void> _loadCustomers() async {
    setState(() => _isLoading = true);
    final db = await LocalDatabaseHelper.instance.database;
    // Group all entries by customer to find their net balance.
    // Negative = You'll GIVE (Udhar), Positive = You'll GET (Jama).
    // For okcredit semantics: 
    //   Gave money/goods = You need to collect (Udhar -> Positive balance owed TO YOU)
    //   Got money/goods = You need to pay (Jama -> Negative balance owed BY YOU)
    // Wait, let's stick to okcredit standard:
    // "You'll Give" (Red) = Negative, "You'll Get" (Green) = Positive.
    
    final result = await db.rawQuery('''
      SELECT customerId, customerName,
      SUM(CASE WHEN type = 'given' THEN amount ELSE 0 END) as totalGiven,
      SUM(CASE WHEN type = 'received' THEN amount ELSE 0 END) as totalReceived
      FROM khata
      GROUP BY customerId
    ''');

    _customers = result.map((row) {
      final given = (row['totalGiven'] as num?)?.toDouble() ?? 0.0;
      final received = (row['totalReceived'] as num?)?.toDouble() ?? 0.0;
      return {
        'customerId': row['customerId'],
        'customerName': row['customerName'],
        'netAmount': given - received, // + = You'll Get, - = You'll Give
      };
    }).toList();

    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _importContact() async {
    if (kIsWeb) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contact import is not supported on Web (Chrome debug).')));
      return;
    }

    if (!await Permission.contacts.request().isGranted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contacts permission required.')));
      return;
    }

    if (!mounted) return;
    
    // Using standard flutter_contacts instead of internal ContactNameService properties
    final contacts = await FlutterContacts.getContacts(withProperties: true);

    if (!mounted) return;
    final selected = await showDialog<Contact>(
      context: context,
      builder: (context) => ContactPickerDialog(contacts: contacts),
    );

    if (selected != null && selected.phones.isNotEmpty && mounted) {
      final rawPhone = selected.phones.first.number;
      // Standardize the phone number roughly
      final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
      final formattedPhone = cleanPhone.length == 10 ? '+91$cleanPhone' : '+91${cleanPhone.substring(cleanPhone.length - 10)}';

      Navigator.pushNamed(context, '/b2b/khata/detail', arguments: {
        'userId': widget.userId,
        'customerId': formattedPhone,
        'customerName': selected.displayName,
      }).then((_) => _loadCustomers()); // reload when coming back
    }
  }

  void _showAddCustomerOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(Icons.contacts_rounded, color: Colors.indigo),
                title: Text(lang.t('Import from Contacts')),
                onTap: () {
                  Navigator.pop(context);
                  _importContact();
                },
              ),
              ListTile(
                leading: const Icon(Icons.person_add_alt_1_rounded, color: Colors.indigo),
                title: Text(lang.t('Add Manually')),
                onTap: () {
                  Navigator.pop(context);
                  _addCustomerManually();
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      }
    );
  }

  void _addCustomerManually() {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(lang.t('Add Customer Manually')),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(labelText: lang.t('Customer Name')),
                textCapitalization: TextCapitalization.words,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneController,
                decoration: InputDecoration(labelText: lang.t('Phone Number'), prefixText: '+91 '),
                keyboardType: TextInputType.phone,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(lang.t('Cancel')),
            ),
            ElevatedButton(
              onPressed: () {
                final name = nameController.text.trim();
                final rawPhone = phoneController.text.trim();
                if (name.isEmpty || rawPhone.isEmpty) return;
                
                final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
                final formattedPhone = cleanPhone.length >= 10 ? '+91${cleanPhone.substring(cleanPhone.length - 10)}' : '+91$cleanPhone';
                
                Navigator.pop(context);
                Navigator.pushNamed(context, '/b2b/khata/detail', arguments: {
                  'userId': widget.userId,
                  'customerId': formattedPhone,
                  'customerName': name,
                }).then((_) => _loadCustomers());
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white),
              child: Text(lang.t('Add')),
            )
          ],
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            title: Text(lang.t('Digital Khata'), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
            backgroundColor: Colors.white,
            elevation: 1,
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
          body: _isLoading 
            ? const Center(child: CircularProgressIndicator()) 
            : Column(
                children: [
                  // Top Summary Box
                  Container(
                    color: Colors.grey[50],
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildSummaryNode(lang.t("You'll Give"), '₹${_totalJama.toStringAsFixed(0)}', Colors.red),
                        Container(height: 50, width: 1, color: Colors.grey[300]),
                        _buildSummaryNode(lang.t("You'll Get"), '₹${_totalUdhar.toStringAsFixed(0)}', Colors.green),
                      ],
                    ),
                  ),

                  // Customer List
                  Expanded(
                    child: _customers.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.menu_book_rounded, size: 80, color: Colors.grey),
                                const SizedBox(height: 16),
                                Text(lang.t('No customers yet.'), style: const TextStyle(color: Colors.grey, fontSize: 18)),
                                Text(lang.t('Add a customer to start tracking udhari.'), style: const TextStyle(color: Colors.grey)),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: _customers.length,
                            separatorBuilder: (context, index) => const Divider(height: 1),
                            itemBuilder: (context, index) {
                              final c = _customers[index];
                              final net = c['netAmount'] as double;
                              final isDueToYou = net > 0;
                              final isDueByYou = net < 0;

                              return ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: Colors.indigo.shade50,
                                  child: Text(c['customerName']?[0].toUpperCase() ?? '?', style: const TextStyle(color: Colors.indigo)),
                                ),
                                title: Text(c['customerName'], style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text(c['customerId']),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('₹${net.abs().toStringAsFixed(0)}', style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: isDueToYou ? Colors.green : (isDueByYou ? Colors.red : Colors.grey)
                                    )),
                                    Text(
                                      isDueToYou ? lang.t("You'll Get") : (isDueByYou ? lang.t("You'll Give") : lang.t('Settled')),
                                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600)
                                    ),
                                  ],
                                ),
                                onTap: () {
                                  Navigator.pushNamed(context, '/b2b/khata/detail', arguments: {
                                    'userId': widget.userId,
                                    'customerId': c['customerId'],
                                    'customerName': c['customerName'],
                                  }).then((_) => _loadCustomers());
                                },
                              );
                            },
                          ),
                  ),
                ],
              ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: _showAddCustomerOptions,
            backgroundColor: Colors.indigo,
            icon: const Icon(Icons.person_add_alt_1_rounded),
            label: Text(lang.t('Add Customer'), style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        );
      }
    );
  }

  Widget _buildSummaryNode(String title, String amount, Color color) {
    return Column(
      children: [
        Text(title, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.normal)),
        const SizedBox(height: 4),
        Text(amount, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 24)),
      ],
    );
  }
}
