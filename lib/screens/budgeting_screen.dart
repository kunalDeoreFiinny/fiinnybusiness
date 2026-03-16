import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/budget_model.dart';

import '../services/budget_service.dart';
import '../services/expense_service.dart';
import '../themes/tokens.dart';
import '../widgets/budget_form_sheet.dart';

class BudgetingScreen extends StatefulWidget {
  final String userId;

  const BudgetingScreen({required this.userId, super.key});

  @override
  State<BudgetingScreen> createState() => _BudgetingScreenState();
}

class _BudgetingScreenState extends State<BudgetingScreen> {
  final _budgetService = BudgetService();
  final _expenseService = ExpenseService();
  bool _isLoading = true;
  
  List<BudgetModel> _budgets = [];

  late int _currentMonth;
  late int _currentYear;

  final _inrFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _currentMonth = now.month;
    _currentYear = now.year;
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    
    try {
      final budgets = await _budgetService.getBudgetsForMonth(widget.userId, _currentMonth, _currentYear);
      // We only need expenses for the current selected month to calculate progress.
      // Easiest is to get all expenses and filter (since getExpenses is cached or fast enough).
      final allExpenses = await _expenseService.getExpenses(widget.userId);
      
      final enriched = _budgetService.enrichBudgetsWithExpenses(budgets, allExpenses, _currentMonth, _currentYear);
      
      setState(() {
        _budgets = enriched;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openBudgetForm({BudgetModel? budget}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => BudgetFormSheet(
        userId: widget.userId,
        month: _currentMonth,
        year: _currentYear,
        existingBudget: budget,
        onSaved: () => _fetchData(),
      ),
    );
  }

  void _changeMonth(int offset) {
    setState(() {
      _currentMonth += offset;
      if (_currentMonth > 12) {
        _currentMonth = 1;
        _currentYear++;
      } else if (_currentMonth < 1) {
        _currentMonth = 12;
        _currentYear--;
      }
    });
    _fetchData();
  }

  String _getMonthName(int m) {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (m >= 1 && m <= 12) return names[m - 1];
    return "";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Fx.bg,
      appBar: AppBar(
        title: const Text('My Budgets', style: TextStyle(color: Fx.textStrong)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Fx.textStrong),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.folder_special_outlined, size: 18),
            label: const Text('Projects'),
            style: TextButton.styleFrom(foregroundColor: Fx.mintDark),
            onPressed: () {
              Navigator.pushNamed(context, '/project-budgets',
                  arguments: widget.userId);
            },
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _openBudgetForm(),
          )
        ],
      ),
      body: Column(
        children: [
          _buildMonthSelector(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Fx.mintDark))
                : _budgets.isEmpty
                    ? _buildEmptyState()
                    : _buildBudgetList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthSelector() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: () => _changeMonth(-1),
          ),
          Text(
            '${_getMonthName(_currentMonth)} $_currentYear',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () => _changeMonth(1),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.pie_chart_outline, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            "No budgets set for ${_getMonthName(_currentMonth)}",
            style: TextStyle(fontSize: 18, color: Colors.grey[600], fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            "Create a budget to track your spending.",
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
             style: ElevatedButton.styleFrom(
               backgroundColor: Fx.mintDark,
               foregroundColor: Colors.white,
               padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
               shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
             ),
             onPressed: () => _openBudgetForm(),
             icon: const Icon(Icons.add),
             label: const Text("Create Budget"),
          )
        ],
      ),
    );
  }

  Widget _buildBudgetList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _budgets.length,
      itemBuilder: (context, index) {
        final b = _budgets[index];
        final bool isExceeded = b.isExceeded;
        
        Color progressColor = Fx.mintDark;
        if (b.progress > 0.8) progressColor = Fx.warn;
        if (isExceeded) progressColor = Fx.bad;

        return Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.only(bottom: 16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => _openBudgetForm(budget: b),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        b.category,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        _inrFormat.format(b.limitAmount),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: b.progress,
                      backgroundColor: Colors.grey[200],
                      valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Spent: ${_inrFormat.format(b.spentAmount)}",
                        style: TextStyle(
                            color: isExceeded ? Fx.bad : Colors.grey[700],
                            fontWeight: isExceeded ? FontWeight.bold : FontWeight.normal),
                      ),
                      Text(
                        isExceeded 
                           ? "Exceeded by ${_inrFormat.format(b.spentAmount - b.limitAmount)}"
                           : "Left: ${_inrFormat.format(b.amountRemaining)}",
                        style: TextStyle(
                            color: isExceeded ? Fx.bad : Colors.grey[600],
                            fontWeight: isExceeded ? FontWeight.bold : FontWeight.normal),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
