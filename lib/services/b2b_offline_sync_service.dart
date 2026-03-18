import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'local_database_helper.dart';

/// Result returned after a sync run
class SyncResult {
  final int invoicesSynced;
  final int inventorySynced;
  final int khataSynced;
  final int contactsSynced;
  final int errors;

  const SyncResult({
    this.invoicesSynced = 0,
    this.inventorySynced = 0,
    this.khataSynced = 0,
    this.contactsSynced = 0,
    this.errors = 0,
  });

  int get totalSynced =>
      invoicesSynced + inventorySynced + khataSynced + contactsSynced;

  bool get hasErrors => errors > 0;
}

class B2BOfflineSyncService {
  final _firestore = FirebaseFirestore.instance;

  // ─── Sync ALL local data to Firestore ─────────────────────────────────────
  /// Master sync: runs all tables IN PARALLEL, returns a summary result.
  Future<SyncResult> syncAll(String userId) async {
    int invoices = 0, inventory = 0, khata = 0, contacts = 0, errors = 0;

    // Run all 4 table syncs concurrently — much faster than sequential
    final results = await Future.wait([
      syncOfflineInvoices(userId).catchError((_) { errors++; return 0; }),
      syncOfflineInventory(userId).catchError((_) { errors++; return 0; }),
      syncOfflineKhata(userId).catchError((_) { errors++; return 0; }),
      syncOfflineContacts(userId).catchError((_) { errors++; return 0; }),
    ]);

    invoices  = results[0];
    inventory = results[1];
    khata     = results[2];
    contacts  = results[3];

    return SyncResult(
      invoicesSynced: invoices,
      inventorySynced: inventory,
      khataSynced: khata,
      contactsSynced: contacts,
      errors: errors,
    );
  }

  // ─── INVOICES ─────────────────────────────────────────────────────────────
  Future<void> saveInvoiceOffline(Map<String, dynamic> invoiceData) async {
    final db = await LocalDatabaseHelper.instance.database;
    await db.insert(
      'invoices',
      {
        '_id': invoiceData['_id'],
        'customerName': invoiceData['customerName'],
        'customerPhone': invoiceData['customerPhone'],
        'totalAmount': invoiceData['totalAmount'],
        'synced': 0,
        'createdAt': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<int> syncOfflineInvoices([String? userId]) async {
    final db = await LocalDatabaseHelper.instance.database;
    final unsynced =
        await db.query('invoices', where: 'synced = ?', whereArgs: [0]);
    int count = 0;

    for (var invoice in unsynced) {
      try {
        final ref = userId != null
            ? _firestore
                .collection('users')
                .doc(userId)
                .collection('b2b_invoices')
                .doc(invoice['_id'] as String)
            : _firestore
                .collection('b2b_invoices')
                .doc(invoice['_id'] as String);

        await ref.set({
          'customerName': invoice['customerName'],
          'customerPhone': invoice['customerPhone'],
          'totalAmount': invoice['totalAmount'],
          'createdAt': invoice['createdAt'],
          'syncedAt': FieldValue.serverTimestamp(),
        });
        await db.update('invoices', {'synced': 1},
            where: '_id = ?', whereArgs: [invoice['_id']]);
        count++;
      } catch (e) {
        debugPrint('[B2BSync] invoice ${invoice['_id']}: $e');
      }
    }
    return count;
  }

  // ─── INVENTORY ────────────────────────────────────────────────────────────
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
    await db.update(
      'inventory',
      {
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
      },
      where: '_id = ?',
      whereArgs: [item['_id']],
    );
  }

  Future<int> syncOfflineInventory([String? userId]) async {
    final db = await LocalDatabaseHelper.instance.database;
    final unsynced =
        await db.query('inventory', where: 'synced = ?', whereArgs: [0]);
    int count = 0;

    for (var item in unsynced) {
      try {
        final ref = userId != null
            ? _firestore
                .collection('users')
                .doc(userId)
                .collection('b2b_inventory')
                .doc(item['_id'] as String)
            : _firestore
                .collection('b2b_inventory')
                .doc(item['_id'] as String);

        await ref.set({
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
        await db.update('inventory', {'synced': 1},
            where: '_id = ?', whereArgs: [item['_id']]);
        count++;
      } catch (e) {
        debugPrint('[B2BSync] inventory ${item['_id']}: $e');
      }
    }
    return count;
  }

  // ─── KHATA ENTRIES ────────────────────────────────────────────────────────
  /// Syncs all khata rows that have synced = 0.
  Future<int> syncOfflineKhata(String userId) async {
    final db = await LocalDatabaseHelper.instance.database;

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

    final unsynced =
        await db.query('khata', where: 'synced = ?', whereArgs: [0]);
    int count = 0;

    for (var entry in unsynced) {
      try {
        await _firestore
            .collection('users')
            .doc(userId)
            .collection('b2b_khata')
            .doc(entry['_id'] as String)
            .set({
          'customerId': entry['customerId'],
          'customerName': entry['customerName'],
          'amount': entry['amount'],
          'type': entry['type'],
          'note': entry['note'],
          'createdAt': entry['createdAt'],
          'syncedAt': FieldValue.serverTimestamp(),
        });
        await db.update('khata', {'synced': 1},
            where: '_id = ?', whereArgs: [entry['_id']]);
        count++;
      } catch (e) {
        debugPrint('[B2BSync] khata ${entry['_id']}: $e');
      }
    }
    return count;
  }

  // ─── B2B CONTACTS ─────────────────────────────────────────────────────────
  /// Syncs all b2b_contacts to Firestore (upsert — no synced flag needed,
  /// contacts are small so we always push all of them).
  Future<int> syncOfflineContacts(String userId) async {
    final db = await LocalDatabaseHelper.instance.database;

    await db.execute('''
      CREATE TABLE IF NOT EXISTS b2b_contacts (
        contactId TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        type TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    ''');

    final contacts = await db.query('b2b_contacts');
    int count = 0;

    // Batch write using a Firestore batch (max 500 per batch)
    const batchSize = 400;
    for (int i = 0; i < contacts.length; i += batchSize) {
      final batch = _firestore.batch();
      final slice = contacts.skip(i).take(batchSize);
      for (var c in slice) {
        final ref = _firestore
            .collection('users')
            .doc(userId)
            .collection('b2b_contacts')
            .doc(c['contactId'] as String);
        batch.set(ref, {
          'name': c['name'],
          'phone': c['phone'],
          'type': c['type'],
          'createdAt': c['createdAt'],
          'syncedAt': FieldValue.serverTimestamp(),
        }, SetOptions(merge: true));
        count++;
      }
      await batch.commit();
    }
    return count;
  }
}
