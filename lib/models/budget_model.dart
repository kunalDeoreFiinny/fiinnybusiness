// lib/models/budget_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

double _toDouble(dynamic v) {
  if (v == null) return 0.0;
  if (v is num) return v.toDouble();
  if (v is String) {
    final p = double.tryParse(v.replaceAll(',', '').trim());
    return p ?? 0.0;
  }
  return 0.0;
}

DateTime? _toDate(dynamic v) {
  if (v == null) return null;
  if (v is Timestamp) return v.toDate();
  if (v is DateTime) return v;
  if (v is int) {
    if (v > 100000000000) return DateTime.fromMillisecondsSinceEpoch(v);
    if (v > 1000000000) return DateTime.fromMillisecondsSinceEpoch(v * 1000);
  }
  if (v is String) return DateTime.tryParse(v);
  return null;
}

class BudgetModel {
  final String id;
  final String category; // e.g., "Food", "Transport", "Overall"
  final double limitAmount;
  final int month;
  final int year;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  // Transient state for UI
  double spentAmount = 0.0;

  BudgetModel({
    required this.id,
    required this.category,
    required this.limitAmount,
    required this.month,
    required this.year,
    this.createdAt,
    this.updatedAt,
  });

  double get progress =>
      limitAmount <= 0 ? 0.0 : (spentAmount / limitAmount).clamp(0.0, 1.0);

  double get amountRemaining =>
      (limitAmount - spentAmount) <= 0 ? 0.0 : (limitAmount - spentAmount);

  bool get isExceeded => spentAmount > limitAmount;

  factory BudgetModel.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final json = doc.data() ?? {};
    return BudgetModel(
      id: doc.id,
      category: (json['category'] ?? 'Overall').toString(),
      limitAmount: _toDouble(json['limitAmount']),
      month: json['month'] as int? ?? DateTime.now().month,
      year: json['year'] as int? ?? DateTime.now().year,
      createdAt: _toDate(json['createdAt']),
      updatedAt: _toDate(json['updatedAt']),
    );
  }

  factory BudgetModel.fromJson(Map<String, dynamic> json, {String? id}) {
    return BudgetModel(
      id: id ?? (json['id']?.toString() ?? ''),
      category: (json['category'] ?? 'Overall').toString(),
      limitAmount: _toDouble(json['limitAmount']),
      month: json['month'] as int? ?? DateTime.now().month,
      year: json['year'] as int? ?? DateTime.now().year,
      createdAt: _toDate(json['createdAt']),
      updatedAt: _toDate(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson({bool setServerCreatedAtIfNull = true}) {
    final map = <String, dynamic>{
      'category': category,
      'limitAmount': limitAmount,
      'month': month,
      'year': year,
      'updatedAt': FieldValue.serverTimestamp(),
      'createdAt': createdAt != null
          ? Timestamp.fromDate(createdAt!)
          : (setServerCreatedAtIfNull ? FieldValue.serverTimestamp() : null),
    };
    map.removeWhere((_, v) => v == null);
    return map;
  }

  BudgetModel copyWith({
    String? id,
    String? category,
    double? limitAmount,
    int? month,
    int? year,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BudgetModel(
      id: id ?? this.id,
      category: category ?? this.category,
      limitAmount: limitAmount ?? this.limitAmount,
      month: month ?? this.month,
      year: year ?? this.year,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
