// lib/services/project_budget_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/project_budget_model.dart';
import '../models/expense_item.dart';

class ProjectBudgetService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> _col(String userId) =>
      _db.collection('users').doc(userId).collection('project_budgets');

  // ---- CRUD -----

  Future<String> addProject(String userId, ProjectBudgetModel p) async {
    final ref = _col(userId).doc();
    final toSave = p.copyWith(id: ref.id);
    await ref.set(toSave.toJson(setCreatedAt: true));
    return ref.id;
  }

  Future<void> updateProject(String userId, ProjectBudgetModel p) async {
    await _col(userId).doc(p.id).update(p.toJson(setCreatedAt: false));
  }

  Future<void> deleteProject(String userId, String projectId) async {
    await _col(userId).doc(projectId).delete();
  }

  /// Fetch all project budgets (sorted by startDate descending)
  Future<List<ProjectBudgetModel>> getAll(String userId) async {
    final snap = await _col(userId)
        .orderBy('startDate', descending: true)
        .get();
    return snap.docs.map((d) => ProjectBudgetModel.fromDoc(d)).toList();
  }

  /// Realtime stream
  Stream<List<ProjectBudgetModel>> stream(String userId) {
    return _col(userId)
        .orderBy('startDate', descending: true)
        .snapshots()
        .map((s) => s.docs.map((d) => ProjectBudgetModel.fromDoc(d)).toList());
  }

  // ---- Link / unlink expenses ----

  /// Add an expense ID to a project's linkedExpenseIds
  Future<void> linkExpense(
      String userId, String projectId, String expenseId) async {
    await _col(userId).doc(projectId).update({
      'linkedExpenseIds': FieldValue.arrayUnion([expenseId]),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Remove an expense ID from a project's linkedExpenseIds
  Future<void> unlinkExpense(
      String userId, String projectId, String expenseId) async {
    await _col(userId).doc(projectId).update({
      'linkedExpenseIds': FieldValue.arrayRemove([expenseId]),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // ---- Enrichment ----

  /// Calculates spentAmount for each project based on linked expense IDs
  /// or by auto-matching expenses within the project's date range that
  /// have a matching label tag.
  List<ProjectBudgetModel> enrichWithExpenses(
    List<ProjectBudgetModel> projects,
    List<ExpenseItem> allExpenses,
  ) {
    final expenseMap = {for (var e in allExpenses) e.id: e};

    return projects.map((p) {
      double total = 0.0;

      // Sum only explicitly linked expenses
      for (final expId in p.linkedExpenseIds) {
        final exp = expenseMap[expId];
        if (exp != null) {
          total += exp.amount;
        }
      }

      p.spentAmount = total;
      return p;
    }).toList();
  }

  /// Returns all expenses whose date falls within [startDate, endDate]
  /// — useful for showing "suggested" expenses to link
  List<ExpenseItem> suggestedExpenses(
    ProjectBudgetModel project,
    List<ExpenseItem> allExpenses,
  ) {
    return allExpenses
        .where((e) =>
            !e.date.isBefore(project.startDate) &&
            !e.date.isAfter(project.endDate.add(const Duration(days: 1))))
        .toList()
      ..sort((a, b) => b.date.compareTo(a.date));
  }
}
