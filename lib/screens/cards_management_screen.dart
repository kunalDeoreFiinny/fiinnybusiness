// lib/screens/cards_management_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/credit_card_model.dart';
import '../services/credit_card_service.dart';
import '../services/subscription_service.dart';
import '../themes/tokens.dart';
import 'credit_cards/add_card_sheet.dart';
import 'credit_cards/card_detail_screen.dart';

class CardsManagementScreen extends StatefulWidget {
  final String userId;
  const CardsManagementScreen({super.key, required this.userId});

  @override
  State<CardsManagementScreen> createState() => _CardsManagementScreenState();
}

class _CardsManagementScreenState extends State<CardsManagementScreen> {
  final _svc = CreditCardService();
  bool _loading = true;
  List<CreditCardModel> _cards = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      _cards = await _svc.getUserCards(widget.userId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error loading cards: $e')));
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    // Sort: overdue first, then by nearest due date
    final sorted = [..._cards]..sort((a, b) {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.dueDate.compareTo(b.dueDate);
      });

    final unpaid = sorted.where((c) => !c.isPaid).toList();
    final totalDue = unpaid.fold(0.0, (s, c) => s + c.totalDue);
    final totalMin = unpaid.fold(0.0, (s, c) => s + c.minDue);
    final overdueCount = unpaid.where((c) => c.isOverdue).length;
    final fmt = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Credit Cards',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        foregroundColor: Colors.black87,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _load,
          ),
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add Card',
            onPressed: () => _showAddCard(context),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : sorted.isEmpty
              ? _buildEmpty(context)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                    children: [
                      // ── Summary Header ──────────────────────────
                      if (totalDue > 0) ...[
                        _buildSummaryBanner(
                          totalDue: totalDue,
                          totalMin: totalMin,
                          overdueCount: overdueCount,
                          fmt: fmt,
                          cardCount: sorted.length,
                        ),
                        const SizedBox(height: 20),
                      ],

                      // ── Section label ───────────────────────────
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          '${sorted.length} Card${sorted.length != 1 ? 's' : ''}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                            color: Color(0xFF1A1A2E),
                          ),
                        ),
                      ),

                      // ── Card Tiles ──────────────────────────────
                      ...sorted.map((card) => Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: _CreditCardTile(
                              card: card,
                              userId: widget.userId,
                              svc: _svc,
                              fmt: fmt,
                              onTap: () => _openDetail(card),
                              onMarkPaid: () async {
                                await _svc.markCardBillPaid(
                                    widget.userId, card.id, DateTime.now());
                                await _load();
                              },
                            ),
                          )),
                    ],
                  ),
                ),
      floatingActionButton: sorted.isNotEmpty
          ? FloatingActionButton.extended(
              backgroundColor: Fx.mintDark,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Add Card',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              onPressed: () => _showAddCard(context),
            )
          : null,
    );
  }

  Widget _buildSummaryBanner({
    required double totalDue,
    required double totalMin,
    required int overdueCount,
    required NumberFormat fmt,
    required int cardCount,
  }) {
    final hasOverdue = overdueCount > 0;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: hasOverdue
              ? [const Color(0xFFFF416C), const Color(0xFFFF4B2B)]
              : [Fx.mintDark, const Color(0xFF00B09B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: (hasOverdue ? Colors.red : Fx.mintDark).withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasOverdue)
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded,
                    color: Colors.white, size: 16),
                const SizedBox(width: 6),
                Text(
                  '$overdueCount card${overdueCount != 1 ? 's' : ''} overdue — act now!',
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 13),
                ),
              ],
            )
          else
            const Text(
              'Outstanding Bills',
              style: TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
                  fontWeight: FontWeight.w500),
            ),
          const SizedBox(height: 8),
          Text(
            fmt.format(totalDue),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w800,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _summaryChip(
                label: 'Min Due Total',
                value: fmt.format(totalMin),
                icon: Icons.payments_outlined,
              ),
              const SizedBox(width: 12),
              _summaryChip(
                label: 'Cards',
                value: '$cardCount',
                icon: Icons.credit_card_rounded,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _summaryChip(
      {required String label, required String value, required IconData icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(label,
                  style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.w500)),
              Text(value,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: Fx.mint.withOpacity(0.1),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Icon(Icons.credit_card_rounded,
                  size: 44, color: Fx.mintDark),
            ),
            const SizedBox(height: 24),
            const Text(
              'No Credit Cards Yet',
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1A1A2E)),
            ),
            const SizedBox(height: 8),
            Text(
              'Add your cards to track bills,\ndue dates, and min payments',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[500], height: 1.6),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: Fx.mintDark,
                padding: const EdgeInsets.symmetric(
                    horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Add Your First Card',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              onPressed: () => _showAddCard(context),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showAddCard(BuildContext context) async {
    final sub = Provider.of<SubscriptionService>(context, listen: false);
    if (!sub.isPremium && _cards.isNotEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Free plan: max 1 card. Upgrade for more.'),
          action: SnackBarAction(
              label: 'Upgrade',
              onPressed: () => Navigator.pushNamed(context, '/premium')),
        ),
      );
      return;
    }
    final added = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => AddCardSheet(userId: widget.userId),
    );
    if (added == true && mounted) await _load();
  }

  void _openDetail(CreditCardModel card) {
    Navigator.of(context)
        .push(MaterialPageRoute(
          builder: (_) =>
              CardDetailScreen(userId: widget.userId, card: card),
        ))
        .then((_) => _load());
  }
}

