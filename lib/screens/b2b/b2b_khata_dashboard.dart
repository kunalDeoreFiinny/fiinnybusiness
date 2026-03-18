import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sqflite/sqflite.dart';
import '../../widgets/notification_permission_modal.dart';
import 'package:shared_preferences/shared_preferences.dart';

class B2BKhataDashboardScreen extends StatefulWidget {
  final String userId;
  const B2BKhataDashboardScreen({required this.userId, super.key});

  @override
  State<B2BKhataDashboardScreen> createState() => _B2BKhataDashboardScreenState();
}

class _B2BKhataDashboardScreenState extends State<B2BKhataDashboardScreen> with SingleTickerProviderStateMixin {
  final B2BLanguageService lang = B2BLanguageService();
  
  List<Map<String, dynamic>> _customers = [];
  List<Map<String, dynamic>> _suppliers = [];
  bool _isLoading = true;
  String? _errorMessage; // shows retry if DB fails
  late TabController _tabController;
  int _sortBy = 0; // 0 = Latest, 1 = Amount Due, 2 = Name

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
    _loadData();
    _showNotificationPromptIfNeeded();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showNotificationPromptIfNeeded() async {
    final prefs = await SharedPreferences.getInstance();
    final hasAsked = prefs.getBool('has_asked_b2b_notifications_${widget.userId}') ?? false;
    
    if (hasAsked) return;

    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    
    // Defer to next frame to avoid _debugLocked assertion during initial build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => NotificationPermissionModal(
          onSkip: () async {
            await prefs.setBool('has_asked_b2b_notifications_${widget.userId}', true);
            if (context.mounted) Navigator.pop(context);
          },
          onYes: () async {
            await prefs.setBool('has_asked_b2b_notifications_${widget.userId}', true);
            // Request actual permission here if desired
            if (!kIsWeb) {
               await Permission.notification.request();
            }
            if (context.mounted) Navigator.pop(context);
          },
        ),
      );
    });
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final db = await LocalDatabaseHelper.instance.database;

      // Ensure b2b_contacts table exists (in case migration v4 didn't run)
      await db.execute('''
        CREATE TABLE IF NOT EXISTS b2b_contacts (
          contactId TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          type TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      ''');

      // Ensure khata table exists
      await db.execute('''
        CREATE TABLE IF NOT EXISTS khata (
          _id TEXT PRIMARY KEY,
          customerId TEXT NOT NULL,
          customerName TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          note TEXT,
          synced INTEGER NOT NULL,
          createdAt TEXT NOT NULL
        )
      ''');

      // Get contacts and join with khata for their balances
      final result = await db.rawQuery('''
        SELECT c.contactId as customerId, c.name as customerName, c.type as roleType,
          IFNULL(SUM(CASE WHEN k.type = 'given' THEN k.amount ELSE 0 END), 0) as totalGiven,
          IFNULL(SUM(CASE WHEN k.type = 'received' THEN k.amount ELSE 0 END), 0) as totalReceived
        FROM b2b_contacts c
        LEFT JOIN khata k ON c.contactId = k.customerId
        GROUP BY c.contactId
      ''');

      final List<Map<String, dynamic>> customersToSet = [];
      final List<Map<String, dynamic>> suppliersToSet = [];

      for (var row in result) {
        final given = (row['totalGiven'] as num?)?.toDouble() ?? 0.0;
        final received = (row['totalReceived'] as num?)?.toDouble() ?? 0.0;
        final netAmount = given - received;

        final entry = {
          'customerId': row['customerId'],
          'customerName': row['customerName'],
          'netAmount': netAmount,
        };

        if (row['roleType'] == 'CUSTOMER') {
          customersToSet.add(entry);
        } else if (row['roleType'] == 'SUPPLIER') {
          suppliersToSet.add(entry);
        }
      }

      if (_sortBy == 1) {
        customersToSet.sort((a, b) => (b['netAmount'] as double).abs().compareTo((a['netAmount'] as double).abs()));
        suppliersToSet.sort((a, b) => (b['netAmount'] as double).abs().compareTo((a['netAmount'] as double).abs()));
      } else if (_sortBy == 2) {
        customersToSet.sort((a, b) => (a['customerName'] as String).compareTo(b['customerName'] as String));
        suppliersToSet.sort((a, b) => (a['customerName'] as String).compareTo(b['customerName'] as String));
      }

      if (mounted) {
        setState(() {
          _customers = customersToSet;
          _suppliers = suppliersToSet;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[KhataDashboard] _loadData error: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Could not load data. Tap to retry.';
        });
      }
    }
  }

  Future<void> _saveContactToDb(String phone, String name, String type) async {
      final db = await LocalDatabaseHelper.instance.database;
      await db.insert(
        'b2b_contacts',
        {
          'contactId': phone,
          'name': name,
          'phone': phone,
          'type': type,
          'createdAt': DateTime.now().toIso8601String()
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
  }

  Future<void> _navigateToAddScreen(bool isCustomer) async {
    final result = await Navigator.pushNamed(context, '/b2b/add_customer', arguments: {
      'userId': widget.userId,
      'isCustomer': isCustomer,
    });
    debugPrint('[DEBUG] _navigateToAddScreen result: $result');

    if (result != null && result is Map<String, dynamic> && mounted) {
      final name = result['name'] as String;
      final phone = result['phone'] as String;
      final isCust = result['isCustomer'] as bool;
      
      await _saveContactToDb(phone, name, isCust ? 'CUSTOMER' : 'SUPPLIER');

      if (!mounted) return;
      // Navigate to detail screen right away for this new contact
      Navigator.pushNamed(context, '/b2b/khata/detail', arguments: {
        'userId': widget.userId,
        'customerId': phone,
        'customerName': name,
      }).then((_) => _loadData());
    }
  }

  void _shareApp() {
    // ignore: deprecated_member_use
    Share.share('Check out Fiinny! Start your digital ledger natively today.\n\n🌐 Website: https://fiinny.com/\n📱 Android: https://play.google.com/store/apps/details?id=com.KaranArjunTechnologies.lifemap\n🍎 iOS: https://apps.apple.com/in/app/fiinny-expense-split-money/id6751309482');
  }

  void _showMoreBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20))
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Wrap(
              children: [
                _moreMenuItem(
                  icon: Icons.account_balance_wallet_outlined,
                  label: lang.t('Account'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/b2b/account', arguments: {'userId': widget.userId});
                  }
                ),
                _moreMenuItem(
                  icon: Icons.insights_rounded,
                  label: lang.t('Analytics'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/b2b/analytics', arguments: {'userId': widget.userId});
                  }
                ),
                _moreMenuItem(
                  icon: Icons.person_outline,
                  label: lang.t('Profile'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/b2b/profile', arguments: {'userId': widget.userId});
                  }
                ),
                _moreMenuItem(
                  icon: Icons.help_outline,
                  label: lang.t('Help'),
                  onTap: () => Navigator.pop(context)
                ),
                _moreMenuItem(
                  icon: Icons.settings_outlined,
                  label: lang.t('Settings'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/b2b/settings', arguments: {'userId': widget.userId});
                  }
                ),
                _moreMenuItem(
                  icon: Icons.devices,
                  label: lang.t('Multi Devices'),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/b2b/multi-devices', arguments: {'userId': widget.userId});
                  }
                ),
              ],
            ),
          ),
        );
      }
    );
  }

  Widget _moreMenuItem({required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: MediaQuery.of(context).size.width / 4, // 4 items per row roughly
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey.shade200)
              ),
              child: Icon(icon, color: Colors.blueGrey.shade700),
            ),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.black87), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }

  void _showSortByBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20))
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 20, 16, 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          lang.t('Sort By'),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, thickness: 1),
                  _buildSortOption(setModalState, lang.t('Latest'), 0),
                  _buildSortOption(setModalState, lang.t('Amount Due'), 1),
                  _buildSortOption(setModalState, lang.t('Name'), 2),
                  const SizedBox(height: 16),
                  const Divider(height: 1, thickness: 1),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              setModalState(() => _sortBy = 0);
                              setState(() => _sortBy = 0);
                              _loadData();
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green.shade100, // Matching clear button
                              foregroundColor: Colors.green.shade900,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                            ),
                            child: Text(lang.t('Clear'), style: const TextStyle(fontSize: 16)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              _loadData();
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1C9E44), // OkCredit Green
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                            ),
                            child: Text(lang.t('Apply'), style: const TextStyle(fontSize: 16)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }
        );
      }
    );
  }

  Widget _buildSortOption(StateSetter setModalState, String title, int value) {
    return ListTile(
      title: Text(title, style: const TextStyle(fontSize: 16, color: Colors.black87)),
      trailing: Container(
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: _sortBy == value ? const Color(0xFF1C9E44) : Colors.grey.shade400,
            width: 2,
          ),
        ),
        child: CircleAvatar(
          radius: 6,
          backgroundColor: _sortBy == value ? const Color(0xFF1C9E44) : Colors.transparent,
        ),
      ),
      onTap: () {
        setModalState(() {
          _sortBy = value;
        });
        setState(() {
          _sortBy = value;
        });
      },
    );
  }

  Widget _buildEmptyState({
    required String title,
    required String imageAsset,
    required String buttonText,
    required VoidCallback onAdd,
  }) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(16)
            ),
            child: Icon(Icons.people_alt_outlined, size: 80, color: Colors.green.shade300),
          ),
          const SizedBox(height: 24),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.person_add_alt_1_outlined),
              label: Text(buttonText),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green.shade100,
                foregroundColor: Colors.green.shade900,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)
              ),
            ),
          )
        ],
      ),
    );
  }

  void _showProfileBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20))
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Colors.brown.shade300,
                      radius: 24,
                      child: const Text('K', style: TextStyle(color: Colors.white, fontSize: 20)),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('KaranArjun KSK', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Text(widget.userId, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)), // Using userId as phone fallback
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/b2b/profile', arguments: {'userId': widget.userId});
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey.shade300)
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.edit_outlined, size: 16, color: Colors.grey.shade700),
                          const SizedBox(width: 8),
                          Text(lang.t('Edit Profile'), style: TextStyle(color: Colors.grey.shade800, fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const Divider(height: 1, thickness: 1),
              ListTile(
                leading: const Icon(Icons.add, color: Colors.black87),
                title: Text(lang.t('Create New Business'), style: const TextStyle(fontSize: 16, color: Colors.black87)),
                onTap: () {
                  Navigator.pop(context);
                  // ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('Coming Soon'))));
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      }
    );
  }

  Widget _buildList(List<Map<String, dynamic>> items, bool isCustomer) {
    if (items.isEmpty) {
      if (isCustomer) {
        return _buildEmptyState(
          title: lang.t('Start your digital ledger by adding a customer'),
          imageAsset: 'assets/illustrations/customer_empty.png', // fallback to icon
          buttonText: lang.t('Add Customer'),
          onAdd: () => _navigateToAddScreen(true),
        );
      } else {
        return _buildEmptyState(
          title: lang.t('Add all your supplier here and save time by easily recording sale/ purchase done with them.'),
          imageAsset: 'assets/illustrations/supplier_empty.png', // fallback to icon
          buttonText: lang.t('Add Supplier'),
          onAdd: () => _navigateToAddScreen(false),
        );
      }
    }

    return ListView.separated(
      itemCount: items.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final c = items[index];
        final net = c['netAmount'] as double;
        final isDueToYou = net > 0;
        final isDueByYou = net < 0;

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.blue.shade50,
            child: Text(c['customerName']?[0].toUpperCase() ?? '?', style: TextStyle(color: Colors.blue.shade800)),
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
            }).then((_) => _loadData());
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            child: Column(
              children: [
                // Custom Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: () => _showProfileBottomSheet(),
                        child: CircleAvatar(
                          backgroundColor: Colors.brown.shade300,
                          radius: 20,
                          child: const Icon(Icons.person, color: Colors.white),
                        ),
                      ),
                      InkWell(
                        onTap: _shareApp,
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(20)
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.share, size: 16, color: Colors.black87),
                              const SizedBox(width: 4),
                              Text(lang.t('Share'), style: const TextStyle(fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                      )
                    ],
                  ),
                ),
                // Banner
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blueGrey.shade100,
                      borderRadius: BorderRadius.circular(12)
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.green.shade700,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.workspace_premium, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            lang.t('Enjoy your free trial!\nAd Free, Unlimited usage & more...'),
                            style: TextStyle(color: Colors.blueGrey.shade900, fontWeight: FontWeight.w500),
                          ),
                        )
                      ],
                    ),
                  ),
                ),
                // Tabs and Actions
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.grey.shade300)
                          ),
                          child: TabBar(
                            controller: _tabController,
                            indicator: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            labelColor: Colors.green.shade800,
                            unselectedLabelColor: Colors.grey.shade600,
                            indicatorSize: TabBarIndicatorSize.tab,
                            dividerColor: Colors.transparent,
                            tabs: [
                              Tab(text: lang.t('Customer')),
                              Tab(text: lang.t('Supplier')),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      GestureDetector(
                        onTap: () => _showSortByBottomSheet(),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.filter_list, color: Colors.grey.shade700),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          Navigator.pushNamed(context, '/b2b/search', arguments: {'userId': widget.userId});
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.search, color: Colors.grey.shade700),
                        ),
                      )
                    ],
                  ),
                ),
                // Tab Views
                Expanded(
                  child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _errorMessage != null
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.cloud_off_rounded, size: 56, color: Colors.grey.shade300),
                                const SizedBox(height: 16),
                                Text(
                                  _errorMessage!,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                                ),
                                const SizedBox(height: 20),
                                ElevatedButton.icon(
                                  onPressed: _loadData,
                                  icon: const Icon(Icons.refresh_rounded),
                                  label: const Text('Retry'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green.shade700,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : TabBarView(
                          controller: _tabController,
                          children: [
                            _buildList(_customers, true),
                            _buildList(_suppliers, false),
                          ],
                        ),
                ),
              ],
            ),
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () async {
              final result = await Navigator.pushNamed(context, '/b2b/add_customer', arguments: {
                'userId': widget.userId,
                'isCustomer': _tabController.index == 0,
              });
              if (result is Map<String, dynamic>) {
                final isCustomer = result['isCustomer'] == true;
                await _saveContactToDb(result['phone'], result['name'], isCustomer ? 'CUSTOMER' : 'SUPPLIER');
                _loadData();
              }
            },
            backgroundColor: Colors.green.shade700,
            icon: const Icon(Icons.person_add_alt_1_rounded, color: Colors.white),
            label: Text(
              _tabController.index == 0 ? lang.t('ADD CUSTOMER') : lang.t('ADD SUPPLIER'),
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 0.5)
            ),
          ),
          floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
          bottomNavigationBar: BottomNavigationBar(
            selectedItemColor: Colors.green.shade700,
            unselectedItemColor: Colors.grey.shade600,
            showUnselectedLabels: true,
            currentIndex: 0,
            type: BottomNavigationBarType.fixed,
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.menu_book),
                label: lang.t('Ledger'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.settings),
                label: lang.t('My Plan'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.keyboard_arrow_up),
                label: lang.t('More'),
              ),
            ],
            onTap: (index) {
              if (index == 2) {
                _showMoreBottomSheet();
              }
            },
          ),
        );
      }
    );
  }
}
