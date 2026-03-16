// lib/models/project_budget_model.dart
import 'package:cloud_firestore/cloud_firestore.dart';

double _toDouble(dynamic v) {
  if (v == null) return 0.0;
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v.trim()) ?? 0.0;
  return 0.0;
}

DateTime? _toDate(dynamic v) {
  if (v == null) return null;
  if (v is Timestamp) return v.toDate();
  if (v is DateTime) return v;
  if (v is String) return DateTime.tryParse(v);
  return null;
}

/// A project/initiative budget that spans a custom date range.
/// Examples: "Goa Trip – July to September", "Rabi Crop 2026 – Nov to March"
class ProjectBudgetModel {
  final String id;

  /// Human-readable name for the initiative
  final String name;

  /// Optional description / notes
  final String? description;

  /// Icon / emoji chosen by the user (e.g., "✈️", "🌾", "🏗️")
  final String icon;

  /// Total budget limit for this entire project
  final double limitAmount;

  /// Project start date
  final DateTime startDate;

  /// Project end date
  final DateTime endDate;

  /// Expense IDs manually linked to this project
  final List<String> linkedExpenseIds;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  // ---- Transient (UI only) ----
  /// Calculated from linked expense amounts
  double spentAmount = 0.0;

  ProjectBudgetModel({
    required this.id,
    required this.name,
    this.description,
    this.icon = '📋',
    required this.limitAmount,
    required this.startDate,
    required this.endDate,
    this.linkedExpenseIds = const [],
    this.createdAt,
    this.updatedAt,
  });

  // ---- Computed ----

  bool get isActive {
    final now = DateTime.now();
    return !now.isBefore(startDate) && !now.isAfter(endDate);
  }

  bool get isCompleted => DateTime.now().isAfter(endDate);
  bool get isUpcoming => DateTime.now().isBefore(startDate);

  int get durationDays => endDate.difference(startDate).inDays + 1;

  int get daysRemaining {
    final now = DateTime.now();
    if (now.isAfter(endDate)) return 0;
    if (now.isBefore(startDate)) return durationDays;
    return endDate.difference(now).inDays + 1;
  }

  double get progress =>
      limitAmount <= 0 ? 0.0 : (spentAmount / limitAmount).clamp(0.0, 1.0);

  double get amountRemaining =>
      limitAmount - spentAmount < 0 ? 0.0 : limitAmount - spentAmount;

  bool get isExceeded => spentAmount > limitAmount;

  /// How much to spend per day to stay on budget from now until end
  double get dailyBudgetLeft {
    if (daysRemaining <= 0) return 0.0;
    return amountRemaining / daysRemaining;
  }

  String get statusLabel {
    if (isUpcoming) return 'Upcoming';
    if (isCompleted) return 'Completed';
    return 'Active';
  }

  // ---- Firestore ----

  factory ProjectBudgetModel.fromDoc(
      DocumentSnapshot<Map<String, dynamic>> doc) {
    final j = doc.data() ?? {};
    return ProjectBudgetModel(
      id: doc.id,
      name: (j['name'] ?? 'Unnamed Project').toString(),
      description: j['description'] as String?,
      icon: (j['icon'] ?? '📋').toString(),
      limitAmount: _toDouble(j['limitAmount']),
      startDate: _toDate(j['startDate']) ?? DateTime.now(),
      endDate: _toDate(j['endDate']) ??
          DateTime.now().add(const Duration(days: 30)),
      linkedExpenseIds: j['linkedExpenseIds'] is List
          ? List<String>.from(j['linkedExpenseIds'])
          : const [],
      createdAt: _toDate(j['createdAt']),
      updatedAt: _toDate(j['updatedAt']),
    );
  }

  Map<String, dynamic> toJson({bool setCreatedAt = true}) {
    final map = <String, dynamic>{
      'name': name,
      if (description != null && description!.trim().isNotEmpty)
        'description': description,
      'icon': icon,
      'limitAmount': limitAmount,
      'startDate': Timestamp.fromDate(startDate),
      'endDate': Timestamp.fromDate(endDate),
      'linkedExpenseIds': linkedExpenseIds,
      'updatedAt': FieldValue.serverTimestamp(),
      'createdAt': createdAt != null
          ? Timestamp.fromDate(createdAt!)
          : (setCreatedAt ? FieldValue.serverTimestamp() : null),
    };
    map.removeWhere((_, v) => v == null);
    return map;
  }

  ProjectBudgetModel copyWith({
    String? id,
    String? name,
    String? description,
    String? icon,
    double? limitAmount,
    DateTime? startDate,
    DateTime? endDate,
    List<String>? linkedExpenseIds,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ProjectBudgetModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      limitAmount: limitAmount ?? this.limitAmount,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      linkedExpenseIds: linkedExpenseIds ?? List.from(this.linkedExpenseIds),
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
