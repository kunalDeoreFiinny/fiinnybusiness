// lib/services/budget_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/budget_model.dart';
import '../models/expense_item.dart';

class BudgetService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ---- Base collections ------------------------------------------------------

  CollectionReference<Map<String, dynamic>> getBudgetsCollection(String userId) {
    return _firestore.collection('users').doc(userId).collection('budgets');
  }

  // ---- Internal helpers ------------------------------------------------------

  Map<String, dynamic> _withUpdatedAt(Map<String, dynamic> data) {
    return {
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  // ---- CRUD ------------------------------------------------------------------

  /// Add a new budget. Auto-generates an ID, sets createdAt/updatedAt.
  Future<String> addBudget(String userId, BudgetModel budget) async {
    final docRef = getBudgetsCollection(userId).doc(); // auto ID
    final toSave = budget.copyWith(id: docRef.id);

    final data = toSave.toJson(setServerCreatedAtIfNull: true);
    data['updatedAt'] = FieldValue.serverTimestamp(); // ensure both stamps exist

    await docRef.set(data, SetOptions(merge: true));
    return docRef.id;
  }

  /// Replace the budget (full update).
  Future<void> updateBudget(String userId, BudgetModel budget) async {
    final data = _withUpdatedAt(
      budget.toJson(setServerCreatedAtIfNull: false),
    );
    await getBudgetsCollection(userId).doc(budget.id).update(data);
  }

  /// Delete a budget.
  Future<void> deleteBudget(String userId, String budgetId) async {
    await getBudgetsCollection(userId).doc(budgetId).delete();
  }

  /// Get all budgets for a specific month and year.
  Future<List<BudgetModel>> getBudgetsForMonth(String userId, int month, int year) async {
    final snapshot = await getBudgetsCollection(userId)
        .where('month', isEqualTo: month)
        .where('year', isEqualTo: year)
        .get();
    return snapshot.docs.map((doc) => BudgetModel.fromDoc(doc)).toList();
  }

  /// Realtime stream for budgets in a specific month and year.
  Stream<List<BudgetModel>> budgetsStream(String userId, int month, int year) {
    return getBudgetsCollection(userId)
        .where('month', isEqualTo: month)
        .where('year', isEqualTo: year)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => BudgetModel.fromDoc(doc)).toList());
  }

  // ---- Logic -----------------------------------------------------------------

  /// Enriches a list of BudgetModels with their actual spent amounts based on expenses
  List<BudgetModel> enrichBudgetsWithExpenses(
      List<BudgetModel> budgets, List<ExpenseItem> expenses, int month, int year) {
    
    // Filter expenses for the given month/year
    final monthExpenses = expenses.where((e) => e.date.month == month && e.date.year == year).toList();
    
    // Calculate category totals
    final Map<String, double> categoryTotals = {};
    double overallTotal = 0.0;
    
    for (var exp in monthExpenses) {
      final cat = exp.category ?? 'Other'; // Ensure fallback
      categoryTotals[cat] = (categoryTotals[cat] ?? 0.0) + exp.amount;
      overallTotal += exp.amount;
    }

    // Assign to budgets
    final enriched = budgets.map((b) {
      final updated = b.copyWith();
      if (b.category.toLowerCase() == 'overall') {
         updated.spentAmount = overallTotal;
      } else {
         updated.spentAmount = categoryTotals[b.category] ?? 0.0;
      }
      return updated;
    }).toList();

    return enriched;
  }

  /// Recursively fetches budgets and computes rollover limits up to 12 months back.
  Future<List<BudgetModel>> getEnrichedBudgetsWithRollover(
      String userId, int month, int year, List<ExpenseItem> allExpenses, {int depth = 0}) async {
    if (depth > 12) return []; // Limit recursion

    final budgets = await getBudgetsForMonth(userId, month, year);
    final enriched = enrichBudgetsWithExpenses(budgets, allExpenses, month, year);

    final rolloverBudgets = enriched.where((b) => b.isRollover).toList();
    if (rolloverBudgets.isNotEmpty) {
      int prevMonth = month == 1 ? 12 : month - 1;
      int prevYear = month == 1 ? year - 1 : year;
      
      final prevBudgets = await getEnrichedBudgetsWithRollover(
        userId, prevMonth, prevYear, allExpenses, depth: depth + 1
      );
      
      for (var b in rolloverBudgets) {
        final matchingPrev = prevBudgets.where((p) => p.category == b.category).toList();
        if (matchingPrev.isNotEmpty) {
           b.rolloverAmount = matchingPrev.first.amountRemaining;
        }
      }
    }

    return enriched;
  }
}
