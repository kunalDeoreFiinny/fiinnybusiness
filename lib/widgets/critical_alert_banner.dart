import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class CriticalAlertBanner extends StatefulWidget {
  final String userId;

  const CriticalAlertBanner({super.key, required this.userId});

  @override
  State<CriticalAlertBanner> createState() => _CriticalAlertBannerState();
}

class _CriticalAlertBannerState extends State<CriticalAlertBanner> {
  // Track which alerts are animating "resolved"
  final Set<String> _resolvingIds = {};
  // Track which alerts are animating "dismissed"
  final Set<String> _dismissingIds = {};

  // ─── Mark as PAID ─────────────────────────────────────────────────────────
  Future<void> _markPaid(String docId, DocumentReference ref) async {
    setState(() => _resolvingIds.add(docId));
    await Future.delayed(const Duration(milliseconds: 1800));
    if (mounted) {
      ref.update({
        'isRead': true,
        'resolution': 'manual_paid',
        'resolvedAt': FieldValue.serverTimestamp(),
      });
      setState(() => _resolvingIds.remove(docId));
    }
  }

  // ─── Dismiss — suppresses until 1st of NEXT month ─────────────────────────
  Future<void> _dismiss(String docId, DocumentReference ref) async {
    setState(() => _dismissingIds.add(docId));
    await Future.delayed(const Duration(milliseconds: 1800));
    if (mounted) {
      final now = DateTime.now();
      // Calculate first day of next month
      final nextMonth = DateTime(now.year, now.month + 1, 1);

      ref.update({
        'isRead': true,
        'resolution': 'dismissed',
        'resolvedAt': FieldValue.serverTimestamp(),
        // Any new alert of same type before this date will also be filtered out
        'suppressedUntil': Timestamp.fromDate(nextMonth),
      });
      setState(() => _dismissingIds.remove(docId));
    }
  }

