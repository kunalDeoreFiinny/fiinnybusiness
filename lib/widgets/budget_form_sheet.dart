import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/budget_model.dart';
import '../services/budget_service.dart';
import '../themes/tokens.dart';
import '../themes/glass_card.dart';

class BudgetFormSheet extends StatefulWidget {
  final String userId;
  final int month;
  final int year;
  final BudgetModel? existingBudget;
  final VoidCallback onSaved;

  const BudgetFormSheet({
    required this.userId,
    required this.month,
    required this.year,
    this.existingBudget,
    required this.onSaved,
    super.key,
  });

  @override
  State<BudgetFormSheet> createState() => _BudgetFormSheetState();
}

class _BudgetFormSheetState extends State<BudgetFormSheet> {
  final _amountCtrl = TextEditingController();
  final _budgetService = BudgetService();

  // Predefined categories out of ExpenseItem + 'Overall'
  final List<String> _categories = [
    'Overall',
    'Food',
    'Transport',
    'Shopping',
    'Entertainment',
    'Utilities',
    'Health',
    'Travel',
    'Groceries'
  ];
  
  String _selectedCategory = 'Overall';
  bool _isSaving = false;
  bool _isRollover = false;

  @override
  void initState() {
    super.initState();
    if (widget.existingBudget != null) {
      _amountCtrl.text = widget.existingBudget!.limitAmount.toInt().toString();
      if (_categories.contains(widget.existingBudget!.category)) {
         _selectedCategory = widget.existingBudget!.category;
      } else {
         _categories.add(widget.existingBudget!.category);
         _selectedCategory = widget.existingBudget!.category;
      }
      _isRollover = widget.existingBudget!.isRollover;
    }
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _saveBudget() async {
    final amtStr = _amountCtrl.text.trim();
    if (amtStr.isEmpty) return;
    
    final amt = double.tryParse(amtStr) ?? 0.0;
    if (amt <= 0) return;

    setState(() => _isSaving = true);

    try {
      if (widget.existingBudget == null) {
         final newBudget = BudgetModel(
            id: '', 
            category: _selectedCategory, 
            limitAmount: amt, 
            month: widget.month, 
            year: widget.year,
            isRollover: _isRollover,
         );
         await _budgetService.addBudget(widget.userId, newBudget);
      } else {
          final update = widget.existingBudget!.copyWith(
            category: _selectedCategory,
            limitAmount: amt,
            isRollover: _isRollover,
         );
         await _budgetService.updateBudget(widget.userId, update);
      }
      
      if (mounted) {
         widget.onSaved();
         Navigator.pop(context);
      }
    } catch (e) {
      // Show snackbar error
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Failed to save budget: $e'), backgroundColor: Fx.bad)
         );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _deleteBudget() async {
    if (widget.existingBudget == null) return;
    setState(() => _isSaving = true);
    try {
      await _budgetService.deleteBudget(widget.userId, widget.existingBudget!.id);
      if (mounted) {
         widget.onSaved();
         Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Failed to delete budget: $e'), backgroundColor: Fx.bad)
         );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Handling keyboard
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: GlassCard(
        radius: 24,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.existingBudget == null ? 'Set Budget' : 'Edit Budget',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Fx.textStrong),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
            const SizedBox(height: 16),
            const Text("Category", style: Fx.label),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedCategory,
                  isExpanded: true,
                  items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedCategory = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text("Monthly Limit (₹)", style: Fx.label),
            const SizedBox(height: 8),
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*'))],
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: '₹ ',
                prefixStyle: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Fx.textStrong),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Fx.mintDark, width: 2),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Carryover Leftovers', style: TextStyle(fontWeight: FontWeight.w600)),
              subtitle: const Text('Move remaining amount to next month', style: TextStyle(fontSize: 12)),
              value: _isRollover,
              activeColor: Fx.mintDark,
              contentPadding: EdgeInsets.zero,
              onChanged: (val) {
                setState(() => _isRollover = val);
              },
            ),
            const SizedBox(height: 24),
            if (_isSaving)
              const Center(child: CircularProgressIndicator(color: Fx.mintDark))
            else ...[
              ElevatedButton(
                onPressed: _saveBudget,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Fx.mintDark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text('Save Budget', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              if (widget.existingBudget != null) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: _deleteBudget,
                  style: TextButton.styleFrom(foregroundColor: Fx.bad),
                  child: const Text('Remove Budget'),
                )
              ]
            ]
          ],
        ),
      ),
    );
  }
}
