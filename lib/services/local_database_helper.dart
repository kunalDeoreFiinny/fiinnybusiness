import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:sqflite_common_ffi_web/sqflite_ffi_web.dart';

class LocalDatabaseHelper {
  static final LocalDatabaseHelper instance = LocalDatabaseHelper._init();
  static Database? _database;
  static Future<Database>? _initFuture; // lock: prevents concurrent init

  LocalDatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    // Prevent concurrent callers from each starting _initDB separately
    _initFuture ??= _doInit();
    return _initFuture!;
  }

  Future<Database> _doInit() async {
    try {
      if (kIsWeb) {
        databaseFactory = databaseFactoryFfiWeb;
      }
      _database = await _initDB('fiinny_b2b.db');
      return _database!;
    } catch (e) {
      _initFuture = null; // Reset so next call can retry
      rethrow;
    }
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 4,
      onCreate: _createDB,
      onUpgrade: _onUpgrade,
    );
  }

  Future _createDB(Database db, int version) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const numType = 'REAL NOT NULL';
    const intType = 'INTEGER NOT NULL';

    await db.execute('''
CREATE TABLE invoices (
  _id $idType,
  customerName $textType,
  customerPhone $textType,
  totalAmount $numType,
  synced $intType,
  createdAt $textType
)
''');

    await db.execute('''
CREATE TABLE inventory (
  _id $idType,
  name $textType,
  price $numType,
  stockCount $intType,
  synced $intType,
  updatedAt $textType,
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

    await db.execute('''
CREATE TABLE khata (
  _id $idType,
  customerId $textType,
  customerName $textType,
  amount $numType,
  type $textType,
  note TEXT,
  synced $intType,
  createdAt $textType
)
''');

    // NEW IN V4: Explicit table for Customer/Supplier
    await db.execute('''
CREATE TABLE b2b_contacts (
  contactId $idType,
  name $textType,
  phone $textType,
  type TEXT NOT NULL, -- 'CUSTOMER' or 'SUPPLIER'
  createdAt $textType
)
''');
  }

  Future _onUpgrade(Database db, int oldVersion, int newVersion) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const numType = 'REAL NOT NULL';
    const intType = 'INTEGER NOT NULL';

    if (oldVersion < 2) {
      await db.execute('''
CREATE TABLE khata (
  _id $idType,
  customerId $textType,
  customerName $textType,
  amount $numType,
  type $textType,
  note TEXT,
  synced $intType,
  createdAt $textType
)
''');
    }

    if (oldVersion < 3) {
      // Add missing columns to 'inventory'
      final newColumns = [
        'barcode TEXT',
        'mrp REAL',
        'ptr REAL',
        'rate REAL',
        'offer REAL',
        'boxPrice REAL',
        'piecesPerBox INTEGER',
        'loosePieces INTEGER',
      ];
      for (final col in newColumns) {
        try {
          await db.execute('ALTER TABLE inventory ADD COLUMN $col');
        } catch (_) {
          // Ignore if column already exists
        }
      }
    }

    if (oldVersion < 4) {
      await db.execute('''
CREATE TABLE b2b_contacts (
  contactId $idType,
  name $textType,
  phone $textType,
  type TEXT NOT NULL, 
  createdAt $textType
)
''');
    }
  }

  // Generic Operations
  Future<void> flushDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'fiinny_b2b.db');
    await deleteDatabase(path);
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