  // ─── Details bottom sheet ─────────────────────────────────────────────────
  void _showDetails(
      BuildContext context, Map<String, dynamic> data, Color color) {
    final dateFormat = DateFormat('dd MMM yyyy, hh:mm a');

    // Collect meaningful metadata fields to display
    final Map<String, String> metaRows = {};
    void addField(String label, dynamic value) {
      if (value == null) return;
      final str = value.toString().trim();
      if (str.isEmpty || str == 'null') return;
      metaRows[label] = str;
    }

    addField('Source', data['source']);
    addField('Account', data['accountName'] ?? data['account']);
    addField('Amount', data['amount'] != null ? '₹${data['amount']}' : null);
    addField('Due Date', data['dueDate']);
    addField('Detected From', data['detectedFrom']);
    addField('Alert Type', data['alertType'] ?? data['type']);
    addField('Category', data['category']);
    addField(
        'Created At',
        data['createdAt'] is Timestamp
            ? dateFormat.format((data['createdAt'] as Timestamp).toDate())
            : data['createdAt']?.toString());

    // Extra metadata map (some alerts store it nested)
    if (data['metadata'] is Map) {
      (data['metadata'] as Map).forEach((k, v) {
        addField(k.toString(), v);
      });
    }

    // How Fiinny detected this
    final String detectionExplanation = _buildDetectionExplanation(data);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  // Handle
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

                  // Header
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.error_outline_rounded,
                              color: color, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                data['title'] ?? 'Alert Details',
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              if ((data['body'] ?? '').toString().isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 2),
                                  child: Text(
                                    data['body'].toString(),
                                    style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.grey.shade700,
                                        height: 1.3),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Divider(height: 1),

                  // Scrollable content
                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                      children: [
                        // Metadata rows
                        if (metaRows.isNotEmpty) ...[
                          Text(
                            'Alert Details',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.grey.shade500,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ...metaRows.entries.map((e) => _MetaRow(
                                label: e.key,
                                value: e.value,
                                color: color,
                              )),
                          const SizedBox(height: 20),
                        ],

                        // How Fiinny detected this
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.blue.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.psychology_alt_rounded,
                                      color: Colors.blue.shade700, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'How Fiinny detected this',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.blue.shade700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                detectionExplanation,
                                style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.blue.shade900,
                                    height: 1.4),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Close button
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(ctx),
                            style: OutlinedButton.styleFrom(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
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

  /// Builds a human-readable explanation of how Fiinny detected the alert.
  String _buildDetectionExplanation(Map<String, dynamic> data) {
    final source = (data['source'] ?? '').toString().toLowerCase();
    final alertType = (data['alertType'] ?? data['type'] ?? '').toString().toLowerCase();
    final category = (data['category'] ?? '').toString().toLowerCase();
    final detectedFrom = (data['detectedFrom'] ?? '').toString();

    if (detectedFrom.isNotEmpty) {
      return 'Fiinny detected this alert from: "$detectedFrom". '
          'Your transactions were analysed to identify this pattern.';
    }

    if (source.contains('sms') || source.contains('gmail') || source.contains('email')) {
      return 'Fiinny automatically read your bank ${source.contains('sms') ? 'SMS messages' : 'email alerts'} '
          'and detected a transaction issue. The pattern in the message matched a known failure signature, '
          'which triggered this alert.';
    }

    if (category.contains('autopay') || alertType.contains('autopay')) {
      return 'Fiinny monitors your recurring auto-pay schedules. '
          'This alert was raised because an expected auto-payment was not confirmed within the usual window, '
          'which may indicate the payment failed or was declined.';
    }

    if (category.contains('loan') || alertType.contains('emi')) {
      return 'Fiinny tracks your loan EMI due dates and payment confirmations. '
          'This alert was triggered because an EMI payment could not be confirmed on time.';
    }

    if (category.contains('credit_card') || alertType.contains('card')) {
      return 'Fiinny monitors your credit card due dates and payment status. '
          'This alert indicates a potential issue with a credit card payment or bill.';
    }

    return 'Fiinny\'s Brain analysed your recent transaction data and bank alerts to detect this issue. '
        'This could be from an SMS, email, or a pattern match on your spending history. '
        'Please review what action is needed and mark it resolved once done.';
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('users')
          .doc(widget.userId)
          .collection('alerts')
          .where('isRead', isEqualTo: false)
          .where('severity', isEqualTo: 'critical')
          .limit(5) // Fetch a few; client-side filter removes suppressed ones
          .snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const SizedBox.shrink();
        }

        // Client-side filter: skip alerts suppressed until a future date
        final now = DateTime.now();
        final activeDocs = snapshot.data!.docs.where((doc) {
          final data = doc.data() as Map<String, dynamic>;
          final suppressedUntil = data['suppressedUntil'];
          if (suppressedUntil is Timestamp) {
            return suppressedUntil.toDate().isBefore(now);
          }
          return true; // no suppressedUntil means show it
        }).toList();

        if (activeDocs.isEmpty) return const SizedBox.shrink();

        final doc = activeDocs.first;
        final data = doc.data() as Map<String, dynamic>;
        final title = data['title'] ?? 'Critical Alert';
        final body = data['body'] ?? 'Action required.';
        final docId = doc.id;

        final isResolving = _resolvingIds.contains(docId);
        final isDismissing = _dismissingIds.contains(docId);
        final isAnimating = isResolving || isDismissing;

        final Color alertColor =
            isAnimating ? Colors.green.shade600 : Colors.red.shade600;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.only(bottom: 12, left: 14, right: 14),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          decoration: BoxDecoration(
            color: alertColor,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: (isAnimating ? Colors.green : Colors.red)
                    .withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: isAnimating
                ? Row(
                    key: ValueKey('resolved_$docId'),
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.check_circle_rounded,
                          color: Colors.white, size: 28),
                      const SizedBox(width: 12),
                      Text(
                        isResolving ? 'Marked as Paid! 🎉' : 'Resolved ✓',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  )
                : Row(
                    key: ValueKey('alert_$docId'),
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.error_outline_rounded,
                          color: Colors.white, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              body,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                                fontSize: 14,
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 10,
                              runSpacing: 8,
                              children: [
                                // ── Paid Already? ──────────────────
                                _ActionButton(
                                  label: 'Paid Already?',
                                  icon: Icons.check_rounded,
                                  textColor: Colors.red.shade700,
                                  backgroundColor: Colors.white,
                                  onTap: () => _markPaid(docId, doc.reference),
                                ),

                                // ── Details ────────────────────────
                                _ActionButton(
                                  label: 'Details',
                                  icon: Icons.info_outline_rounded,
                                  textColor: Colors.white,
                                  backgroundColor:
                                      Colors.white.withValues(alpha: 0.25),
                                  onTap: () => _showDetails(
                                      context, data, Colors.red.shade700),
                                ),

                                // ── Dismiss ────────────────────────
                                _ActionButton(
                                  label: 'Dismiss',
                                  icon: Icons.close_rounded,
                                  textColor: Colors.white,
                                  backgroundColor:
                                      Colors.white.withValues(alpha: 0.15),
                                  onTap: () => _dismiss(docId, doc.reference),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),
        );
      },
    );
  }
}

// ─── Reusable action button ────────────────────────────────────────────────

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color textColor;
  final Color backgroundColor;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.textColor,
    required this.backgroundColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: textColor),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Metadata row widget ───────────────────────────────────────────────────

class _MetaRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MetaRow({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
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
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