// ─────────────────────────────────────────────────────────────
// Premium Credit Card Tile
// ─────────────────────────────────────────────────────────────
class _CreditCardTile extends StatelessWidget {
  final CreditCardModel card;
  final String userId;
  final CreditCardService svc;
  final NumberFormat fmt;
  final VoidCallback onTap;
  final VoidCallback onMarkPaid;

  const _CreditCardTile({
    required this.card,
    required this.userId,
    required this.svc,
    required this.fmt,
    required this.onTap,
    required this.onMarkPaid,
  });

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final days = card.dueDate.difference(now).inDays;
    final isOverdue = card.isOverdue;
    final isPaid = card.isPaid;

    // Gradient based on urgency
    final List<Color> cardGradient = _cardGradient();

    // Urgency text + color
    final String urgencyText = isPaid
        ? 'Bill Paid ✅'
        : isOverdue
            ? 'Overdue by ${now.difference(card.dueDate).inDays}d ⚠️'
            : days == 0
                ? 'Due Today!'
                : days == 1
                    ? 'Due Tomorrow'
                    : 'Due in ${days}d';
    final Color urgencyColor = isPaid
        ? Colors.green
        : isOverdue
            ? Colors.red
            : days <= 3
                ? Colors.red
                : days <= 7
                    ? Colors.orange
                    : Colors.green;

