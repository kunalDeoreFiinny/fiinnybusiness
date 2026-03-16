// lib/widgets/link_expenses_sheet.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/expense_item.dart';
import '../models/project_budget_model.dart';
import '../services/project_budget_service.dart';
import '../themes/tokens.dart';
import '../themes/glass_card.dart';

class LinkExpensesSheet extends StatefulWidget {
  final String userId;
  final ProjectBudgetModel project;
  final List<ExpenseItem> allExpenses;
  final VoidCallback onChanged;

  const LinkExpensesSheet({
    required this.userId,
    required this.project,
    required this.allExpenses,
    required this.onChanged,
    super.key,
  });

  @override
  State<LinkExpensesSheet> createState() => _LinkExpensesSheetState();
}

class _LinkExpensesSheetState extends State<LinkExpensesSheet> {
  final _service = ProjectBudgetService();
  late Set<String> _linked;
  bool _saving = false;
  String _searchQuery = '';

  final _inrFmt =
      NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
  final _dateFmt = DateFormat('d MMM');

  @override
  void initState() {
    super.initState();
    _linked = Set<String>.from(widget.project.linkedExpenseIds);
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      // Find newly linked and newly unlinked
      final original = Set<String>.from(widget.project.linkedExpenseIds);
      final toLink = _linked.difference(original);
      final toUnlink = original.difference(_linked);

      for (final id in toLink) {
        await _service.linkExpense(widget.userId, widget.project.id, id);
      }
      for (final id in toUnlink) {
        await _service.unlinkExpense(widget.userId, widget.project.id, id);
      }

      if (mounted) {
        widget.onChanged();
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Fx.bad),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  List<ExpenseItem> get _filteredExpenses {
    if (_searchQuery.isEmpty) return widget.allExpenses;
    final q = _searchQuery.toLowerCase();
    return widget.allExpenses.where((e) {
      return (e.title ?? e.note).toLowerCase().contains(q) ||
          (e.category ?? '').toLowerCase().contains(q) ||
          (e.counterparty ?? '').toLowerCase().contains(q);
    }).toList();
  }

  double get _selectedTotal {
    double total = 0;
    for (final e in widget.allExpenses) {
      if (_linked.contains(e.id)) total += e.amount;
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final expenses = _filteredExpenses;

    return DraggableScrollableSheet(
      initialChildSize: 0.90,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (ctx, scrollCtrl) => GlassCard(
        radius: 24,
        padding: EdgeInsets.zero,
        child: Column(
          children: [
            // Drag handle
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 4),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Header
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  Text(widget.project.icon,
                      style: const TextStyle(fontSize: 24)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Link Kharcha to ${widget.project.name}',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: Fx.textStrong),
                        ),
                        Text(
                          '${_linked.length} selected  •  Total: ${_inrFmt.format(_selectedTotal)}',
                          style: TextStyle(
                              color: Colors.grey[600], fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context)),
                ],
              ),
            ),
            // Search
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                decoration: InputDecoration(
                  hintText: 'Search expenses...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.grey[100],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
            const SizedBox(height: 8),
            // List
            Expanded(
              child: expenses.isEmpty
                  ? Center(
                      child: Text('No expenses found',
                          style: TextStyle(color: Colors.grey[500])))
                  : ListView.builder(
                      controller: scrollCtrl,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 4),
                      itemCount: expenses.length,
                      itemBuilder: (_, i) {
                        final e = expenses[i];
                        final isLinked = _linked.contains(e.id);
                        final displayName = e.title?.isNotEmpty == true
                            ? e.title!
                            : e.counterparty?.isNotEmpty == true
                                ? e.counterparty!
                                : e.note.isNotEmpty
                                    ? e.note
                                    : 'Expense';

                        return CheckboxListTile(
                          value: isLinked,
                          onChanged: (v) {
                            setState(() {
                              if (v == true) {
                                _linked.add(e.id);
                              } else {
                                _linked.remove(e.id);
                              }
                            });
                          },
                          activeColor: Fx.mintDark,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          title: Text(
                            displayName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: isLinked
                                    ? FontWeight.w600
                                    : FontWeight.normal),
                          ),
                          subtitle: Text(
                            '${e.category ?? e.type}  •  ${_dateFmt.format(e.date)}',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey[500]),
                          ),
                          secondary: Text(
                            _inrFmt.format(e.amount),
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isLinked
                                    ? Fx.mintDark
                                    : Colors.grey[700],
                                fontSize: 14),
                          ),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                          tileColor: isLinked
                              ? Fx.mint.withOpacity(0.08)
                              : Colors.transparent,
                        );
                      },
                    ),
            ),
            // Save button
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: _saving
                  ? const CircularProgressIndicator(color: Fx.mintDark)
                  : ElevatedButton(
                      onPressed: _save,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Fx.mintDark,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: Text(
                        'Save  (${_linked.length} linked)',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
