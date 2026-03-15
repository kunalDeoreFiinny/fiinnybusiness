import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../services/b2b_offline_sync_service.dart';
import 'barcode_scanner_screen.dart';

class InventoryItemSheet extends StatefulWidget {
  final Map<String, dynamic>? product;
  final VoidCallback onSaved;

  const InventoryItemSheet({this.product, required this.onSaved, super.key});

  @override
  State<InventoryItemSheet> createState() => _InventoryItemSheetState();
}

class _InventoryItemSheetState extends State<InventoryItemSheet> {
  final _formKey = GlobalKey<FormState>();
  final _syncService = B2BOfflineSyncService();

  final _nameController = TextEditingController();
  final _barcodeController = TextEditingController();
  final _mrpController = TextEditingController();
  final _ptrController = TextEditingController();
  final _rateController = TextEditingController();
  final _offerController = TextEditingController();
  final _stockController = TextEditingController();
  final _boxPriceController = TextEditingController();
  final _piecesPerBoxController = TextEditingController();
  final _loosePiecesController = TextEditingController();

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    if (widget.product != null) {
      final p = widget.product!;
      _nameController.text = p['name']?.toString() ?? '';
      _barcodeController.text = p['barcode']?.toString() ?? '';
      _mrpController.text = p['mrp']?.toString() ?? '';
      _ptrController.text = p['ptr']?.toString() ?? '';
      _rateController.text = p['rate']?.toString() ?? p['price']?.toString() ?? '';
      _offerController.text = p['offer']?.toString() ?? '';
      _stockController.text = p['stockCount']?.toString() ?? '';
      _boxPriceController.text = p['boxPrice']?.toString() ?? '';
      _piecesPerBoxController.text = p['piecesPerBox']?.toString() ?? '';
      _loosePiecesController.text = p['loosePieces']?.toString() ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _barcodeController.dispose();
    _mrpController.dispose();
    _ptrController.dispose();
    _rateController.dispose();
    _offerController.dispose();
    _stockController.dispose();
    _boxPriceController.dispose();
    _piecesPerBoxController.dispose();
    _loosePiecesController.dispose();
    super.dispose();
  }

  Future<void> _scanBarcode() async {
    final result = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (context) => const BarcodeScannerScreen()),
    );
    if (result != null && result.isNotEmpty) {
      setState(() => _barcodeController.text = result);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    try {
      final isNew = widget.product == null;
      final stockRaw = int.tryParse(_stockController.text.trim());
      int finalStock = stockRaw ?? 0;
      
      // Calculate total stock if boxes are used instead of explicit stockCount
      final piecesPerBox = int.tryParse(_piecesPerBoxController.text.trim()) ?? 0;
      final loosePieces = int.tryParse(_loosePiecesController.text.trim()) ?? 0;
      if (piecesPerBox > 0 && stockRaw == null) {
        final boxCount = int.tryParse(_stockController.text.trim()) ?? 0; // if entered as boxes
        finalStock = (boxCount * piecesPerBox) + loosePieces;
      }

      final item = {
        '_id': isNew ? const Uuid().v4() : widget.product!['_id'],
        'name': _nameController.text.trim(),
        'barcode': _barcodeController.text.trim(),
        'mrp': double.tryParse(_mrpController.text.trim()),
        'ptr': double.tryParse(_ptrController.text.trim()),
        'rate': double.tryParse(_rateController.text.trim()) ?? 0.0,
        'price': double.tryParse(_rateController.text.trim()) ?? 0.0, // fallback alias
        'offer': double.tryParse(_offerController.text.trim()),
        'stockCount': finalStock,
        'boxPrice': double.tryParse(_boxPriceController.text.trim()),
        'piecesPerBox': piecesPerBox,
        'loosePieces': loosePieces,
      };

      if (isNew) {
        await _syncService.saveInventoryOffline(item);
      } else {
        await _syncService.updateInventoryOffline(item);
      }

      // Try triggering a background sync if online
      _syncService.syncOfflineInventory();

      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error saving: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: DraggableScrollableSheet(
          initialChildSize: 0.9,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (_, controller) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Form(
                key: _formKey,
                child: ListView(
                  controller: controller,
                  children: [
                    Text(
                      widget.product == null ? 'Add New Product' : 'Edit Product',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 20),
                    
                    // Name
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Product Name *', border: OutlineInputBorder()),
                      validator: (v) => v!.trim().isEmpty ? 'Required' : null,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 16),
                    
                    // Barcode
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _barcodeController,
                            decoration: const InputDecoration(
                              labelText: 'Barcode (Optional)',
                              border: OutlineInputBorder(),
                            ),
                            textInputAction: TextInputAction.next,
                          ),
                        ),
                        const SizedBox(width: 12),
                        InkWell(
                          onTap: _scanBarcode,
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.blue),
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Text('Pricing Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _rateController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Selling Price (Rate) *', border: OutlineInputBorder(), prefixText: '₹'),
                            validator: (v) => v!.trim().isEmpty ? 'Required' : null,
                            textInputAction: TextInputAction.next,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _mrpController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'MRP', border: OutlineInputBorder(), prefixText: '₹'),
                            textInputAction: TextInputAction.next,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _ptrController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'PTR (Purchase)', border: OutlineInputBorder(), prefixText: '₹'),
                            textInputAction: TextInputAction.next,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _offerController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Offer (Optional)', border: OutlineInputBorder(), prefixText: '₹'),
                            textInputAction: TextInputAction.next,
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 24),
                    const Text('Stock details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 12),
                    
                    TextFormField(
                      controller: _stockController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Total Pieces in Stock', border: OutlineInputBorder()),
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 16),
                    
                    ExpansionTile(
                      title: const Text('Box/Carton Configuration', style: TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: const Text('For wholesale or bulk entry', style: TextStyle(fontSize: 12)),
                      tilePadding: EdgeInsets.zero,
                      childrenPadding: const EdgeInsets.only(top: 8, bottom: 8),
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _piecesPerBoxController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Pieces Per Box', border: OutlineInputBorder()),
                                textInputAction: TextInputAction.next,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _boxPriceController,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Box Price', border: OutlineInputBorder(), prefixText: '₹'),
                                textInputAction: TextInputAction.next,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _loosePiecesController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Loose Pieces (Outside boxes)', border: OutlineInputBorder()),
                          textInputAction: TextInputAction.done,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _isSaving 
                            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Save Product', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
