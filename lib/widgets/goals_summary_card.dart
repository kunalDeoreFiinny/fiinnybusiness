import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class GoalsSummaryCard extends StatelessWidget {
  final String userId;
  final int goalCount;
  final double totalGoalAmount;
  // onAddGoal is used both as card tap and add button — tapping anywhere opens Goals screen
  final VoidCallback onAddGoal;

  const GoalsSummaryCard({
    required this.userId,
    required this.goalCount,
    required this.totalGoalAmount,
    required this.onAddGoal,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final inr = NumberFormat.currency(
        locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    // Pick a color based on how many goals are set
    final bool hasGoals = goalCount > 0;
    final Color amountColor =
        hasGoals ? Colors.green[700]! : Colors.grey[400]!;

    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onAddGoal, // whole card is tappable → opens Goals screen
        child: Padding(
          padding: const EdgeInsets.all(13),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                children: [
                  Text(
                    'Goals',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.teal[800],
                      fontSize: 16,
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.chevron_right,
                      color: Colors.teal[300], size: 20),
                ],
              ),
              const SizedBox(height: 7),

              // Total target amount
              Text(
                hasGoals ? inr.format(totalGoalAmount) : '₹0',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: amountColor,
                ),
              ),

              const SizedBox(height: 4),

              // Bottom row: count + add button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    hasGoals
                        ? '$goalCount active goal${goalCount != 1 ? 's' : ''}'
                        : 'No goals yet',
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey[600]),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add_circle, color: Colors.teal),
                    tooltip: 'Add Goal',
                    padding: EdgeInsets.zero,
                    constraints:
                        const BoxConstraints(minWidth: 28, minHeight: 28),
                    onPressed: onAddGoal,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
