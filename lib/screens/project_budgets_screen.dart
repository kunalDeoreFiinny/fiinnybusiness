// lib/screens/project_budgets_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/project_budget_model.dart';
import '../models/expense_item.dart';
import '../services/project_budget_service.dart';
import '../services/expense_service.dart';
import '../themes/tokens.dart';
import '../themes/glass_card.dart';
import '../widgets/project_budget_form_sheet.dart';
import '../widgets/link_expenses_sheet.dart';

class ProjectBudgetsScreen extends StatefulWidget {
  final String userId;
  const ProjectBudgetsScreen({required this.userId, super.key});

  @override
  State<ProjectBudgetsScreen> createState() => _ProjectBudgetsScreenState();
}

class _ProjectBudgetsScreenState extends State<ProjectBudgetsScreen>
    with SingleTickerProviderStateMixin {
  final _service = ProjectBudgetService();
  final _expenseService = ExpenseService();

  List<ProjectBudgetModel> _projects = [];
  List<ExpenseItem> _allExpenses = [];
  bool _loading = true;
  late TabController _tabCtrl;

  final _inrFmt =
      NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final projects = await _service.getAll(widget.userId);
      final expenses = await _expenseService.getExpenses(widget.userId);
      final enriched = _service.enrichWithExpenses(projects, expenses);
      setState(() {
        _projects = enriched;
        _allExpenses = expenses;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  void _openForm({ProjectBudgetModel? project}) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ProjectBudgetFormSheet(
        userId: widget.userId,
        existing: project,
        onSaved: _loadData,
      ),
    );
  }

  void _openLinkExpenses(ProjectBudgetModel project) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LinkExpensesSheet(
        userId: widget.userId,
        project: project,
        allExpenses: _service.suggestedExpenses(project, _allExpenses),
        onChanged: _loadData,
      ),
    );
  }

  List<ProjectBudgetModel> get _activeProjects =>
      _projects.where((p) => p.isActive).toList();
  List<ProjectBudgetModel> get _upcomingProjects =>
      _projects.where((p) => p.isUpcoming).toList();
  List<ProjectBudgetModel> get _completedProjects =>
      _projects.where((p) => p.isCompleted).toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Fx.bg,
      appBar: AppBar(
        title: const Text('Project Budgets',
            style: TextStyle(
                color: Fx.textStrong,
                fontWeight: FontWeight.bold,
                fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Fx.textStrong),
        bottom: TabBar(
          controller: _tabCtrl,
          labelColor: Fx.mintDark,
          unselectedLabelColor: Colors.grey,
          indicatorColor: Fx.mintDark,
          tabs: [
            Tab(
                text:
                    'Active${_activeProjects.isNotEmpty ? " (${_activeProjects.length})" : ""}'),
            Tab(
                text:
                    'Upcoming${_upcomingProjects.isNotEmpty ? " (${_upcomingProjects.length})" : ""}'),
            Tab(
                text:
                    'Done${_completedProjects.isNotEmpty ? " (${_completedProjects.length})" : ""}'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => _openForm(),
            tooltip: 'New Project',
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Fx.mintDark))
          : TabBarView(
              controller: _tabCtrl,
              children: [
                _buildList(_activeProjects,
                    emptyMsg: 'No active projects.\nAdd one with the + button!',
                    emptyIcon: '🗺️'),
                _buildList(_upcomingProjects,
                    emptyMsg: 'No upcoming projects yet.',
                    emptyIcon: '📅'),
                _buildList(_completedProjects,
                    emptyMsg: 'No completed projects yet.',
                    emptyIcon: '✅'),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Fx.mintDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Project'),
        onPressed: () => _openForm(),
      ),
    );
  }

  Widget _buildList(List<ProjectBudgetModel> projects,
      {required String emptyMsg, required String emptyIcon}) {
    if (projects.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(emptyIcon, style: const TextStyle(fontSize: 56)),
            const SizedBox(height: 16),
            Text(emptyMsg,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 16,
                    height: 1.5)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: projects.length,
        itemBuilder: (_, i) => _ProjectCard(
          project: projects[i],
          inrFmt: _inrFmt,
          onEdit: () => _openForm(project: projects[i]),
          onLinkExpenses: () => _openLinkExpenses(projects[i]),
          onDelete: () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('Delete Project?'),
                content: Text(
                    'Delete "${projects[i].name}"? This cannot be undone.'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Cancel')),
                  TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('Delete',
                          style: TextStyle(color: Colors.red))),
                ],
              ),
            );
            if (confirm == true) {
              await _service.deleteProject(widget.userId, projects[i].id);
              _loadData();
            }
          },
        ),
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  final ProjectBudgetModel project;
  final NumberFormat inrFmt;
  final VoidCallback onEdit;
  final VoidCallback onLinkExpenses;
  final VoidCallback onDelete;

  const _ProjectCard({
    required this.project,
    required this.inrFmt,
    required this.onEdit,
    required this.onLinkExpenses,
    required this.onDelete,
  });

  Color _progressColor(double progress) {
    if (progress >= 1.0) return Fx.bad;
    if (progress >= 0.8) return Fx.warn;
    return Fx.mintDark;
  }

  @override
  Widget build(BuildContext context) {
    final dateFmt = DateFormat('d MMM yyyy');
    final progress = project.progress;
    final color = _progressColor(progress);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        radius: 18,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- Header ---
            Row(
              children: [
                Text(project.icon, style: const TextStyle(fontSize: 28)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(project.name,
                          style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: Fx.textStrong)),
                      const SizedBox(height: 2),
                      Text(
                        '${dateFmt.format(project.startDate)}  →  ${dateFmt.format(project.endDate)}',
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (v) {
                    if (v == 'edit') onEdit();
                    if (v == 'link') onLinkExpenses();
                    if (v == 'delete') onDelete();
                  },
                  itemBuilder: (_) => [
                    const PopupMenuItem(
                        value: 'edit', child: Text('✏️  Edit')),
                    const PopupMenuItem(
                        value: 'link', child: Text('🔗  Link Expenses')),
                    const PopupMenuItem(
                        value: 'delete',
                        child: Text('🗑️  Delete',
                            style: TextStyle(color: Colors.red))),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),

            // --- Progress bar ---
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 10,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
            const SizedBox(height: 10),

            // --- Amount row ---
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Spent: ${inrFmt.format(project.spentAmount)}',
                  style: TextStyle(
                      color: project.isExceeded ? Fx.bad : Colors.grey[700],
                      fontWeight: project.isExceeded
                          ? FontWeight.bold
                          : FontWeight.normal),
                ),
                Text(
                  project.isExceeded
                      ? 'Over by ${inrFmt.format(project.spentAmount - project.limitAmount)}'
                      : 'Left: ${inrFmt.format(project.amountRemaining)}',
                  style: TextStyle(
                      color:
                          project.isExceeded ? Fx.bad : Colors.grey[600]),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Budget: ${inrFmt.format(project.limitAmount)}',
                  style: TextStyle(color: Colors.grey[500], fontSize: 12),
                ),
                if (project.isActive && project.daysRemaining > 0)
                  Text(
                    '${project.daysRemaining}d left  •  ${inrFmt.format(project.dailyBudgetLeft)}/day',
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                  ),
                if (project.isCompleted)
                  Text('Completed',
                      style: TextStyle(color: Colors.grey[400], fontSize: 12)),
              ],
            ),
            const SizedBox(height: 10),

            // --- Linked count + shortcut button ---
            Row(
              children: [
                Icon(Icons.receipt_long_outlined,
                    size: 14, color: Colors.grey[500]),
                const SizedBox(width: 4),
                Text(
                  '${project.linkedExpenseIds.length} expense${project.linkedExpenseIds.length == 1 ? '' : 's'} linked',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
                const Spacer(),
                TextButton.icon(
                  icon: const Icon(Icons.link, size: 14),
                  label: const Text('Link Kharcha', style: TextStyle(fontSize: 12)),
                  style: TextButton.styleFrom(
                    foregroundColor: Fx.mintDark,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  onPressed: onLinkExpenses,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
