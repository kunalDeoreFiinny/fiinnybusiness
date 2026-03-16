import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:provider/provider.dart';
import '../../services/balance_service.dart';
import 'package:uuid/uuid.dart';
import 'package:url_launcher/url_launcher.dart';

class B2BKhataDetailScreen extends StatefulWidget {
  final String userId;
  final String customerId; // phone number e.g +91...
  final String customerName;

  const B2BKhataDetailScreen({
    required this.userId,
    required this.customerId,
    required this.customerName,
    super.key,
  });

  @override
  State<B2BKhataDetailScreen> createState() => _B2BKhataDetailScreenState();
}

class _B2BKhataDetailScreenState extends State<B2BKhataDetailScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _entries = [];
  
  double _totalGiven = 0;
  double _totalReceived = 0;

  @override
  void initState() {
    super.initState();
    _loadEntries();
  }

  Future<void> _loadEntries() async {
    setState(() => _isLoading = true);
    final db = await LocalDatabaseHelper.instance.database;
    
    final result = await db.query(
      'khata',
      where: 'customerId = ?',
      whereArgs: [widget.customerId],
      orderBy: 'createdAt DESC',
    );

    double given = 0;
    double received = 0;
    List<Map<String, dynamic>> processedEntries = [];
    double currentBal = 0;
    for (var r in result.reversed) {
      final amt = (r['amount'] as num).toDouble();
      if (r['type'] == 'given') {
        given += amt;
        currentBal += amt;
      } else if (r['type'] == 'received') {
        received += amt;
        currentBal -= amt;
      }
      processedEntries.add({
        ...r,
        'runningBalance': currentBal,
      });
    }
    processedEntries = processedEntries.reversed.toList();

    if (mounted) {
      setState(() {
        _entries = processedEntries;
        _totalGiven = given;
        _totalReceived = received;
        _isLoading = false;
      });
    }
  }

  // Opens the custom transaction bottom sheet
  Future<void> _addEntry(String type, double netAmount) async {
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(0))),
      builder: (context) {
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.9, // 90% of screen height
          child: _TransactionBottomSheet(
            type: type, 
            customerName: widget.customerName,
            netAmount: netAmount,
            lang: lang,
          )
        );
      }
    );

    if (result == null) return;
    
    final double? amount = double.tryParse(result['amount']);
    if (amount == null || amount <= 0) return;

    // Save to DB
    final db = await LocalDatabaseHelper.instance.database;
    await db.insert('khata', {
      '_id': const Uuid().v4(),
      'customerId': widget.customerId,
      'customerName': widget.customerName,
      'amount': amount,
      'type': type,
      'note': result['note'] ?? '',
      'synced': 0,
      'createdAt': DateTime.now().toIso8601String(),
    });

    _loadEntries();
  }

  Widget _buildTransactionRow(bool isGiven, Map<String, dynamic> e, double amt, String timeStr, double runningBal) {
    return Align(
      alignment: isGiven ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isGiven ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            width: 180,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.grey.shade300, width: 1),
              borderRadius: BorderRadius.circular(8)
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(isGiven ? Icons.arrow_upward : Icons.arrow_downward, 
                             color: isGiven ? Colors.red : Colors.green, size: 16),
                        const SizedBox(width: 4),
                        Text('₹${amt.toStringAsFixed(0)}', 
                          style: TextStyle(
                            color: isGiven ? Colors.red : Colors.green, 
                            fontWeight: FontWeight.bold, 
                            fontSize: 16
                          )
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Text(timeStr, style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                        const SizedBox(width: 4),
                        const Icon(Icons.check, size: 12, color: Colors.grey),
                      ],
                    )
                  ],
                ),
                if (e['note'] != null && e['note'].toString().isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(e['note'], style: const TextStyle(fontSize: 13, color: Colors.black87)),
                ]
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text('₹${runningBal.toStringAsFixed(0)} Due', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Determine net balance
    final double netAmount = _totalGiven - _totalReceived;
    final bool isDueToYou = netAmount > 0;

    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,

          appBar: AppBar(
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
            elevation: 1,
            titleSpacing: 0,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.customerName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                Text(lang.t('View Profile'), style: const TextStyle(fontSize: 12, color: const Color(0xFF1C9E44))),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.phone_outlined, color: Colors.black54),
                onPressed: () async {
                  final uri = Uri.parse('tel:${widget.customerId}');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  }
                },
              ),
              IconButton(
                icon: const Icon(Icons.receipt_long_outlined, color: Colors.black54),
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    '/b2b/account-statement',
                    arguments: {
                      'userId': widget.userId,
                      'customerId': widget.customerId,
                      'customerName': widget.customerName,
                    },
                  );
                },
                tooltip: lang.t('Account Statement'),
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: Column(
            children: [
              // Unified Personal Balance Banner
              Consumer<BalanceResult?>(
                builder: (context, balanceResult, child) {
                  // Personal net uses caller's friendId, which is phone based.
                  // Negative perFriendNet means *you* owe them. Positive means *they* owe you.
                  final personalNet = balanceResult?.perFriendNet[widget.customerId] ?? 0.0;
                  if (personalNet == 0.0) return const SizedBox.shrink();

                  final owesYou = personalNet > 0;
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    color: owesYou ? Colors.orange.shade50 : Colors.blue.shade50,
                    child: Row(
                      children: [
                        Icon(Icons.link_rounded, color: owesYou ? Colors.orange : Colors.blue),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            owesYou 
                              ? "${lang.t('Note: This contact also owes you ₹')}${personalNet.toStringAsFixed(0)}${lang.t(' in your personal splits.')}"
                              : "${lang.t('Note: You owe this contact ₹')}${personalNet.abs().toStringAsFixed(0)}${lang.t(' in your personal splits.')}",
                            style: TextStyle(
                              color: owesYou ? Colors.orange.shade900 : Colors.blue.shade900,
                              fontSize: 12,
                              fontWeight: FontWeight.w500
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              // B2B Net Balance Box
              Container(
                color: Colors.grey[50],
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Column(
                  children: [
                    Text(
                      netAmount == 0 
                        ? lang.t('Settled Up') 
                        : (isDueToYou ? lang.t("You'll Get") : lang.t("You'll Give")),
                      style: const TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₹${netAmount.abs().toStringAsFixed(0)}',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: netAmount == 0 ? Colors.grey : (isDueToYou ? Colors.green : Colors.red)
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              
              // Timeline Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(lang.t('ENTRIES'), style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
                    Row(
                      children: [
                        Text(lang.t('GAVE'), style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(width: 32),
                        Text(lang.t('GOT'), style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    )
                  ],
                ),
              ),
              const Divider(height: 1),

              // Entries List
              Expanded(
                child: _isLoading 
                  ? const Center(child: CircularProgressIndicator())
                  : _entries.isEmpty
                      ? Center(child: Text(lang.t('No entries yet.\nTap below to add.'), textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)))
                      : ListView.builder(
                          itemCount: _entries.length,
                          itemBuilder: (context, index) {
                            final e = _entries[index];
                            final isGiven = e['type'] == 'given';
                            final amt = (e['amount'] as num).toDouble();
                            final runningBal = (e['runningBalance'] as num).toDouble().abs();
                            final date = DateTime.parse(e['createdAt']);
                            
                            bool showDateSeparator = false;
                            if (index == _entries.length - 1) {
                              showDateSeparator = true;
                            } else {
                              final nextDate = DateTime.parse(_entries[index + 1]['createdAt']);
                              if (date.year != nextDate.year || date.month != nextDate.month || date.day != nextDate.day) {
                                showDateSeparator = true;
                              }
                            }

                            String dateStr = '';
                            if (showDateSeparator) {
                              final now = DateTime.now();
                              if (date.year == now.year && date.month == now.month && date.day == now.day) {
                                dateStr = lang.t('Today');
                              } else {
                                dateStr = DateFormat('dd MMM yyyy').format(date);
                              }
                            }
                            
                            final timeStr = DateFormat('hi:mm a').format(date);
                            
                            return Column(
                              children: [
                                if (showDateSeparator) ...[
                                  const SizedBox(height: 16),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.blueGrey.shade200,
                                      borderRadius: BorderRadius.circular(16)
                                    ),
                                    child: Text(dateStr, style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold)),
                                  ),
                                  const SizedBox(height: 16),
                                ],
                                
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                                  child: _buildTransactionRow(isGiven, e, amt, timeStr, runningBal)
                                ),
                              ],
                            );
                          },
                        ),
              ),
              
              // Action Buttons Bottom Bar
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  border: Border(top: BorderSide(color: Colors.grey.shade200)),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Small ad banner above buttons
                        const AdsBannerCard(
                          placement: 'b2b_khata_detail_bottom',
                          inline: true,
                          inlineMaxHeight: 50,
                          margin: EdgeInsets.only(bottom: 8),
                          padding: EdgeInsets.zero,
                          backgroundColor: Colors.transparent,
                          boxShadow: [],
                          minHeight: 50,
                        ),
                        // Top row: Set Due Date | SMS | Remind
                        Row(
                          children: [
                            Icon(Icons.calendar_today_outlined, size: 20, color: Colors.grey.shade700),
                            const SizedBox(width: 8),
                            Text(lang.t('Set Due Date'), style: TextStyle(color: Colors.grey.shade800, fontWeight: FontWeight.bold)),
                            const Spacer(),
                            ElevatedButton.icon(
                              onPressed: () async {
                                final msg = lang.t('Your balance of ₹${netAmount.abs().toStringAsFixed(0)} is due. Please pay at the earliest.');
                                final uri = Uri.parse('sms:${widget.customerId}?body=${Uri.encodeComponent(msg)}');
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri);
                                }
                              },
                              icon: const Icon(Icons.sms_outlined, size: 16),
                              label: Text(lang.t('SMS')),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1C9E44), // OkCredit Green
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                padding: const EdgeInsets.symmetric(horizontal: 16)
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              onPressed: () async {
                                final msg = lang.t('Your balance of ₹${netAmount.abs().toStringAsFixed(0)} is due. Please pay at the earliest.');
                                String phoneStr = widget.customerId;
                                if (!phoneStr.startsWith('+')) phoneStr = '+91$phoneStr';
                                final uri = Uri.parse('whatsapp://send?phone=$phoneStr&text=${Uri.encodeComponent(msg)}');
                                if (await canLaunchUrl(uri)) {
                                  await launchUrl(uri);
                                }
                              },
                              icon: const Icon(Icons.message, size: 16),
                              label: Text(lang.t('Remind')),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1C9E44), // OkCredit Green
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                padding: const EdgeInsets.symmetric(horizontal: 16)
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // Net Balance Due Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(lang.t('Balance Due'), style: TextStyle(color: Colors.grey.shade600)),
                            Row(
                              children: [
                                Text(
                                  '₹${netAmount.abs().toStringAsFixed(0)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: netAmount == 0 ? Colors.grey : (isDueToYou ? Colors.green : Colors.red)
                                  )
                                ),
                                const SizedBox(width: 4),
                                Icon(Icons.chevron_right, size: 20, color: netAmount == 0 ? Colors.grey : (isDueToYou ? Colors.green : Colors.red)),
                              ],
                            )
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // Received / Given Row
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _addEntry('received', netAmount),
                                icon: const Icon(Icons.arrow_downward_rounded, size: 18),
                                label: Text(lang.t('Received'), style: const TextStyle(fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: Colors.green.shade700,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: Colors.green.shade100))
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _addEntry('given', netAmount),
                                icon: const Icon(Icons.arrow_upward_rounded, size: 18),
                                label: Text(lang.t('Given'), style: const TextStyle(fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.white,
                                  foregroundColor: Colors.red.shade700,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: Colors.red.shade100))
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
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

class _TransactionBottomSheet extends StatefulWidget {
  final String type;
  final String customerName;
  final double netAmount;
  final B2BLanguageService lang;

  const _TransactionBottomSheet({
    required this.type,
    required this.customerName,
    required this.netAmount,
    required this.lang,
  });

  @override
  State<_TransactionBottomSheet> createState() => _TransactionBottomSheetState();
}

class _TransactionBottomSheetState extends State<_TransactionBottomSheet> {
  String _amount = "0";
  String _notes = "";

  void _onKeyTap(String key) {
    setState(() {
      if (key == 'backspace') {
        if (_amount.length > 1) {
          _amount = _amount.substring(0, _amount.length - 1);
        } else {
          _amount = "0";
        }
      } else if (key == '.') {
        if (!_amount.contains('.')) _amount += '.';
      } else {
        if (_amount == "0") {
          _amount = key;
        } else if (_amount.length < 10) {
          _amount += key;
        }
      }
    });
  }

  Widget _keyBtn(String text, {VoidCallback? onTap, Color? color, Widget? icon}) {
    return Expanded(
      child: InkWell(
        onTap: onTap ?? () => _onKeyTap(text),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          margin: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: color ?? Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: icon ?? Text(text, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Top Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Row(
            children: [
              IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
              const SizedBox(width: 8),
              CircleAvatar(
                backgroundColor: Colors.blue.shade400,
                radius: 18,
                child: Text(widget.customerName[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  if (widget.netAmount != 0)
                    Text("₹${widget.netAmount.abs().toStringAsFixed(0)} Due", style: const TextStyle(color: Colors.deepOrange, fontSize: 12)),
                ],
              )
            ],
          ),
        ),
        const Divider(height: 1),
        
        // Amount Display
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 24.0),
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFF1C9E44), width: 2))
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("₹ ", style: TextStyle(fontSize: 24, color: Color(0xFF1C9E44), fontWeight: FontWeight.w500)),
                  Text(
                    _amount, 
                    style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.black87)
                  ),
                ],
              ),
            ),
          ),
        ),
        
        // Add Notes / Date / Bills
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              TextField(
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.description_outlined, color: Colors.blueGrey),
                  hintText: widget.lang.t('Add Notes'),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  fillColor: Colors.grey.shade50,
                  filled: true,
                ),
                onChanged: (v) => _notes = v,
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: const Icon(Icons.calendar_today_outlined, color: Colors.blueGrey),
                  title: Text(widget.lang.t('Bill Date'), style: const TextStyle(fontSize: 14, color: Colors.blueGrey)),
                  subtitle: Text(widget.lang.t('Today'), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () {},
                ),
              ),
              const SizedBox(height: 12),
              Container(
                decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: const Icon(Icons.camera, color: Colors.blueGrey),
                  title: Text(widget.lang.t('Add Bills'), style: const TextStyle(color: Colors.blueGrey)),
                  trailing: const Icon(Icons.add, color: Color(0xFF1C9E44)),
                  onTap: () {},
                ),
              ),
            ],
          ),
        ),
        
        const Spacer(),
        
        // Custom Keypad
        Container(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 24),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context, {'amount': _amount, 'note': _notes});
                    },
                    icon: const Icon(Icons.check),
                    label: Text(widget.lang.t('Confirm'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1C9E44), // OkCredit Green
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24))
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 60,
                  child: Row(
                    children: [
                      _keyBtn('1'), _keyBtn('2'), _keyBtn('3'),
                      _keyBtn('backspace', color: Colors.red.shade50, icon: const Icon(Icons.backspace_outlined, color: Colors.redAccent), onTap: () => _onKeyTap('backspace')),
                    ],
                  ),
                ),
                SizedBox(
                  height: 60,
                  child: Row(
                    children: [
                      _keyBtn('4'), _keyBtn('5'), _keyBtn('6'),
                      _keyBtn('X', color: Colors.green.shade50, icon: const Icon(Icons.close, color: Colors.black87)),
                    ],
                  ),
                ),
                SizedBox(
                  height: 60,
                  child: Row(
                    children: [
                      _keyBtn('7'), _keyBtn('8'), _keyBtn('9'),
                      _keyBtn('-', color: Colors.green.shade50, icon: const Icon(Icons.remove, color: Colors.black87)),
                    ],
                  ),
                ),
                SizedBox(
                  height: 60,
                  child: Row(
                    children: [
                      _keyBtn('.'), _keyBtn('0'),
                      _keyBtn('=', color: Colors.green.shade50, icon: const Text('=', style: TextStyle(fontSize: 28, color: Colors.black87))),
                      _keyBtn('+', color: Colors.green.shade50, icon: const Icon(Icons.add, color: Colors.black87)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        )
      ],
    );
  }
}
