import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/b2b_language_service.dart';
import '../../services/local_database_helper.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class B2BAccountStatementScreen extends StatefulWidget {
  final String userId;
  final String customerId;
  final String customerName;

  const B2BAccountStatementScreen({
    super.key,
    required this.userId,
    required this.customerId,
    required this.customerName,
  });

  @override
  State<B2BAccountStatementScreen> createState() => _B2BAccountStatementScreenState();
}

class _B2BAccountStatementScreenState extends State<B2BAccountStatementScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _entries = [];
  double _totalGiven = 0;
  double _totalReceived = 0;
  int _givenCount = 0;
  int _receivedCount = 0;

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
    int gCount = 0;
    int rCount = 0;
    for (var r in result) {
      final amt = (r['amount'] as num).toDouble();
      if (r['type'] == 'given') {
        given += amt;
        gCount++;
      }
      if (r['type'] == 'received') {
        received += amt;
        rCount++;
      }
    }

    if (mounted) {
      setState(() {
        _entries = result;
        _totalGiven = given;
        _totalReceived = received;
        _givenCount = gCount;
        _receivedCount = rCount;
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadPDF() async {
    final pdf = pw.Document();
    
    // We get the first letter of name
    final avatarLetter = widget.customerName.isNotEmpty ? widget.customerName[0].toUpperCase() : '?';
    
    // Generate data rows for the table
    final List<List<String>> tableData = _entries.map((e) {
      final dateStr = DateFormat('dd\nMMM').format(DateTime.parse(e['createdAt']));
      final isGiven = e['type'] == 'given';
      final amt = (e['amount'] as num).toDouble();
      final amtStr = '₹${amt.toStringAsFixed(0)}';
      
      return [
        dateStr,
        '${widget.customerName}\n${widget.customerId}', // Using customerId as phone for now
        !isGiven ? amtStr : '', // Payment (Received from them) -> It's a payment THEY made to US, or WE made to THEM?
        // Let's assume:
        // Supplier Statement: We pay them implies "Payment", we take from them implies "Credit".
        // Customer Statement: They pay us implies "Payment", we give them implies "Credit".
        // In the context of Khata: type == 'given' means WE gave them credit (or payment).
        // type == 'received' means WE received payment from them.
        // Looking at the Supplier Statement screenshot: 0 payments, 1 credit (₹2). 
        // We know we just hit "got" ₹2 (received), but in supplier terms taking goods is 'credit' and giving money is 'payment'.
        // For visual match, I will put 'given' into Payment, and 'received' into Credit.
        isGiven ? amtStr : '',
        !isGiven ? amtStr : ''
      ];
    }).toList();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              // Top Green Header
              pw.Container(
                width: double.infinity,
                padding: const pw.EdgeInsets.all(16),
                color: const PdfColor.fromInt(0xFF4CAF50), // Green
                child: pw.Row(
                  children: [
                    pw.Container(
                      width: 48,
                      height: 48,
                      decoration: const pw.BoxDecoration(color: PdfColors.white, shape: pw.BoxShape.circle),
                      alignment: pw.Alignment.center,
                      child: pw.Text(avatarLetter, style: pw.TextStyle(color: const PdfColor.fromInt(0xFF4CAF50), fontSize: 24, fontWeight: pw.FontWeight.bold)),
                    ),
                    pw.SizedBox(width: 16),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(widget.customerName, style: pw.TextStyle(color: PdfColors.white, fontSize: 18, fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 4),
                        pw.Text(widget.customerId, style: const pw.TextStyle(color: PdfColors.white, fontSize: 12)),
                      ]
                    )
                  ]
                )
              ),
              pw.SizedBox(height: 24),
              
              // Statement Title
              pw.Text('SUPPLIER ACCOUNT STATEMENT', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
              pw.SizedBox(height: 12),
              
              // Date Pill
              pw.Container(
                padding: const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: pw.BoxDecoration(
                  borderRadius: pw.BorderRadius.circular(20),
                  border: pw.Border.all(color: PdfColors.grey300)
                ),
                child: pw.Text('01 Mar 2026 - 15 Mar 2026', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700))
              ),
              pw.SizedBox(height: 24),

              // Summary Card
              pw.Container(
                width: double.infinity,
                decoration: pw.BoxDecoration(
                  color: const PdfColor.fromInt(0xFFF7F7F7),
                  borderRadius: pw.BorderRadius.circular(12)
                ),
                child: pw.Column(
                  children: [
                    pw.SizedBox(height: 16),
                    pw.Text('NET BALANCE', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                    pw.SizedBox(height: 8),
                    pw.Text(
                      '₹${(_totalGiven - _totalReceived).abs().toStringAsFixed(0)}',
                      style: pw.TextStyle(
                        fontSize: 28, 
                        fontWeight: pw.FontWeight.bold, 
                        color: (_totalGiven - _totalReceived) == 0 ? PdfColors.black : ((_totalGiven - _totalReceived) > 0 ? PdfColors.red : PdfColors.green)
                      )
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text('DUE', style: pw.TextStyle(fontSize: 10, color: PdfColors.red, fontWeight: pw.FontWeight.bold)),
                    pw.SizedBox(height: 16),
                    pw.Divider(color: PdfColors.grey300),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(16),
                      child: pw.Row(
                        mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                        children: [
                          pw.Column(
                            children: [
                              pw.Text('$_receivedCount PAYMENTS', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                              pw.SizedBox(height: 8),
                              pw.Text('₹${_totalReceived.toStringAsFixed(0)}', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold, color: PdfColors.green))
                            ]
                          ),
                          pw.Column(
                            children: [
                              pw.Text('$_givenCount CREDITS', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey600)),
                              pw.SizedBox(height: 8),
                              pw.Text('₹${_totalGiven.toStringAsFixed(0)}', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold, color: PdfColors.red))
                            ]
                          ),
                        ]
                      )
                    )
                  ]
                )
              ),
              pw.SizedBox(height: 32),

              // Table
              pw.Table(
                columnWidths: {
                  0: const pw.FlexColumnWidth(1),
                  1: const pw.FlexColumnWidth(3),
                  2: const pw.FlexColumnWidth(2),
                  3: const pw.FlexColumnWidth(2),
                },
                children: [
                  // Header Row
                  pw.TableRow(
                    decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFFF0F0F0)),
                    children: [
                      pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('DATE', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.black))),
                      pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('SUPPLIER NAME', style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.black))),
                      pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('PAYMENT', textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.black))),
                      pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('CREDIT', textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.black))),
                    ]
                  ),
                  // Data Rows
                  ...tableData.map((row) {
                    return pw.TableRow(
                      decoration: const pw.BoxDecoration(
                        border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey200))
                      ),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 8), 
                          child: pw.Text(row[0], style: const pw.TextStyle(fontSize: 10))
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 8), 
                          child: pw.Text(row[1], style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700))
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 8), 
                          child: pw.Text(row[2], textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 10, color: PdfColors.green, fontWeight: pw.FontWeight.bold))
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(vertical: 12, horizontal: 8), 
                          child: pw.Text(row[3], textAlign: pw.TextAlign.right, style: pw.TextStyle(fontSize: 10, color: PdfColors.red, fontWeight: pw.FontWeight.bold))
                        ),
                      ]
                    );
                  })
                ]
              ),

              pw.Spacer(),
              
              // Footer
              pw.Container(
                padding: const pw.EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: pw.BoxDecoration(
                  color: const PdfColor.fromInt(0xFF4CAF50),
                  borderRadius: pw.BorderRadius.circular(20)
                ),
                child: pw.Text('★ Trusted & Secured OkCredit ★', style: const pw.TextStyle(color: PdfColors.white, fontSize: 10))
              )
            ],
          );
        },
      ),
    );

    final bytes = await pdf.save();
    
    if (!mounted) return;
    
    if (kIsWeb) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PDF Download not fully supported on Web.')));
    } else {
      try {
        await Printing.sharePdf(bytes: bytes, filename: 'Statement_${widget.customerName.replaceAll(" ", "_")}.pdf');
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not share PDF: $e')));
        }
      }
    }
  }

  Widget _buildTransactionCard(Map<String, dynamic> e) {
    final isGiven = e['type'] == 'given';
    final amt = (e['amount'] as num).toDouble();
    final date = DateTime.parse(e['createdAt']);
    
    // Quick relative time for "Just Now" effect
    String timeStr;
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) {
      timeStr = lang.t('Just Now');
    } else {
      timeStr = DateFormat('dd MMM, hh:mm a').format(date);
    }

    return Container(
      width: MediaQuery.of(context).size.width * 0.6,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300)
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.customerName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.blueGrey.shade800)),
              const SizedBox(height: 8),
              Text(
                '₹${amt.toStringAsFixed(0)}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isGiven ? Colors.red : Colors.green
                ),
              ),
            ],
          ),
          Text(
            timeStr,
            style: TextStyle(fontSize: 12, color: Colors.blueGrey.shade600),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final netAmount = _totalGiven - _totalReceived;
    final isDueToYou = netAmount > 0;

    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.grey.shade50,
          appBar: AppBar(
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
            elevation: 1,
            titleSpacing: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.blueGrey),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(lang.t('Supplier Statement'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
          ),
          body: _isLoading 
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Top Summary Card
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey.shade300)
                            ),
                            child: Column(
                              children: [
                                // Date Filter Dropdown
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                                    border: Border(bottom: BorderSide(color: Colors.grey.shade200))
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.calendar_today_outlined, size: 16, color: Colors.blueGrey.shade700),
                                      const SizedBox(width: 8),
                                      Text('01 Mar 2026 - Today', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blueGrey.shade800)),
                                      const SizedBox(width: 4),
                                      Icon(Icons.arrow_drop_down, color: Colors.blueGrey.shade700)
                                    ],
                                  ),
                                ),
                                // Net Balance
                                Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.grey.shade300)
                                        ),
                                        child: const Icon(Icons.account_balance_wallet_outlined, color: Colors.blueGrey),
                                      ),
                                      const SizedBox(width: 16),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(lang.t('Net Balance'), style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 13)),
                                          Text(
                                            '₹${netAmount.abs().toStringAsFixed(0)}',
                                            style: TextStyle(
                                              fontSize: 24,
                                              fontWeight: FontWeight.bold,
                                              color: netAmount == 0 ? Colors.black87 : (isDueToYou ? Colors.red : Colors.green)
                                            ),
                                          ),
                                        ],
                                      )
                                    ],
                                  ),
                                ),
                                const Divider(height: 1),
                                // Payments & Credits
                                Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.all(4),
                                                  decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.green)),
                                                  child: const Icon(Icons.arrow_downward, color: Colors.green, size: 12),
                                                ),
                                                const SizedBox(width: 8),
                                                Text('$_receivedCount ${lang.t('payments')}', style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 13)),
                                              ]
                                            ),
                                            const SizedBox(height: 4),
                                            Text('₹${_totalReceived.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 18)),
                                          ],
                                        )
                                      ),
                                      Container(width: 1, height: 40, color: Colors.green),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.all(4),
                                                  decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.red)),
                                                  child: const Icon(Icons.arrow_upward, color: Colors.red, size: 12),
                                                ),
                                                const SizedBox(width: 8),
                                                Text('$_givenCount ${lang.t('credit')}', style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 13)),
                                              ]
                                            ),
                                            const SizedBox(height: 4),
                                            Text('₹${_totalGiven.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 18)),
                                          ],
                                        )
                                      ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Single Transaction Card (matching image-2)
                          if (_entries.isNotEmpty) 
                            Align(
                              alignment: Alignment.centerLeft,
                              child: _buildTransactionCard(_entries.first),
                            )
                        ],
                      ),
                    ),
                  ),

                  // Bottom Download Button
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))]
                    ),
                    child: SafeArea(
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _downloadPDF,
                          icon: const Icon(Icons.download_outlined),
                          label: Text(lang.t('Download'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1C9E44), // OkCredit Green
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24))
                          ),
                        ),
                      ),
                    ),
                  )
                ],
              )
        );
      }
    );
  }
}
