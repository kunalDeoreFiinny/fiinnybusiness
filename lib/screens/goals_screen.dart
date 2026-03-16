// lib/screens/goals_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/ads/ads_shell.dart';
import '../models/goal_model.dart';
import '../services/goal_service.dart';
import '../widgets/add_goal_dialog.dart';
import '../screens/fiinny_brain_chat_screen.dart';

class GoalsScreen extends StatefulWidget {
  final String userId;
  const GoalsScreen({required this.userId, super.key});

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  // ── Add goal ────────────────────────────────────────────────
  Future<void> _showAddGoal() async {
    await showDialog(
      context: context,
      builder: (_) => AddGoalDialog(
        onAdd: (GoalModel g) => GoalService().addGoal(widget.userId, g),
      ),
    );
  }

  // ── Add savings bottom sheet ─────────────────────────────────
  Future<void> _addProgress(GoalModel g) async {
    final ctrl = TextEditingController();
    final inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final remaining = g.targetAmount - g.savedAmount;

    final result = await showModalBottomSheet<double>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            left: 24, right: 24, top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: Colors.teal.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.savings_rounded, color: Colors.teal, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('Add to "${g.title}"',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${inr.format(g.savedAmount)} saved of ${inr.format(g.targetAmount)} — ${inr.format(remaining)} to go',
                style: TextStyle(color: Colors.grey[500], fontSize: 13),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: ctrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'Amount to add',
                  prefixText: '₹ ',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  filled: true,
                  fillColor: Colors.grey[50],
                  suffixText: 'max ${inr.format(remaining)}',
                  suffixStyle: TextStyle(color: Colors.grey[400], fontSize: 12),
                ),
              ),
              const SizedBox(height: 12),
              // Quick amount chips
              Wrap(
                spacing: 8,
                children: [500, 1000, 2000, 5000]
                    .where((v) => v <= remaining)
                    .map((v) => ActionChip(
                          label: Text('₹$v',
                              style: const TextStyle(fontSize: 12)),
                          padding: EdgeInsets.zero,
                          onPressed: () => ctrl.text = v.toString(),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.teal,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {
                    final v = double.tryParse(ctrl.text.trim());
                    if (v != null && v > 0) Navigator.pop(ctx, v);
                  },
                  child: const Text('Add Savings',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        );
      },
    );

    if (result != null && mounted) {
      try {
        final newSaved = await GoalService()
            .incrementSavedAmount(widget.userId, g.id, result, clampToTarget: true);
        // Auto-complete if target reached
        if (newSaved >= g.targetAmount) {
          await GoalService().markCompleted(widget.userId, g.id);
          if (mounted) {
            _showCelebration(g.title);
          }
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('₹${result.toStringAsFixed(0)} added to "${g.title}" 🎯'),
              backgroundColor: Colors.teal,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
        }
      }
    }
  }