    // Credit utilization %
    final double utilPct = (card.creditLimit != null && card.creditLimit! > 0)
        ? (card.totalDue / card.creditLimit! * 100).clamp(0.0, 100.0)
        : 0.0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              // ── Card Visual (the fake credit card top) ─────────
              Container(
                height: 130,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: cardGradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(20)),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          card.cardAlias?.isNotEmpty == true
                              ? card.cardAlias!
                              : card.bankName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const Spacer(),
                        // Chip icon
                        Container(
                          width: 32,
                          height: 24,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Card number
                    Text(
                      '•••• •••• •••• ${card.last4Digits}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          card.cardholderName.isNotEmpty
                              ? card.cardholderName.toUpperCase()
                              : 'CARD HOLDER',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          card.cardType.toUpperCase(),
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // ── Bill Details ────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Column(
                  children: [
                    // Urgency row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: urgencyColor,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              urgencyText,
                              style: TextStyle(
                                color: urgencyColor,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          DateFormat('d MMM yyyy').format(card.dueDate),
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),
                    // 3 stats in a row
                    Row(
                      children: [
                        Expanded(
                          child: _Stat(
                            label: 'Total Due',
                            value: fmt.format(card.totalDue),
                            highlight: !isPaid && card.totalDue > 0,
                          ),
                        ),
                        _vLine(),
                        Expanded(
                          child: _Stat(
                            label: 'Min Due',
                            value: fmt.format(card.minDue),
                            valueColor:
                                isPaid ? Colors.grey : Colors.orange[700]!,
                          ),
                        ),
                        _vLine(),
                        Expanded(
                          child: _Stat(
                            label: 'Statement',
                            value: card.statementDate != null
                                ? DateFormat('d MMM')
                                    .format(card.statementDate!)
                                : '—',
                          ),
                        ),
                      ],
                    ),

                    // Utilization bar
                    if (card.creditLimit != null && card.creditLimit! > 0) ...[
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Credit Usage: ${utilPct.toStringAsFixed(0)}%',
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 12),
                          ),
                          Text(
                            'Limit: ${fmt.format(card.creditLimit!)}',
                            style: TextStyle(
                                color: Colors.grey[500], fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: utilPct / 100,
                          minHeight: 7,
                          backgroundColor: Colors.grey[200],
                          valueColor: AlwaysStoppedAnimation<Color>(
                            utilPct > 80
                                ? Colors.red
                                : utilPct > 50
                                    ? Colors.orange
                                    : Colors.green,
                          ),
                        ),
                      ),
                    ],

                    // Action buttons
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      child: Row(
                        children: [
                          if (!isPaid) ...[
                            Expanded(
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.green[700],
                                  side: BorderSide(
                                      color: Colors.green[300]!),
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(10)),
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 10),
                                ),
                                onPressed: onMarkPaid,
                                child: const Text('Mark Paid',
                                    style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13)),
                              ),
                            ),
                            const SizedBox(width: 10),
                          ],
                          Expanded(
                            child: FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: Fx.mintDark,
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(
                                    vertical: 10),
                              ),
                              onPressed: onTap,
                              child: const Text('View Details',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Color> _cardGradient() {
    final b = card.bankName.toLowerCase();
    if (b.contains('hdfc'))
      return [const Color(0xFF1A237E), const Color(0xFF283593)];
    if (b.contains('icici'))
      return [const Color(0xFFB71C1C), const Color(0xFFC62828)];
    if (b.contains('axis'))
      return [const Color(0xFF4A148C), const Color(0xFF6A1B9A)];
    if (b.contains('sbi'))
      return [const Color(0xFF1565C0), const Color(0xFF1976D2)];
    if (b.contains('kotak'))
      return [const Color(0xFFE65100), const Color(0xFFF57C00)];
    if (b.contains('amex') || b.contains('american'))
      return [const Color(0xFF1B5E20), const Color(0xFF2E7D32)];
    if (b.contains('idfc'))
      return [const Color(0xFF006064), const Color(0xFF00838F)];
    if (b.contains('onecard'))
      return [const Color(0xFF0D0D0D), const Color(0xFF212121)];
    // Default mint/teal
    return [Fx.mintDark, const Color(0xFF00B09B)];
  }

  Widget _vLine() => Container(
        width: 1,
        height: 36,
        color: Colors.grey[200],
        margin: const EdgeInsets.symmetric(horizontal: 8),
      );
}

// ─────────────────────────────────────────────────────────────
// Stat widget
// ─────────────────────────────────────────────────────────────
class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;
  final Color? valueColor;

  const _Stat({
    required this.label,
    required this.value,
    this.highlight = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label,
            style: TextStyle(
                color: Colors.grey[500],
                fontSize: 11,
                fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text(
          value,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: valueColor ??
                (highlight
                    ? const Color(0xFF1A1A2E)
                    : Colors.grey[600]),
            fontSize: 14,
            fontWeight:
                highlight ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
