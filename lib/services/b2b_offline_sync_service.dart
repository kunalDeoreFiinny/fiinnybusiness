import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'local_database_helper.dart';

class B2BOfflineSyncService {
  final _firestore = FirebaseFirestore.instance;

  // --- INVOICES ---
  Future<void> saveInvoiceOffline(Map<String, dynamic> invoiceData) async {
    final db = await LocalDatabaseHelper.instance.database;
    await db.insert(
      'invoices',
      {
        '_id': invoiceData['_id'],
        'customerName': invoiceData['customerName'],
        'customerPhone': invoiceData['customerPhone'],
        'totalAmount': invoiceData['totalAmount'],
        'synced': 0, // 0 = unsynced
        'createdAt': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> syncOfflineInvoices() async {
    final db = await LocalDatabaseHelper.instance.database;
    final unsynced = await db.query('invoices', where: 'synced = ?', whereArgs: [0]);

    for (var invoice in unsynced) {
      try {
        await _firestore.collection('b2b_invoices').doc(invoice['_id'] as String).set({
          'customerName': invoice['customerName'],
          'customerPhone': invoice['customerPhone'],
          'totalAmount': invoice['totalAmount'],
          'createdAt': invoice['createdAt'],
          'syncedAt': FieldValue.serverTimestamp(),
        });

        // Mark as synced locally
        await db.update(
          'invoices',
          {'synced': 1},
          where: '_id = ?',
          whereArgs: [invoice['_id']],
        );
      } catch (e) {
        debugPrint('[B2BOnlineSync] Failed to sync invoice: $e');
      }
    }
  }

  // --- INVENTORY ---
  Future<void> saveInventoryOffline(Map<String, dynamic> item) async {
    final db = await LocalDatabaseHelper.instance.database;
    await db.insert('inventory', {
      '_id': item['_id'],
      'name': item['name'],
      'price': item['price'],
      'stockCount': item['stockCount'],
      'synced': 0,
      'updatedAt': DateTime.now().toIso8601String(),
      'barcode': item['barcode'],
      'mrp': item['mrp'],
      'ptr': item['ptr'],
      'rate': item['rate'],
      'offer': item['offer'],
      'boxPrice': item['boxPrice'],
      'piecesPerBox': item['piecesPerBox'],
      'loosePieces': item['loosePieces'],
    });
  }

  Future<void> updateInventoryOffline(Map<String, dynamic> item) async {
    final db = await LocalDatabaseHelper.instance.database;
    await db.update('inventory', {
      'name': item['name'],
      'price': item['price'],
      'stockCount': item['stockCount'],
      'synced': 0,
      'updatedAt': DateTime.now().toIso8601String(),
      'barcode': item['barcode'],
      'mrp': item['mrp'],
      'ptr': item['ptr'],
      'rate': item['rate'],
      'offer': item['offer'],
      'boxPrice': item['boxPrice'],
      'piecesPerBox': item['piecesPerBox'],
      'loosePieces': item['loosePieces'],
    }, where: '_id = ?', whereArgs: [item['_id']]);
  }

  Future<void> syncOfflineInventory() async {
    final db = await LocalDatabaseHelper.instance.database;
    final unsynced = await db.query('inventory', where: 'synced = ?', whereArgs: [0]);

    for (var item in unsynced) {
      try {
        await _firestore.collection('b2b_inventory').doc(item['_id'] as String).set({
          'name': item['name'],
          'price': item['price'],
          'stockCount': item['stockCount'],
          'updatedAt': item['updatedAt'],
          'syncedAt': FieldValue.serverTimestamp(),
          'barcode': item['barcode'],
          'mrp': item['mrp'],
          'ptr': item['ptr'],
          'rate': item['rate'],
          'offer': item['offer'],
          'boxPrice': item['boxPrice'],
          'piecesPerBox': item['piecesPerBox'],
          'loosePieces': item['loosePieces'],
        });

        await db.update(
          'inventory',
          {'synced': 1},
          where: '_id = ?',
          whereArgs: [item['_id']],
        );
      } catch (e) {
        debugPrint('[B2BOnlineSync] Failed to sync inventory: $e');
      }
    }
  }
}