  void _showCelebration(String title) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('🎉', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 12),
            const Text('Goal Achieved!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text('"$title" is complete. Amazing work!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600], fontSize: 14)),
          ],
        ),
        actions: [
          Center(
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: Colors.teal),
              onPressed: () => Navigator.pop(context),
              child: const Text('Woohoo! 🚀'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteGoal(GoalModel g) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete goal?'),
        content: Text('This will permanently remove "${g.title}".'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok == true) await GoalService().deleteGoal(widget.userId, g.id);
  }

  void _openAI(List<GoalModel> goals) {
    // Build a goals focused pre-question
    final active = goals.where((g) => g.status == GoalStatus.active).toList();
    final behind = active.where((g) => g.isOverdue || g.requiredPerMonth > 10000).toList();

    String question;
    if (behind.isNotEmpty) {
      question = 'Meri goals ke baare mein advice do — especially "${behind.first.title}" jo behind schedule hai. Kya karna chahiye?';
    } else if (active.isNotEmpty) {
      question = 'Meri ${active.length} active goals hain. Kaise achieve kar sakta hoon inhe fastest way mein?';
    } else {
      question = 'Mujhe financial goals set karne mein help karo.';
    }

    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => FiinnyBrainChatScreen(
        userPhone: widget.userId,
        initialMessage: question,
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = context.adsBottomPadding(extra: 80);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddGoal,
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Goal', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: StreamBuilder<List<GoalModel>>(
        stream: GoalService().goalsStream(widget.userId),
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator(color: Colors.teal));
          }

          final all = snap.data ?? [];
          final active = all.where((g) => g.status == GoalStatus.active && !g.archived).toList();
          final completed = all.where((g) => g.isAchieved).toList();
          final paused = all.where((g) => g.status == GoalStatus.paused).toList();

          // Stats
          final totalTarget = active.fold(0.0, (s, g) => s + g.targetAmount);
          final totalSaved = active.fold(0.0, (s, g) => s + g.savedAmount);
          final overdueCount = active.where((g) => g.isOverdue).length;

          return CustomScrollView(
            slivers: [
              // ── AppBar ──────────────────────────────────────
              SliverAppBar(
                pinned: true,
                backgroundColor: Colors.white,
                foregroundColor: Colors.black87,
                elevation: 0,
                surfaceTintColor: Colors.transparent,
                expandedHeight: 220,
                flexibleSpace: FlexibleSpaceBar(
                  background: _buildHeader(
                    totalTarget: totalTarget,
                    totalSaved: totalSaved,
                    overdueCount: overdueCount,
                    activeCount: active.length,
                    completedCount: completed.length,
                    allGoals: all,
                  ),
                ),
                bottom: TabBar(
                  controller: _tab,
                  labelColor: Colors.teal[800],
                  unselectedLabelColor: Colors.grey,
                  indicatorColor: Colors.teal,
                  indicatorWeight: 3,
                  tabs: [
                    Tab(text: 'Active (${active.length})'),
                    Tab(text: 'Done (${completed.length})'),
                    Tab(text: 'Paused (${paused.length})'),
                  ],
                ),
              ),

              // ── Tab Content ──────────────────────────────────
              SliverFillRemaining(
                child: TabBarView(
                  controller: _tab,
                  children: [
                    _GoalList(
                      goals: active,
                      emptyMessage: 'No active goals.\nTap + to create one!',
                      emptyIcon: Icons.track_changes_rounded,
                      onAddProgress: _addProgress,
                      onDelete: _deleteGoal,
                      onPause: (g) => GoalService().pauseGoal(widget.userId, g.id),
                      bottomPadding: bottomInset,
                    ),
                    _GoalList(
                      goals: completed,
                      emptyMessage: 'No completed goals yet.\nKeep saving! 💪',
                      emptyIcon: Icons.check_circle_outline_rounded,
                      onAddProgress: _addProgress,
                      onDelete: _deleteGoal,
                      bottomPadding: bottomInset,
                    ),
                    _GoalList(
                      goals: paused,
                      emptyMessage: 'No paused goals.',
                      emptyIcon: Icons.pause_circle_outline_rounded,
                      onAddProgress: _addProgress,
                      onDelete: _deleteGoal,
                      onResume: (g) =>
                          GoalService().resumeGoal(widget.userId, g.id),
                      bottomPadding: bottomInset,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader({
    required double totalTarget,
    required double totalSaved,
    required int overdueCount,
    required int activeCount,
    required int completedCount,
    required List<GoalModel> allGoals,
  }) {
    final inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final overallProgress =
        totalTarget > 0 ? (totalSaved / totalTarget).clamp(0.0, 1.0) : 0.0;

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Financial Goals',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              const Spacer(),
              // Fiinny AI chip
              InkWell(
                onTap: () => _openAI(allGoals),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00B09B), Color(0xFF10B981)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('✨', style: TextStyle(fontSize: 14)),
                      SizedBox(width: 4),
                      Text('Ask Fiinny',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress row
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(inr.format(totalSaved),
                      style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A))),
                  Text('of ${inr.format(totalTarget)} target',
                      style:
                          TextStyle(fontSize: 12, color: Colors.grey[500])),
                ],
              ),
              const Spacer(),
              if (overdueCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.red[200]!),
                  ),
                  child: Text(
                    '⚠️ $overdueCount overdue',
                    style: TextStyle(
                        color: Colors.red[700],
                        fontWeight: FontWeight.w600,
                        fontSize: 12),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          // Overall progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: overallProgress,
              minHeight: 8,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(
                overallProgress >= 1.0 ? Colors.green : Colors.teal,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${(overallProgress * 100).toStringAsFixed(0)}% overall · $completedCount completed',
            style: TextStyle(color: Colors.grey[500], fontSize: 11),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Goal List — reusable for all 3 tabs
// ─────────────────────────────────────────────────────────────
class _GoalList extends StatelessWidget {
  final List<GoalModel> goals;
  final String emptyMessage;
  final IconData emptyIcon;
  final Future<void> Function(GoalModel) onAddProgress;
  final Future<void> Function(GoalModel) onDelete;
  final Future<void> Function(GoalModel)? onPause;
  final Future<void> Function(GoalModel)? onResume;
  final double bottomPadding;

  const _GoalList({
    required this.goals,
    required this.emptyMessage,
    required this.emptyIcon,
    required this.onAddProgress,
    required this.onDelete,
    this.onPause,
    this.onResume,
    this.bottomPadding = 100,
  });

  @override
  Widget build(BuildContext context) {
    if (goals.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(emptyIcon, size: 56, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              emptyMessage,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[500], height: 1.6),
            ),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPadding),
      itemCount: goals.length,
      itemBuilder: (_, i) => _GoalTile(
        goal: goals[i],
        onAddProgress: () => onAddProgress(goals[i]),
        onDelete: () => onDelete(goals[i]),
        onPause: onPause != null ? () => onPause!(goals[i]) : null,
        onResume: onResume != null ? () => onResume!(goals[i]) : null,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Premium Goal Tile (replaces GoalCard for this screen)
// ─────────────────────────────────────────────────────────────
class _GoalTile extends StatelessWidget {
  final GoalModel goal;
  final VoidCallback onAddProgress;
  final VoidCallback onDelete;
  final VoidCallback? onPause;
  final VoidCallback? onResume;

  const _GoalTile({
    required this.goal,
    required this.onAddProgress,
    required this.onDelete,
    this.onPause,
    this.onResume,
  });

  @override
  Widget build(BuildContext context) {
    final inr = NumberFormat.currency(
        locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final progress = goal.progress;
    final isCompleted = goal.isAchieved;
    final isOverdue = goal.isOverdue;
    final days = goal.daysRemaining;

    final Color progressColor = isCompleted
        ? Colors.green
        : isOverdue
            ? Colors.red
            : days <= 7
                ? Colors.orange
                : Colors.teal;

    final String dueLabel = isCompleted
        ? '✅ Completed'
        : isOverdue
            ? '⚠️ Overdue by ${(-days)}d'
            : days == 0
                ? '🔴 Due today'
                : days <= 7
                    ? '🟡 $days days left'
                    : '${DateFormat('d MMM yyyy').format(goal.targetDate)}';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isOverdue && !isCompleted
              ? Colors.red.withOpacity(0.25)
              : Colors.grey.shade100,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Emoji / icon
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: progressColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      goal.emoji?.isNotEmpty == true ? goal.emoji! : '🎯',
                      style: const TextStyle(fontSize: 22),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(goal.title,
                          style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A))),
                      const SizedBox(height: 2),
                      Text(dueLabel,
                          style: TextStyle(
                              fontSize: 12,
                              color: progressColor,
                              fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
                // Actions menu
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert_rounded,
                      color: Colors.grey[400], size: 20),
                  itemBuilder: (_) => [
                    if (onPause != null)
                      const PopupMenuItem(
                          value: 'pause',
                          child: Row(children: [
                            Icon(Icons.pause_rounded, size: 18),
                            SizedBox(width: 8),
                            Text('Pause Goal'),
                          ])),
                    if (onResume != null)
                      const PopupMenuItem(
                          value: 'resume',
                          child: Row(children: [
                            Icon(Icons.play_arrow_rounded, size: 18),
                            SizedBox(width: 8),
                            Text('Resume Goal'),
                          ])),
                    const PopupMenuItem(
                        value: 'delete',
                        child: Row(children: [
                          Icon(Icons.delete_outline_rounded,
                              size: 18, color: Colors.red),
                          SizedBox(width: 8),
                          Text('Delete',
                              style: TextStyle(color: Colors.red)),
                        ])),
                  ],
                  onSelected: (val) {
                    if (val == 'pause') onPause?.call();
                    if (val == 'resume') onResume?.call();
                    if (val == 'delete') onDelete();
                  },
                ),
              ],
            ),

            const SizedBox(height: 14),

            // ── Progress Bar ───────────────────────────────────
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 8,
                backgroundColor: Colors.grey[100],
                valueColor: AlwaysStoppedAnimation<Color>(progressColor),
              ),
            ),
            const SizedBox(height: 8),

            // ── Amounts Row ────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${inr.format(goal.savedAmount)} saved',
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[700]),
                ),
                Text(
                  '${(progress * 100).toStringAsFixed(0)}% of ${inr.format(goal.targetAmount)}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),

            // ── Required per month ─────────────────────────────
            if (!isCompleted && goal.amountRemaining > 0 && days > 0) ...[
              const SizedBox(height: 4),
              Text(
                'Save ${inr.format(goal.requiredPerMonth)}/month to hit target',
                style: TextStyle(
                    fontSize: 11, color: Colors.grey[400]),
              ),
            ],

            const SizedBox(height: 12),

            // ── Add Savings button ─────────────────────────────
            if (!isCompleted)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.teal[700],
                    side: BorderSide(color: Colors.teal.shade200),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: onAddProgress,
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Add Savings',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
