import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/budget_model.dart';

import '../services/budget_service.dart';
import '../services/expense_service.dart';
import '../services/income_service.dart';
import '../themes/tokens.dart';
import '../widgets/budget_form_sheet.dart';
import '../widgets/budget_tree_map.dart';

class BudgetingScreen extends StatefulWidget {
  final String userId;

  const BudgetingScreen({required this.userId, super.key});

  @override
  State<BudgetingScreen> createState() => _BudgetingScreenState();
}

class _BudgetingScreenState extends State<BudgetingScreen> {
  final _budgetService = BudgetService();
  final _expenseService = ExpenseService();
  final _incomeService = IncomeService();
  bool _isLoading = true;
  
  List<BudgetModel> _budgets = [];
  double _totalIncome = 0.0;
  double _totalAllocated = 0.0;

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
      final allExpenses = await _expenseService.getExpenses(widget.userId);
      final enriched = await _budgetService.getEnrichedBudgetsWithRollover(
          widget.userId, _currentMonth, _currentYear, allExpenses);
          
      // Fetch Income for zero-based budgeting top bar
      final startOfMonth = DateTime(_currentYear, _currentMonth, 1);
      final endOfMonth = DateTime(_currentYear, _currentMonth + 1, 1);
      final incomes = await _incomeService.getIncomesInDateRange(
          widget.userId, start: startOfMonth, end: endOfMonth);

      double tInc = incomes.fold(0.0, (sum, i) => sum + i.amount);
      
      // Calculate total allocated (Only count specific categories, if 'Overall' exists, it's just a general pool, but usually Envelope system adds them all up)
      // If user has 'Overall' and 'Food', 'Overall' usually represents the global limit. YNAB envelops specific limits.
      // We'll sum up all budgets except 'Overall' to avoid double counting if they made an Overall budget + sub-budgets.
      double tAlloc = enriched.where((b) => b.category.toLowerCase() != 'overall').fold(0.0, (sum, b) => sum + b.limitAmount);

      setState(() {
        _budgets = enriched;
        _totalIncome = tInc;
        _totalAllocated = tAlloc;
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
          if (!_isLoading) ...[
            _buildZeroBasedHeader(),
            BudgetTreeMap(
              budgets: _budgets,
              totalIncome: _totalIncome,
              totalAllocated: _totalAllocated,
            ),
          ],
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

  Widget _buildZeroBasedHeader() {
    final leftToBudget = _totalIncome - _totalAllocated;
    final isNegative = leftToBudget < 0;

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
        border: Border.all(color: isNegative ? Fx.bad.withValues(alpha: 0.3) : Colors.grey.shade200)
      ),
      child: Column(
        children: [
          Text(
            isNegative ? "Overbudgeted" : "Ready to Assign",
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isNegative ? Fx.bad : Colors.grey.shade600),
          ),
          const SizedBox(height: 4),
          Text(
            _inrFormat.format(leftToBudget.abs()),
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: isNegative ? Fx.bad : Fx.mintDark,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Monthly Income", style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                  Text(_inrFormat.format(_totalIncome), style: const TextStyle(fontWeight: FontWeight.bold)),
                ]
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text("Allocated Envelopes", style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                  Text(_inrFormat.format(_totalAllocated), style: const TextStyle(fontWeight: FontWeight.bold)),
                ]
              )
            ]
          )
        ]
      )
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
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            _inrFormat.format(b.effectiveLimit),
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                          if (b.rolloverAmount > 0)
                            Text(
                              "+ ${_inrFormat.format(b.rolloverAmount)} rolled over",
                              style: const TextStyle(fontSize: 10, color: Fx.mintDark, fontWeight: FontWeight.bold),
                            )
                        ],
                      )
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
                           ? "Exceeded by ${_inrFormat.format(b.spentAmount - b.effectiveLimit)}"
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
