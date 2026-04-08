import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/budget_model.dart';

class BudgetTreeMap extends StatelessWidget {
  final List<BudgetModel> budgets;
  final double totalIncome;
  final double totalAllocated;

  const BudgetTreeMap({
    super.key,
    required this.budgets,
    required this.totalIncome,
    required this.totalAllocated,
  });

  @override
  Widget build(BuildContext context) {
    if (totalIncome <= 0 && totalAllocated <= 0) {
      return const SizedBox.shrink();
    }

    // 1. Prepare Nodes
    // We add an "Unassigned" block if income > allocated
    List<_TreeMapNode> nodes = [];
    final unassigned = totalIncome - totalAllocated;
    
    // Add real budgets
    for (var b in budgets) {
      if (b.effectiveLimit > 0 && b.category.toLowerCase() != 'overall') {
        nodes.add(_TreeMapNode(
          label: b.category,
          amount: b.effectiveLimit,
          color: _getColorForCategory(b.category),
        ));
      }
    }
    
    // Add unassigned block if strictly positive
    if (unassigned > 0) {
      nodes.add(_TreeMapNode(
        label: "Ready to Assign",
        amount: unassigned,
        color: Colors.grey.shade300,
        textColor: Colors.black87,
      ));
    }

    // Sort descending by amount
    nodes.sort((a, b) => b.amount.compareTo(a.amount));

    if (nodes.isEmpty) return const SizedBox.shrink();

    return Container(
      height: 200,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      clipBehavior: Clip.antiAlias,
      child: _buildTreemapRecursive(nodes, true), // start with horizontal split
    );
  }

  // Recursive alternate splitting (Slice & Dice Treemap)
  Widget _buildTreemapRecursive(List<_TreeMapNode> nodes, bool isHorizontal) {
    if (nodes.isEmpty) return const SizedBox.shrink();
    if (nodes.length == 1) return _buildBlock(nodes.first);

    // Split nodes in half by approximate weight
    double totalWeight = nodes.fold(0.0, (sum, n) => sum + n.amount);
    double currentWeight = 0.0;
    int splitIdx = 0;

    for (int i = 0; i < nodes.length; i++) {
        currentWeight += nodes[i].amount;
        splitIdx = i;
        if (currentWeight >= totalWeight / 2) {
            break;
        }
    }

    // Ensure we don't have empty sides
    if (splitIdx == nodes.length - 1) splitIdx = nodes.length - 2;

    List<_TreeMapNode> groupA = nodes.sublist(0, splitIdx + 1);
    List<_TreeMapNode> groupB = nodes.sublist(splitIdx + 1);

    double weightA = groupA.fold(0.0, (sum, n) => sum + n.amount);
    double weightB = groupB.fold(0.0, (sum, n) => sum + n.amount);

    if (weightA == 0) weightA = 1;
    if (weightB == 0) weightB = 1;

    int flexA = (weightA * 100).toInt();
    int flexB = (weightB * 100).toInt();

    if (isHorizontal) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(flex: flexA, child: _buildTreemapRecursive(groupA, !isHorizontal)),
          Expanded(flex: flexB, child: _buildTreemapRecursive(groupB, !isHorizontal)),
        ],
      );
    } else {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(flex: flexA, child: _buildTreemapRecursive(groupA, !isHorizontal)),
          Expanded(flex: flexB, child: _buildTreemapRecursive(groupB, !isHorizontal)),
        ],
      );
    }
  }

  Widget _buildBlock(_TreeMapNode node) {
    final inrFormat = NumberFormat.compactCurrency(locale: 'en_IN', symbol: '₹');
    return Container(
      decoration: BoxDecoration(
        color: node.color,
        border: Border.all(color: Colors.white, width: 1),
      ),
      padding: const EdgeInsets.all(8),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              node.label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: node.textColor,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
             Text(
              inrFormat.format(node.amount),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: node.textColor.withValues(alpha: 0.9),
                fontWeight: FontWeight.w500,
                fontSize: 10,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Color _getColorForCategory(String category) {
    // Generate a consistent color based on string hash
    final hash = category.hashCode;
    const colors = [
      Color(0xFF4CAF50), // Green
      Color(0xFF2196F3), // Blue
      Color(0xFFFF9800), // Orange
      Color(0xFFE91E63), // Pink
      Color(0xFF9C27B0), // Purple
      Color(0xFF00BCD4), // Cyan
      Color(0xFFFFC107), // Amber
      Color(0xFF673AB7), // Deep Purple
      Color(0xFF3F51B5), // Indigo
      Color(0xFF009688), // Teal
    ];
    return colors[hash.abs() % colors.length];
  }
}

class _TreeMapNode {
  final String label;
  final double amount;
  final Color color;
  final Color textColor;

  _TreeMapNode({
    required this.label,
    required this.amount,
    required this.color,
    this.textColor = Colors.white,
  });
}
