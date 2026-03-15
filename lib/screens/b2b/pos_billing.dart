import 'package:flutter/material.dart';
import '../../core/ads/ads_banner_card.dart';
import '../../services/b2b_offline_sync_service.dart';
import '../../services/b2b_language_service.dart';
import 'package:uuid/uuid.dart';
import 'barcode_scanner_screen.dart';

class POSBillingScreen extends StatefulWidget {
  final String userId;
  const POSBillingScreen({required this.userId, super.key});

  @override
  State<POSBillingScreen> createState() => _POSBillingScreenState();
}

class _POSBillingScreenState extends State<POSBillingScreen> {
  final _syncSvc = B2BOfflineSyncService();
  bool _isSaving = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  // Local Cart State
  List<Map<String, dynamic>> _cartItems = [];

  double get _cartTotal {
    return _cartItems.fold(0.0, (sum, item) => sum + (item['price'] * item['qty']));
  }

  void _generateBill() async {
    if (_cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(B2BLanguageService().t('Cart is empty!'))));
      return;
    }

    setState(() => _isSaving = true);
    
    final invId = const Uuid().v4();
    await _syncSvc.saveInvoiceOffline({
      '_id': invId,
      'customerName': _nameController.text.isNotEmpty ? _nameController.text : 'Walk-in Customer',
      'customerPhone': _phoneController.text,
      'totalAmount': _cartTotal,
      'items': _cartItems,
    });

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(B2BLanguageService().t('Bill saved offline (will sync automatically)'))),
      );
      Navigator.pop(context);
    }
  }

  Future<void> _scanBarcode() async {
    final result = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
    );

    if (result != null && mounted) {
      // In a real app, you'd lookup the product from the local sqlite inventory DB.
      // For now, we mock adding the scanned product.
      setState(() {
        _cartItems.add({
          'name': 'Scanned Item $result',
          'price': 100.0,
          'qty': 1,
          'barcode': result,
        });
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${B2BLanguageService().t('Added Product: ')}$result')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = B2BLanguageService();
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.grey[100],
          appBar: AppBar(
            title: Text(lang.t('New Invoice (POS)'), style: const TextStyle(fontWeight: FontWeight.bold)),
            backgroundColor: Colors.white,
            foregroundColor: Colors.black87,
            elevation: 1,
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: buildB2BLanguageDropdown(),
              ),
              IconButton(
                icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.indigo),
                tooltip: 'Scan Barcode',
                onPressed: _scanBarcode,
              ),
            ],
          ),
          body: Column(
            children: [
              // Customer Info
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: lang.t('Customer Phone'),
                        prefixIcon: const Icon(Icons.phone),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        labelText: lang.t('Customer Name (Optional)'),
                        prefixIcon: const Icon(Icons.person),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              
              // Cart Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${lang.t('Cart Items')} (${_cartItems.length})', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                    TextButton.icon(
                      onPressed: _scanBarcode, 
                      icon: const Icon(Icons.add), 
                      label: Text(lang.t('Add Item'))
                    )
                  ],
                ),
              ),

              // Cart List
              Expanded(
                child: _cartItems.isEmpty
                    ? Center(child: Text(lang.t('Scan a barcode or add an item to begin.'), style: const TextStyle(color: Colors.grey)))
                    : ListView.builder(
                        itemCount: _cartItems.length,
                        itemBuilder: (context, index) {
                          final item = _cartItems[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              title: Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('₹${item['price'].toStringAsFixed(2)} x ${item['qty']}'),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text('₹${(item['price'] * item['qty']).toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                                    onPressed: () {
                                      setState(() => _cartItems.removeAt(index));
                                    },
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
              const AdsBannerCard(
                placement: 'b2b_pos_billing',
                inline: false,
                inlineMaxHeight: 60,
                margin: EdgeInsets.all(16.0),
                padding: EdgeInsets.zero,
                backgroundColor: Colors.transparent,
                boxShadow: [],
                minHeight: 60,
              ),
            ],
          ),
          bottomNavigationBar: SafeArea(
            child: Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(lang.t('Total Amount'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
                      Text('₹${_cartTotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.green)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _generateBill,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        backgroundColor: Colors.indigo,
                      ),
                      child: _isSaving 
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(lang.t('Confirm & Print Bill'), style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }
    );
  }
}
