import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import 'package:provider/provider.dart';
import '../../services/balance_service.dart';
import 'package:uuid/uuid.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

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
    for (var r in result) {
      final amt = (r['amount'] as num).toDouble();
      if (r['type'] == 'given') given += amt;
      if (r['type'] == 'received') received += amt;
    }

    if (mounted) {
      setState(() {
        _entries = result;
        _totalGiven = given;
        _totalReceived = received;
        _isLoading = false;
      });
    }
  }

  Future<void> _addEntry(String type) async {
    final amtController = TextEditingController();
    final noteController = TextEditingController();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 24, right: 24, top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                type == 'given' ? lang.t("You Gave ₹") : lang.t("You Got ₹"),
                style: TextStyle(
                  fontSize: 20, 
                  fontWeight: FontWeight.bold,
                  color: type == 'given' ? Colors.red : Colors.green
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: amtController,
                keyboardType: TextInputType.number,
                autofocus: true,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                decoration: const InputDecoration(
                  prefixText: '₹ ',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: noteController,
                decoration: InputDecoration(
                  labelText: lang.t('Enter Details (Bill No, Items, etc)'),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: type == 'given' ? Colors.red : Colors.green,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(lang.t('Save'), style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      }
    );

    // If dismissed without saving, do nothing.
    final amtText = amtController.text.replaceAll(',', '');
    final double? amount = double.tryParse(amtText);
    if (amount == null || amount <= 0) return;

    // Save to DB
    final db = await LocalDatabaseHelper.instance.database;
    await db.insert('khata', {
      '_id': const Uuid().v4(),
      'customerId': widget.customerId,
      'customerName': widget.customerName,
      'amount': amount,
      'type': type,
      'note': noteController.text.trim(),
      'synced': 0,
      'createdAt': DateTime.now().toIso8601String(),
    });

    _loadEntries();
  }

  Future<void> _sharePDF() async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text('Udhari Report', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 12),
              pw.Text('Customer: ${widget.customerName}'),
              pw.Text('Phone: ${widget.customerId}'),
              pw.SizedBox(height: 24),
              pw.TableHelper.fromTextArray(
                headers: ['Date', 'Details', 'Given (Rs)', 'Received (Rs)'],
                data: _entries.map((e) {
                  final date = DateFormat('dd MMM yyyy').format(DateTime.parse(e['createdAt']));
                  final isGiven = e['type'] == 'given';
                  final amtStr = '${e['amount']}';
                  return [
                    date,
                    e['note'] ?? '-',
                    isGiven ? amtStr : '',
                    !isGiven ? amtStr : '',
                  ];
                }).toList(),
              ),
              pw.SizedBox(height: 24),
              pw.Divider(),
              pw.SizedBox(height: 12),
              pw.Text('Total Given: Rs ${_totalGiven.toStringAsFixed(0)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Text('Total Received: Rs ${_totalReceived.toStringAsFixed(0)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 8),
              pw.Text('Net Balance: Rs ${(_totalGiven - _totalReceived).abs().toStringAsFixed(0)} ' + 
                  ((_totalGiven - _totalReceived) > 0 ? '(Due to You)' : '(Advance)'), 
                  style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            ],
          );
        },
      ),
    );

    final bytes = await pdf.save();
    
    // Check if on Web or Mobile
    if (kIsWeb) {
      if (mounted) ScaffoldMessenger.of(this.context).showSnackBar(const SnackBar(content: Text('PDF Sharing not fully supported on Web.')));
    } else {
      // Use printing to share
      await Printing.sharePdf(bytes: bytes, filename: 'Udhari_${widget.customerName.replaceAll(" ", "_")}.pdf');
    }
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
            backgroundColor: Colors.indigo,
            foregroundColor: Colors.white,
            title: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white24,
                  radius: 16,
                  child: Text(widget.customerName[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 14)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.customerName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      Text(widget.customerId, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_rounded),
                onPressed: _sharePDF,
                tooltip: lang.t('Share Udhari Details'),
              ),
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
                      : ListView.separated(
                          itemCount: _entries.length,
                          separatorBuilder: (context, index) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final e = _entries[index];
                            final isGiven = e['type'] == 'given';
                            final amt = (e['amount'] as num).toDouble();
                            final date = DateTime.parse(e['createdAt']);
                            
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(DateFormat('dd MMM yyyy, hh:mm a').format(date), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                        if (e['note'] != null && e['note'].toString().isNotEmpty)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 4.0),
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(4)),
                                              child: Text(e['note'], style: const TextStyle(fontSize: 12)),
                                            ),
                                          )
                                      ],
                                    ),
                                  ),
                                  SizedBox(
                                    width: 80,
                                    child: isGiven 
                                      ? Text('₹${amt.toStringAsFixed(0)}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold), textAlign: TextAlign.right)
                                      : null,
                                  ),
                                  SizedBox(
                                    width: 60,
                                    child: !isGiven 
                                      ? Text('₹${amt.toStringAsFixed(0)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold), textAlign: TextAlign.right)
                                      : null,
                                  )
                                ],
                              ),
                            );
                          },
                        ),
              ),
              
              // Action Buttons
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _addEntry('given'),
                          icon: const Icon(Icons.arrow_upward_rounded, size: 18),
                          label: Text(lang.t('GAVE ₹'), style: const TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade50,
                            foregroundColor: Colors.red.shade700,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.red.shade100))
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _addEntry('received'),
                          icon: const Icon(Icons.arrow_downward_rounded, size: 18),
                          label: Text(lang.t('GOT ₹'), style: const TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green.shade50,
                            foregroundColor: Colors.green.shade700,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.green.shade100))
                          ),
                        ),
                      ),
                    ],
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
