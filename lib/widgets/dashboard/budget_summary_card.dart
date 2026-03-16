import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../themes/tokens.dart';
import '../../themes/glass_card.dart';
import '../../models/budget_model.dart';

class BudgetSummaryCard extends StatelessWidget {
  final String userId;
  final List<BudgetModel> budgets;
  final VoidCallback onTap;

  const BudgetSummaryCard({
    required this.userId,
    required this.budgets,
    required this.onTap,
    super.key,
  });

  static final _inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  @override
  Widget build(BuildContext context) {
    double totalLimit = 0;
    double totalSpent = 0;
    
    // Overall calculation
    for (var b in budgets) {
      if (b.category.toLowerCase() == 'overall') {
         // if there's an explicit overall limit, prefer that
         totalLimit += b.limitAmount;
         totalSpent += b.spentAmount;
      } else {
         totalLimit += b.limitAmount;
         totalSpent += b.spentAmount;
      }
    }
    
    // Prevent double counting if there's an overall AND category limits.
    // For simplicity, let's just sum all limits, but user should ideally set EITHER overall OR categories.
    // Actually, proper logic: if 'Overall' exists, maybe use only that for the card? Let's sum all to allow category-only.
    
    // Recalculate correctly if "overall" exists.
    bool hasOverall = budgets.any((b) => b.category.toLowerCase() == 'overall');
    if (hasOverall) {
        totalLimit = budgets.firstWhere((b) => b.category.toLowerCase() == 'overall').limitAmount;
        totalSpent = budgets.firstWhere((b) => b.category.toLowerCase() == 'overall').spentAmount;
    }

    final double progress = totalLimit > 0 ? (totalSpent / totalLimit).clamp(0.0, 1.0) : 0.0;
    final bool isExceeded = totalSpent > totalLimit && totalLimit > 0;
    
    // Color logic
    Color progressColor = Fx.mintDark;
    if (progress > 0.8) progressColor = Fx.warn;
    if (isExceeded) progressColor = Fx.bad;

    final titleStyle = Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700, fontSize: 16);

    final Widget cardBody = GlassCard(
      padding: const EdgeInsets.all(13),
      radius: Fx.r24,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.pie_chart_rounded, color: Fx.mintDark),
              const SizedBox(width: Fx.s8),
              Text("Budget", style: titleStyle),
              const Spacer(),
              Icon(Icons.chevron_right, color: Colors.teal[300], size: 20),
            ],
          ),
          const SizedBox(height: Fx.s12),
          Text(
            _inr.format(totalSpent),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isExceeded ? Fx.bad : Fx.textStrong,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            totalLimit > 0 ? "of ${_inr.format(totalLimit)}" : "No budget set",
            style: Fx.label.copyWith(fontSize: 13, color: Colors.grey[600]),
          ),
          const SizedBox(height: Fx.s12),
          if (totalLimit > 0)
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                minHeight: 6,
              ),
            ),
          if (totalLimit == 0)
            Text("Tap to set up your monthly budget.", style: TextStyle(fontSize: 12, color: Colors.grey[500])),
          if (isExceeded)
            Padding(
               padding: const EdgeInsets.only(top: 4.0),
               child: Text("Budget exceeded!", style: TextStyle(color: Fx.bad, fontSize: 11, fontWeight: FontWeight.bold)),
            )
        ],
      ),
    );

    final radius = BorderRadius.circular(Fx.r24);
    return SizedBox(
      width: double.infinity,
      child: Material(
        color: Colors.transparent,
        borderRadius: radius,
        child: InkWell(
          borderRadius: radius,
          onTap: onTap,
          child: cardBody,
        ),
      ),
    );
  }
}
