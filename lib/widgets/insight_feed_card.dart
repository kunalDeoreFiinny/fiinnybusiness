import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../brain/insight_microcopy.dart';
import '../core/flags/premium_gate.dart';
import '../models/insight_model.dart';
import '../themes/badge.dart';
import '../themes/glass_card.dart';
import '../themes/tokens.dart';

class InsightFeedCard extends StatelessWidget {
  final List<InsightModel> insights;
  final int maxItems;
  final bool showHeader;
  final String? userId;

  const InsightFeedCard({
    super.key,
    required this.insights,
    this.maxItems = 5,
    this.showHeader = true,
    this.userId,
  });

  static final _dt = DateFormat('dd MMM, hh:mm a');

  // merge duplicates by (title|category|type) keeping worst severity + latest time
  List<InsightModel> _prepare(List<InsightModel> list) {
    final map = <String, InsightModel>{};
    for (final i in list) {
      final key = '${i.title}|${i.category}|${i.type.name}';
      final existing = map[key];
      if (existing == null) {
        map[key] = i;
      } else {
        final a = existing.severity ?? 0;
        final b = i.severity ?? 0;
        final worse =
            (b > a) || (b == a && i.timestamp.isAfter(existing.timestamp));
        if (worse) map[key] = i;
      }
    }
    final merged = map.values.toList();
    merged.sort((a, b) {
      final int sa = _severityScore(a.type, a.severity);
      final int sb = _severityScore(b.type, b.severity);
      if (sb != sa) return sb.compareTo(sa);
      return b.timestamp.compareTo(a.timestamp);
    });
    return merged;
  }

  static int _severityScore(InsightType t, int? s) {
    final base = switch (t) {
      InsightType.critical => 3,
      InsightType.warning => 2,
      InsightType.positive => 1,
      _ => 1,
    };
    return (s ?? base).clamp(0, 9);
  }

  Color _color(InsightType type, int? severity) {
    if (type == InsightType.positive) return Fx.good;
    if (type == InsightType.warning) return Fx.warn;
    if (type == InsightType.critical) return Fx.bad;
    if ((severity ?? 0) >= 3) return Fx.bad;
    if (severity == 2) return Fx.warn;
    if (severity == 1) return Fx.mintDark;
    return Fx.text;
  }

  IconData _icon(InsightType type, String? category) {
    switch (category) {
      case 'loan':
        return Icons.account_balance_wallet_rounded;
      case 'asset':
        return Icons.account_balance_rounded;
      case 'goal':
        return Icons.flag_circle_rounded;
      case 'netWorth':
        return Icons.bar_chart_rounded;
      case 'crisis':
        return Icons.error_rounded;
      case 'expense':
        return Icons.trending_up_rounded;
    }
    switch (type) {
      case InsightType.positive:
        return Icons.thumb_up_alt_rounded;
      case InsightType.warning:
        return Icons.warning_amber_rounded;
      case InsightType.critical:
        return Icons.error_rounded;
      default:
        return Icons.insights_rounded;
    }
  }

