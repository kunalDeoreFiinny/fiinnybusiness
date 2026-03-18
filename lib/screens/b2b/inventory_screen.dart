import 'package:flutter/material.dart';
import '../../services/local_database_helper.dart';
import '../../core/ads/ads_banner_card.dart';
import 'inventory_item_sheet.dart';

class InventoryScreen extends StatefulWidget {
  final String userId;
  const InventoryScreen({required this.userId, super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  List<Map<String, dynamic>> _allProducts = [];
  List<Map<String, dynamic>> _filteredProducts = [];
  bool _isLoading = true;
  String? _errorMessage; // NEW: shown instead of infinite spinner on failure
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadInventory();
  }

  Future<void> _loadInventory() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final db = await LocalDatabaseHelper.instance.database;

      // Safety guard: ensure inventory table exists even if migration missed it
      await db.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
          _id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          stockCount INTEGER NOT NULL,
          synced INTEGER NOT NULL,
          updatedAt TEXT NOT NULL,
          barcode TEXT,
          mrp REAL,
          ptr REAL,
          rate REAL,
          offer REAL,
          boxPrice REAL,
          piecesPerBox INTEGER,
          loosePieces INTEGER
        )
      ''');

      final List<Map<String, dynamic>> results =
          await db.query('inventory', orderBy: 'name ASC');
      if (mounted) {
        setState(() {
          _allProducts = results;
          _filteredProducts = _filterProducts(results, _searchQuery);
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[Inventory] _loadInventory error: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage =
              'Could not load inventory. Please tap Retry.';
        });
      }
    }
  }

  List<Map<String, dynamic>> _filterProducts(List<Map<String, dynamic>> list, String query) {
    if (query.isEmpty) return list;
    final lower = query.toLowerCase();
    return list.where((p) {
      final name = (p['name'] ?? '').toString().toLowerCase();
      final barcode = (p['barcode'] ?? '').toString().toLowerCase();
      return name.contains(lower) || barcode.contains(lower);
    }).toList();
  }

  void _onSearchChanged(String value) {
    setState(() {
      _searchQuery = value.trim();
      _filteredProducts = _filterProducts(_allProducts, _searchQuery);
    });
  }

  void _showAddEditSheet([Map<String, dynamic>? product]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => InventoryItemSheet(
        product: product,
        onSaved: () {
          _loadInventory();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Inventory', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add Product',
            onPressed: () => _showAddEditSheet(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddEditSheet(),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Product'),
        backgroundColor: Colors.orange,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: TextField(
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search by name or barcode...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.grey[100],
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          
          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.error_outline_rounded,
                                  size: 56, color: Colors.red.shade300),
                              const SizedBox(height: 16),
                              Text(
                                _errorMessage!,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    color: Colors.grey[700], fontSize: 15),
                              ),
                              const SizedBox(height: 20),
                              ElevatedButton.icon(
                                onPressed: _loadInventory,
                                icon: const Icon(Icons.refresh_rounded),
                                label: const Text('Retry'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.orange,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : _filteredProducts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty 
                                  ? 'No products in inventory yet.' 
                                  : 'No products match your search.',
                              style: TextStyle(color: Colors.grey[600], fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: _filteredProducts.length,
                        padding: const EdgeInsets.all(12),
                        itemBuilder: (context, index) {
                          final item = _filteredProducts[index];
                          final name = item['name'] ?? 'Unknown';
                          final rate = item['rate'] ?? item['price'] ?? 0.0;
                          final stock = item['stockCount'] ?? 0;
                          final barcode = item['barcode']?.toString() ?? '';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            elevation: 0.5,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => _showAddEditSheet(item),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: Colors.orange.shade50,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(Icons.inventory_2_rounded, color: Colors.orange),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            name,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          if (barcode.isNotEmpty) ...[
                                            const SizedBox(height: 2),
                                            Text('Barcode: $barcode', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                                          ],
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              Text(
                                                '₹${rate.toStringAsFixed(2)}',
                                                style: TextStyle(fontWeight: FontWeight.w600, color: Colors.green.shade700),
                                              ),
                                              const SizedBox(width: 12),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: stock > 0 ? Colors.blue.shade50 : Colors.red.shade50,
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  'Stock: $stock',
                                                  style: TextStyle(fontSize: 12, color: stock > 0 ? Colors.blue.shade700 : Colors.red.shade700),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.chevron_right_rounded, color: Colors.grey),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
