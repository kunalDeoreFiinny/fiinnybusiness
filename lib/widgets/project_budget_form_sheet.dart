// lib/widgets/project_budget_form_sheet.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../models/project_budget_model.dart';
import '../services/project_budget_service.dart';
import '../themes/tokens.dart';
import '../themes/glass_card.dart';

class ProjectBudgetFormSheet extends StatefulWidget {
  final String userId;
  final ProjectBudgetModel? existing;
  final VoidCallback onSaved;

  const ProjectBudgetFormSheet({
    required this.userId,
    this.existing,
    required this.onSaved,
    super.key,
  });

  @override
  State<ProjectBudgetFormSheet> createState() => _ProjectBudgetFormSheetState();
}

class _ProjectBudgetFormSheetState extends State<ProjectBudgetFormSheet> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _service = ProjectBudgetService();

  String _icon = '📋';
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now().add(const Duration(days: 30));
  bool _saving = false;

  final _dateFmt = DateFormat('d MMM yyyy');

  final List<String> _iconOptions = [
    '📋', '✈️', '🌾', '🏗️', '🏖️', '🎒', '🚗', '🏡', '🎓', '🏥',
    '💼', '🌿', '🐄', '🌽', '🚜', '🛖', '🏕️', '⛵', '🎯', '🛒',
  ];

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    if (e != null) {
      _nameCtrl.text = e.name;
      _descCtrl.text = e.description ?? '';
      _amountCtrl.text = e.limitAmount.toInt().toString();
      _icon = e.icon;
      _startDate = e.startDate;
      _endDate = e.endDate;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool isStart}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: ColorScheme.light(primary: Fx.mintDark),
        ),
        child: child!,
      ),
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        _startDate = picked;
        if (_endDate.isBefore(_startDate)) {
          _endDate = _startDate.add(const Duration(days: 30));
        }
      } else {
        _endDate = picked;
      }
    });
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    final amt = double.tryParse(_amountCtrl.text.trim()) ?? 0;
    if (name.isEmpty || amt <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a name and valid budget amount.')),
      );
      return;
    }
    if (_endDate.isBefore(_startDate)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('End date must be after start date.')),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      if (widget.existing == null) {
        final newProject = ProjectBudgetModel(
          id: '',
          name: name,
          description:
              _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
          icon: _icon,
          limitAmount: amt,
          startDate: _startDate,
          endDate: _endDate,
        );
        await _service.addProject(widget.userId, newProject);
      } else {
        final updated = widget.existing!.copyWith(
          name: name,
          description:
              _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
          icon: _icon,
          limitAmount: amt,
          startDate: _startDate,
          endDate: _endDate,
        );
        await _service.updateProject(widget.userId, updated);
      }
      if (mounted) {
        widget.onSaved();
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

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: 0.92,
        minChildSize: 0.6,
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
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Title
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.existing == null
                              ? 'New Project Budget'
                              : 'Edit Project Budget',
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Fx.textStrong),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Icon picker
                    const Text('Choose Icon', style: Fx.label),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 56,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _iconOptions.length,
                        itemBuilder: (_, i) {
                          final ic = _iconOptions[i];
                          final selected = ic == _icon;
                          return GestureDetector(
                            onTap: () => setState(() => _icon = ic),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              margin: const EdgeInsets.only(right: 8),
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: selected
                                    ? Fx.mint.withOpacity(0.25)
                                    : Colors.grey[100],
                                borderRadius: BorderRadius.circular(12),
                                border: selected
                                    ? Border.all(
                                        color: Fx.mintDark, width: 2)
                                    : null,
                              ),
                              child: Center(
                                child: Text(ic,
                                    style: const TextStyle(fontSize: 22)),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Name
                    const Text('Project Name', style: Fx.label),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _nameCtrl,
                      decoration: InputDecoration(
                        hintText: 'e.g. Goa Trip, Rabi Crop 2026',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: Fx.mintDark, width: 2),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Description
                    const Text('Description (Optional)', style: Fx.label),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _descCtrl,
                      maxLines: 2,
                      decoration: InputDecoration(
                        hintText: 'What\'s this project about?',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: Fx.mintDark, width: 2),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Total Budget
                    const Text('Total Budget (₹)', style: Fx.label),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _amountCtrl,
                      keyboardType: const TextInputType.numberWithOptions(
                          decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                            RegExp(r'^\d*\.?\d*'))
                      ],
                      style: const TextStyle(
                          fontSize: 22, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        prefixText: '₹ ',
                        prefixStyle: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Fx.textStrong),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide:
                              const BorderSide(color: Fx.mintDark, width: 2),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Date Range
                    const Text('Date Range', style: Fx.label),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _DateButton(
                            label: 'Start Date',
                            date: _startDate,
                            dateFmt: _dateFmt,
                            onTap: () => _pickDate(isStart: true),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                          child: Text('→',
                              style: TextStyle(
                                  fontSize: 18, color: Colors.grey)),
                        ),
                        Expanded(
                          child: _DateButton(
                            label: 'End Date',
                            date: _endDate,
                            dateFmt: _dateFmt,
                            onTap: () => _pickDate(isStart: false),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Center(
                      child: Text(
                        '${_endDate.difference(_startDate).inDays + 1} days  '
                        '(~${((_endDate.difference(_startDate).inDays + 1) / 30).toStringAsFixed(1)} months)',
                        style:
                            TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Save
                    if (_saving)
                      const Center(
                          child:
                              CircularProgressIndicator(color: Fx.mintDark))
                    else
                      ElevatedButton(
                        onPressed: _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Fx.mintDark,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        child: Text(
                          widget.existing == null
                              ? 'Create Project Budget'
                              : 'Update Project Budget',
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DateButton extends StatelessWidget {
  final String label;
  final DateTime date;
  final DateFormat dateFmt;
  final VoidCallback onTap;

  const _DateButton(
      {required this.label,
      required this.date,
      required this.dateFmt,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(fontSize: 11, color: Colors.grey[500])),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.calendar_today_outlined,
                    size: 14, color: Fx.mintDark),
                const SizedBox(width: 6),
                Text(dateFmt.format(date),
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
              ],
            )
          ],
        ),
      ),
    );
  }
}