  String _categoryLabel(String? c) {
    return switch (c) {
      'loan' => 'Loan',
      'asset' => 'Asset',
      'goal' => 'Goal',
      'netWorth' => 'Net Worth',
      'crisis' => 'Crisis',
      'expense' => 'Expense',
      _ => c ?? '',
    };
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inDays >= 1) return '${diff.inDays}d ago';
    if (diff.inHours >= 1) return '${diff.inHours}h ago';
    if (diff.inMinutes >= 1) return '${diff.inMinutes}m ago';
    return 'Just now';
  }

  /// Human-readable explanation of why Fiinny generated this insight
  String _detectionExplanation(InsightModel insight) {
    final cat = insight.category ?? '';
    final type = insight.type;

    if (cat == 'loan' || insight.relatedLoanId != null) {
      return 'Fiinny tracked your outstanding loan EMIs and repayment history. '
          'This insight was generated because a pattern was detected in your loan activity '
          'that may need your attention.';
    }
    if (cat == 'goal' || insight.relatedGoalId != null) {
      return 'Fiinny analysed your savings rate versus your goal target and deadline. '
          'The progress calculation is based on your monthly income and savings contributions.';
    }
    if (cat == 'asset' || insight.relatedAssetId != null) {
      return 'Fiinny monitored your asset portfolio and detected a change in valuation '
          'or a new opportunity based on your current net worth composition.';
    }
    if (cat == 'netWorth') {
      return 'Fiinny calculated your net worth by combining total assets minus total liabilities. '
          'This insight reflects a notable change or milestone in that number.';
    }
    if (cat == 'crisis') {
      return 'Fiinny\'s crisis detection engine compared your monthly expenses against income '
          'and savings thresholds. High spending or low savings triggered this warning.';
    }
    if (cat == 'expense') {
      return 'Fiinny analysed your recent spending patterns and compared them to your '
          'historical averages. An unusual spike or category shift triggered this insight.';
    }
    if (type == InsightType.positive) {
      return 'Fiinny detected a positive trend in your financial data — '
          'such as improved savings, reduced debt, or goal progress.';
    }
    if (type == InsightType.warning || type == InsightType.critical) {
      return 'Fiinny\'s Brain engine flagged this as a concern by analysing your '
          'transactions, balances, and recurring patterns over the past 30–90 days.';
    }
    return 'Fiinny\'s AI engine analysed your transaction history, income, and spending '
        'patterns to generate this personalised insight for you.';
  }

  void _showInsightDetails(BuildContext context, InsightModel insight) {
    final color = _color(insight.type, insight.severity);
    final icon = _icon(insight.type, insight.category);
    final dateFormat = DateFormat('dd MMM yyyy, hh:mm a');
    final fallback = InsightMicrocopy.fallback();
    final description =
        insight.description.isEmpty ? fallback : insight.description;

    // Build severity label
    String severityLabel(int? s) {
      return switch (s) {
        1 => 'Low',
        2 => 'Medium',
        3 => 'High — Needs Attention',
        _ => 'Info',
      };
    }

    // Related entity row helper
    final List<Widget> relatedRows = [];
    if (insight.relatedLoanId != null) {
      relatedRows.add(_DetailRow(label: 'Related Loan', value: insight.relatedLoanId!));
    }
    if (insight.relatedGoalId != null) {
      relatedRows.add(_DetailRow(label: 'Related Goal', value: insight.relatedGoalId!));
    }
    if (insight.relatedAssetId != null) {
      relatedRows.add(_DetailRow(label: 'Related Asset', value: insight.relatedAssetId!));
    }
    if (insight.relatedCreditCardId != null) {
      relatedRows.add(_DetailRow(label: 'Credit Card', value: insight.relatedCreditCardId!));
    }
    if (insight.relatedBillId != null) {
      relatedRows.add(_DetailRow(label: 'Related Bill', value: insight.relatedBillId!));
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return DraggableScrollableSheet(
          initialChildSize: 0.62,
          minChildSize: 0.4,
          maxChildSize: 0.92,
          expand: false,
          builder: (ctx, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // ── Drag handle ──
                  Padding(
                    padding: const EdgeInsets.only(top: 12, bottom: 4),
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // ── Header ──
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(icon, color: color, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                insight.title.isEmpty
                                    ? 'Insight'
                                    : insight.title,
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w800,
                                  height: 1.2,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _timeAgo(insight.timestamp),
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey.shade500),
                              ),
                            ],
                          ),
                        ),
                        if ((insight.category ?? '').isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border:
                                  Border.all(color: Colors.grey.shade300),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _categoryLabel(insight.category),
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.orange.shade800),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const Divider(height: 1),

                  // ── Scrollable body ──
                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                      children: [
                        // Full description
                        Text(
                          description,
                          style: const TextStyle(
                              fontSize: 15,
                              color: Colors.black87,
                              height: 1.5),
                        ),
                        const SizedBox(height: 20),

                        // ── Metadata grid ──
                        _SectionLabel(label: 'Details'),
                        const SizedBox(height: 8),
                        _DetailRow(
                          label: 'Severity',
                          value: severityLabel(insight.severity),
                          valueColor: color,
                        ),
                        _DetailRow(
                          label: 'Detected',
                          value: dateFormat.format(insight.timestamp),
                        ),
                        if ((insight.category ?? '').isNotEmpty)
                          _DetailRow(
                            label: 'Category',
                            value: _categoryLabel(insight.category),
                          ),
                        ...relatedRows,
                        const SizedBox(height: 20),

                        // ── How Fiinny detected this ──
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Fx.mintDark.withValues(alpha: 0.06),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                                color: Fx.mintDark.withValues(alpha: 0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.psychology_alt_rounded,
                                      color: Fx.mintDark, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'How Fiinny came up with this',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: Fx.mintDark,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _detectionExplanation(insight),
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade800,
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),

                        // ── Close button ──
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(ctx),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 14),
                              shape: RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.circular(12)),
                            ),
                            child: const Text('Close'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final prepared = _prepare(insights);
    if (prepared.isEmpty) return const SizedBox.shrink();

    Widget buildCard(List<InsightModel> list) {
      return GlassCard(
        radius: Fx.r24,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showHeader) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    const Icon(Icons.psychology_alt_rounded,
                        color: Fx.mintDark),
                    const SizedBox(width: Fx.s8),
                    Text("Smart Insights", style: Fx.title),
                    const Spacer(),
                    PillBadge("${list.length}",
                        color: Fx.mintDark, icon: Icons.insights_rounded),
                  ],
                ),
              ),
              const Divider(height: 1),
            ],
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              separatorBuilder: (context, index) =>
                  const Divider(height: 1, indent: 56),
              itemBuilder: (context, index) {
                final insight = list[index];
                final color = _color(insight.type, insight.severity);
                final icon = _icon(insight.type, insight.category);
                final fallback = InsightMicrocopy.fallback();

                // Determine badge style
                final Color badgeBg = color.withValues(alpha: 0.1);
                final Color badgeText = color;

                return Padding(
                  key: ValueKey(
                      '${insight.title}|${insight.timestamp.toIso8601String()}'),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(Fx.r12),
                    onTap: () => _showInsightDetails(context, insight),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Icon
                        Container(
                            padding: const EdgeInsets.all(8),
                            child: Icon(icon, color: color, size: 24)),
                        const SizedBox(width: Fx.s12),

                        // Center Content
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                insight.title.isEmpty
                                    ? "No Title"
                                    : insight.title,
                                style: TextStyle(
                                    color: color,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15,
                                    height: 1.2),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                insight.description.isEmpty
                                    ? fallback
                                    : insight.description,
                                style: Fx.label.copyWith(
                                    fontSize: 13,
                                    color: Colors.black87,
                                    height: 1.4),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 8),
                              if (insight.severity != null &&
                                  insight.severity! > 0)
                                Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                        color: badgeBg,
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                    child: Text("Severity: ${insight.severity}",
                                        style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: badgeText)))
                            ],
                          ),
                        ),

                        const SizedBox(width: 8),

                        // Right Meta
                        Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              if ((insight.category ?? '').isNotEmpty)
                                Container(
                                    margin: const EdgeInsets.only(bottom: 6),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                        color: Colors.white,
                                        border: Border.all(
                                            color: Colors.grey.shade300),
                                        borderRadius:
                                            BorderRadius.circular(12)),
                                    child: Text(
                                        _categoryLabel(insight.category),
                                        style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.orange.shade800))),
                              Text(_timeAgo(insight.timestamp),
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey[500],
                                      fontWeight: FontWeight.w500)),
                              const SizedBox(height: 2),
                              Text(_dt.format(insight.timestamp),
                                  style: TextStyle(
                                      fontSize: 10, color: Colors.grey[400]))
                            ])
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      );
    }

    if (userId == null) {
      final display = prepared.take(maxItems).toList();
      return buildCard(display);
    }

    return FutureBuilder<bool>(
      future: PremiumGate.instance.isPremium(userId!),
      builder: (context, snapshot) {
        // Always behave as "Pro" (free for now), or just ignore premium check for UI
        final isPro = snapshot.data == true;
        // We can still keep the item limit logic if desired, or just show maxItems.
        // User asked to remove the badge, implying "give insights in free only".
        // Let's keep the limit logic for now but remove visual upsell,
        // to avoid overwhelming the UI if there are too many.
        final limit =
            (isPro ? maxItems.clamp(5, 20) : maxItems.clamp(3, 6)).toInt();
        final display = prepared.take(limit).toList();
        return buildCard(display);
      },
    );
  }
}

// ─── Private helper widgets for the detail sheet ─────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: Colors.grey.shade500,
        letterSpacing: 0.8,
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  const _DetailRow({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: valueColor ?? Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
