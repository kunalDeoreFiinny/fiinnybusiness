import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../models/credit_card_cycle.dart';
import '../../services/credit_card_service.dart';

class CreditCardsSummaryCard extends StatefulWidget {
  const CreditCardsSummaryCard({
    super.key,
    required this.userId,
    this.onOpen,
  });

  final String userId;
  final VoidCallback? onOpen;

  @override
  State<CreditCardsSummaryCard> createState() => _CreditCardsSummaryCardState();
}

class _CreditCardsSummaryCardState extends State<CreditCardsSummaryCard> {
  final CreditCardService _svc = CreditCardService();
  late Future<_Summary> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_Summary> _load() async {
    final cards = await _svc.getUserCards(widget.userId);
    final futures =
        cards.map((card) => _svc.getLatestCycle(widget.userId, card.id)).toList();
    final cycles = await Future.wait(futures);

    final now = DateTime.now();
    int overdue = 0;
    int dueToday = 0;
    int dueSoon = 0;
    double totalDue = 0;

    for (var i = 0; i < cards.length; i++) {
      final CreditCardCycle? cyc = cycles[i];
      // If no cycle, use card-level fields
      final double remaining = cyc != null
          ? math.max(0, cyc.totalDue - cyc.paidAmount)
          : (cards[i].isPaid ? 0 : cards[i].totalDue);

      if (remaining <= 0.01) continue;

      totalDue += remaining;

      final dueDate = cyc?.dueDate ?? cards[i].dueDate;
      if (now.isAfter(dueDate)) {
        overdue++;
      } else {
        final days = dueDate.difference(now).inDays;
        if (days <= 0) {
          dueToday++;
        } else if (days <= 7) {
          dueSoon++;
        }
      }
    }

    return _Summary(
      totalCards: cards.length,
      totalDue: totalDue,
      overdue: overdue,
      dueToday: dueToday,
      dueSoon: dueSoon,
    );
  }

  @override
  Widget build(BuildContext context) {
    final inr = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );

    return FutureBuilder<_Summary>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _shell();
        }
        final summary = snapshot.data ?? const _Summary();
        final hasAlert = summary.overdue > 0 || summary.dueToday > 0;

        return Card(
          elevation: 3,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: widget.onOpen,
            child: Padding(
              padding: const EdgeInsets.all(13),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header row ─────────────────────────────────
                  Row(
                    children: [
                      Text(
                        'Credit Cards',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.teal[800],
                          fontSize: 16,
                        ),
                      ),
                      const Spacer(),
                      if (widget.onOpen != null)
                        Icon(Icons.chevron_right,
                            size: 20, color: Colors.teal[300]),
                    ],
                  ),
                  const SizedBox(height: 7),

                  // ── Total due amount ────────────────────────────
                  Text(
                    summary.totalDue > 0
                        ? inr.format(summary.totalDue)
                        : '₹0',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: hasAlert
                          ? Colors.red[700]
                          : summary.dueSoon > 0
                              ? Colors.orange[700]
                              : Colors.green[700],
                    ),
                  ),

                  // ── Bottom row: status chips + card count ───────
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Status text
                      Expanded(
                        child: Text(
                          _statusText(summary),
                          style: TextStyle(
                            fontSize: 13,
                            color: hasAlert
                                ? Colors.red[600]
                                : Colors.grey[600],
                            fontWeight: hasAlert
                                ? FontWeight.w600
                                : FontWeight.normal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      // Card count badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.teal.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${summary.totalCards} card${summary.totalCards != 1 ? 's' : ''}',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.teal[800],
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _statusText(_Summary s) {
    if (s.totalCards == 0) return 'No cards added yet';
    if (s.totalDue <= 0) return 'All bills paid ✅';
    if (s.overdue > 0) {
      return '⚠️ ${s.overdue} overdue — pay now!';
    }
    if (s.dueToday > 0) {
      return '🔴 ${s.dueToday} due today';
    }
    if (s.dueSoon > 0) {
      return '🟡 ${s.dueSoon} due within 7 days';
    }
    return 'Total bill outstanding';
  }

  Widget _shell() {
    return Card(
      elevation: 3,
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: const Padding(
        padding: EdgeInsets.all(13),
        child: SizedBox(
          height: 72,
          child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
        ),
      ),
    );
  }
}

class _Summary {
  const _Summary({
    this.totalCards = 0,
    this.totalDue = 0,
    this.overdue = 0,
    this.dueToday = 0,
    this.dueSoon = 0,
  });

  final int totalCards;
  final double totalDue;
  final int overdue;
  final int dueToday;
  final int dueSoon;
}
