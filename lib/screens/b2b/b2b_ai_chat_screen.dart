import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../../models/ai_message.dart';
import '../../services/ai/ai_chat_service.dart';
import '../../services/subscription_service.dart';
import '../../services/local_database_helper.dart';
import '../../fiinny_brain/services/gpt_service.dart';
import '../../fiinny_brain/fiinny_user_snapshot.dart';
import '../../themes/tokens.dart';
import '../premium/upgrade_screen.dart';
import 'dart:convert';

class B2BAiChatScreen extends StatefulWidget {
  final String userId; // phone number - same as personal AI

  const B2BAiChatScreen({required this.userId, super.key});

  @override
  State<B2BAiChatScreen> createState() => _B2BAiChatScreenState();
}

class _B2BAiChatScreenState extends State<B2BAiChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AiChatService _chatService = AiChatService();

  bool _isProcessing = false;
  String? _currentSessionId;

  // Speech
  final SpeechToText _speechToText = SpeechToText();
  bool _speechEnabled = false;
  bool _isListening = false;

  // B2B business context (loaded from SQLite)
  Map<String, dynamic> _b2bContext = {};
  String _businessName = '';

  @override
  void initState() {
    super.initState();
    _initSession();
    _initSpeech();
    _loadB2BContext();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initSession() async {
    final sessionId = await _chatService.getOrCreateSession(widget.userId);
    if (mounted) setState(() => _currentSessionId = sessionId);
  }

  void _initSpeech() async {
    try {
      _speechEnabled = await _speechToText.initialize(
        onError: (v) => debugPrint('Speech error: $v'),
      );
      if (mounted) setState(() {});
    } catch (_) {}
  }

  void _startListening() async {
    await _speechToText.listen(onResult: (result) {
      setState(() {
        _controller.text = result.recognizedWords;
        _controller.selection = TextSelection.fromPosition(
            TextPosition(offset: _controller.text.length));
        if (result.finalResult) _isListening = false;
      });
    });
    if (mounted) setState(() => _isListening = true);
  }

  void _stopListening() async {
    await _speechToText.stop();
    if (mounted) setState(() => _isListening = false);
  }

  /// Load real B2B data from SQLite to give AI smarter business intelligence context
  Future<void> _loadB2BContext() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final bName = prefs.getString('b2b_business_name_${widget.userId}') ?? 'My Business';
      final db = await LocalDatabaseHelper.instance.database;
      final today = DateTime.now();
      final todayStr = today.toIso8601String().substring(0, 10);

      // ── Invoices summary ────────────────────────────────────────────
      final invoiceCount = await db.rawQuery(
          "SELECT count(*) as cnt, IFNULL(SUM(totalAmount),0) as rev FROM invoices");
      final todayInv = await db.rawQuery(
          "SELECT count(*) as cnt, IFNULL(SUM(totalAmount),0) as rev FROM invoices WHERE createdAt LIKE ?",
          ['$todayStr%']);

      // Per-customer invoice stats: order count + total spend + last order date
      final customerInvoiceStats = await db.rawQuery('''
        SELECT
          customerPhone,
          customerName,
          count(*) as orderCount,
          IFNULL(SUM(totalAmount),0) as totalSpend,
          MAX(createdAt) as lastOrderDate
        FROM invoices
        WHERE customerPhone != '' AND customerPhone NOT LIKE 'NAMEONLY%'
        GROUP BY customerPhone
        ORDER BY totalSpend DESC
        LIMIT 30
      ''');

      // ── Khata (udhari) ────────────────────────────────────────────
      final udhari = await db.rawQuery("SELECT IFNULL(SUM(amount),0) as total FROM khata WHERE type='given'");
      final jama  = await db.rawQuery("SELECT IFNULL(SUM(amount),0) as total FROM khata WHERE type='received'");

      // Per-customer net balance + last payment date
      final customerKhata = await db.rawQuery('''
        SELECT
          c.contactId as phone,
          c.name as customerName,
          IFNULL(SUM(CASE WHEN k.type='given'    THEN k.amount ELSE 0 END), 0) as totalGiven,
          IFNULL(SUM(CASE WHEN k.type='received' THEN k.amount ELSE 0 END), 0) as totalReceived,
          MAX(CASE WHEN k.type='received' THEN k.createdAt ELSE NULL END) as lastPaymentDate,
          MIN(k.createdAt) as firstTransactionDate,
          COUNT(k._id) as transactionCount
        FROM b2b_contacts c
        LEFT JOIN khata k ON c.contactId = k.customerId
        WHERE c.type = 'CUSTOMER'
        GROUP BY c.contactId
        HAVING totalGiven > totalReceived
        ORDER BY (totalGiven - totalReceived) DESC
        LIMIT 20
      ''');

      // Build enriched debtor list with priority score
      final double avgUdhari = customerKhata.isEmpty ? 0 :
          customerKhata.map((r) => ((r['totalGiven'] as num? ?? 0) - (r['totalReceived'] as num? ?? 0)).toDouble())
              .reduce((a, b) => a + b) / customerKhata.length;

      final List<Map<String, dynamic>> debtorPriority = [];
      for (final r in customerKhata) {
        final given    = (r['totalGiven'] as num?)?.toDouble() ?? 0;
        final received = (r['totalReceived'] as num?)?.toDouble() ?? 0;
        final net      = given - received;
        if (net <= 0) continue;

        final lastPayStr = r['lastPaymentDate'] as String?;
        int daysSincePayment = 999;
        if (lastPayStr != null && lastPayStr.isNotEmpty) {
          try {
            daysSincePayment = today.difference(DateTime.parse(lastPayStr)).inDays;
          } catch (_) {}
        }

        // Find order frequency for this customer from invoice stats
        final phone = r['phone'] as String? ?? '';
        final invoiceStat = customerInvoiceStats.firstWhere(
          (s) => (s['customerPhone'] as String? ?? '') == phone,
          orElse: () => {},
        );
        final orderCount = (invoiceStat['orderCount'] as int?) ?? 0;
        final avgOrderValue = orderCount > 0
            ? ((invoiceStat['totalSpend'] as num?)?.toDouble() ?? 0) / orderCount
            : 0.0;

        // Priority score: higher = call first
        // Formula: net_udhari × days_since_payment / (1 + order_frequency_bonus)
        // Regular customers (high orders) get slight grace (lower priority score)
        final frequencyBonus = orderCount >= 10 ? 2.0 : (orderCount >= 5 ? 1.5 : 1.0);
        final priorityScore = (net * (daysSincePayment + 1)) / frequencyBonus;
        final isAboveAverage = net > avgUdhari;
        final isRegular = orderCount >= 5;

        String urgencyLevel;
        if (daysSincePayment > 60 || (!isRegular && net > avgUdhari)) {
          urgencyLevel = '🔴 HIGH';
        } else if (daysSincePayment > 30 || net > avgUdhari) {
          urgencyLevel = '🟡 MEDIUM';
        } else {
          urgencyLevel = '🟢 LOW';
        }

        debtorPriority.add({
          'name': r['customerName'],
          'phone': phone,
          'netUdhari': '₹${net.toStringAsFixed(0)}',
          'daysSincePayment': lastPayStr == null ? 'Never paid' : '${daysSincePayment}d ago',
          'orderCount': orderCount,
          'avgOrder': '₹${avgOrderValue.toStringAsFixed(0)}',
          'isRegular': isRegular,
          'isAboveAverage': isAboveAverage,
          'urgency': urgencyLevel,
          'priorityScore': priorityScore.toStringAsFixed(0),
          'advice': isRegular && !isAboveAverage
              ? 'Regular customer — send gentle reminder'
              : isAboveAverage
                  ? 'High balance — call directly or visit'
                  : 'Low priority — WhatsApp reminder sufficient',
        });
      }

      // Sort by priority score descending
      debtorPriority.sort((a, b) =>
          double.parse(b['priorityScore']).compareTo(double.parse(a['priorityScore'])));

      // ── Inventory ────────────────────────────────────────────────
      final inventory  = await db.query('inventory', orderBy: 'name ASC', limit: 20);
      final stockCount = await db.rawQuery(
          "SELECT count(*) as cnt, IFNULL(SUM(stockCount),0) as units FROM inventory");
      final lowStock   = await db.rawQuery(
          "SELECT name, stockCount FROM inventory WHERE stockCount < 5 ORDER BY stockCount ASC LIMIT 10");

      // Contacts
      final contacts = await db.rawQuery("SELECT count(*) as cnt FROM b2b_contacts WHERE type='CUSTOMER'");
      final suppliers = await db.rawQuery("SELECT count(*) as cnt FROM b2b_contacts WHERE type='SUPPLIER'");

      if (mounted) {
        setState(() {
          _businessName = bName;
          _b2bContext = {
            'businessName': bName,
            'today': todayStr,
            // Invoices
            'totalInvoices': invoiceCount.first['cnt'],
            'totalRevenue': invoiceCount.first['rev'],
            'todayBills': todayInv.first['cnt'],
            'todayRevenue': todayInv.first['rev'],
            // Udhari
            'totalGiven':    udhari.first['total'],
            'totalReceived': jama.first['total'],
            'netUdhari': ((udhari.first['total'] as num?)?.toDouble() ?? 0)
                       - ((jama.first['total'] as num?)?.toDouble() ?? 0),
            'averageUdhariPerCustomer': avgUdhari.toStringAsFixed(0),
            // Priority call list
            'udhariPriorityList': debtorPriority,
            'totalUdhariCustomers': customerKhata.length,
            // Inventory
            'inventoryItems': stockCount.first['cnt'],
            'totalStockUnits': stockCount.first['units'],
            'stockList': inventory
                .map((i) => '${i["name"]} (stock:${i["stockCount"]}, price:₹${i["rate"] ?? i["price"]})')
                .toList(),
            'lowStockAlerts': lowStock.map((i) => '${i["name"]} (only ${i["stockCount"]} left)').toList(),
            // Contacts
            'customerCount': contacts.first['cnt'],
            'supplierCount': suppliers.first['cnt'],
          };
        });
      }
    } catch (e) {
      debugPrint('[B2BAI] Context load error: $e');
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _currentSessionId == null) return;

    final allowed = await _checkAndConsumeDailyLimit();
    if (!allowed) return;

    setState(() => _isProcessing = true);

    try {
      await _chatService.sendUserMessage(widget.userId, _currentSessionId!, text);
      _controller.clear();
      _scrollToBottom();

      // Build enriched query with B2B smart context
      final contextJson = jsonEncode(_b2bContext);
      final enrichedQuery = '''
[Fiinny AI – B2B Business Intelligence Mode]

You are a sharp, warm, Hindi-English business advisor for Indian small businesses. You have access to REAL business data below. Use it to give SPECIFIC, ACTIONABLE advice.

BUSINESS DATA:
$contextJson

IMPORTANT INSTRUCTIONS:
1. When asked "whom to call first" or udhari priority questions:
   - Use the "udhariPriorityList" field which is already ranked by priority score
   - 🔴 HIGH urgency = call directly or visit in person
   - 🟡 MEDIUM urgency = call on phone
   - 🟢 LOW urgency = WhatsApp reminder is enough
   - isRegular customers (5+ orders) deserve more patience — don't shame them, send a polite reminder
   - isAboveAverage customers (balance > average) need priority attention regardless of regularity
   - daysSincePayment > 60 days = critical, must act now

2. Give advice in simple Hinglish (mix of Hindi words + English), like a wise dukaan advisor would.

3. Always be specific with names, amounts, and dates from the data. Never give generic advice.

4. For inventory questions, highlight lowStockAlerts if any items are running low.

5. End each answer with a motivational dukaan gyan or business tip (1 line).

USER ASKED: $text
''';

      final response = await GptService.chatWithContext(
        enrichedQuery,
        FiinnyUserSnapshot.generate(transactions: [], expenses: [], goals: []),
        await _chatService.getRecentMessages(widget.userId, _currentSessionId!),
        widget.userId,
      );

      if (!mounted) return;

      final aiText = response ??
          "I'm having trouble right now. Please check your internet connection and try again.";

      await _chatService.addAiResponse(widget.userId, _currentSessionId!, aiText);
      _scrollToBottom();
    } catch (e) {
      if (_currentSessionId != null && mounted) {
        await _chatService.addAiResponse(
            widget.userId, _currentSessionId!, "Something went wrong. Please try again.");
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(0,
            duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  Future<bool> _checkAndConsumeDailyLimit() async {
    final sub = Provider.of<SubscriptionService>(context, listen: false);
    if (sub.isPro) return true;
    final int limit = sub.isPremium ? 20 : 10;

    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    // Shares same daily limit key as personal AI
    final key = 'brain_prompts_${now.year}_${now.month}_${now.day}';
    final count = prefs.getInt(key) ?? 0;

    if (count >= limit) {
      _showLimitDialog(limit, sub.isPremium);
      return false;
    }
    await prefs.setInt(key, count + 1);
    return true;
  }

  void _showLimitDialog(int limit, bool isPremium) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Daily Limit Reached'),
        content: Text(isPremium
            ? "You've used your $limit Premium prompts today. Upgrade to Pro for unlimited access!"
            : "You've used your $limit free prompts. Upgrade for more!"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("OK")),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(context, MaterialPageRoute(builder: (_) => const UpgradeScreen()));
            },
            style: FilledButton.styleFrom(backgroundColor: Fx.mintDark),
            child: const Text("Upgrade"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
        title: Row(
          children: [
            const _B2BAISparkle(size: 26),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Fiinny AI", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                if (_businessName.isNotEmpty)
                  Text(_businessName,
                      style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.normal)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Clear chat',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Clear Chat'),
                  content: const Text('Clear all messages in this session?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                    TextButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Clear', style: TextStyle(color: Colors.red))),
                  ],
                ),
              );
              if (confirm == true && _currentSessionId != null) {
                await _chatService.clearChat(widget.userId, _currentSessionId!);
                final newId = await _chatService.getOrCreateSession(widget.userId);
                if (mounted) setState(() => _currentSessionId = newId);
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Quick suggestion chips
          _buildSuggestionChips(),

          // Messages
          Expanded(
            child: _currentSessionId == null
                ? const Center(child: CircularProgressIndicator())
                : StreamBuilder<List<AiMessage>>(
                    stream: _chatService.streamMessages(widget.userId, _currentSessionId!),
                    builder: (context, snapshot) {
                      final messages = snapshot.data ?? [];
                      if (messages.isEmpty) return _buildEmptyState();
                      return ListView.builder(
                        controller: _scrollController,
                        reverse: true,
                        padding: const EdgeInsets.all(16),
                        itemCount: messages.length,
                        itemBuilder: (ctx, i) => _buildMessageBubble(messages[i]),
                      );
                    },
                  ),
          ),

          _buildInputField(),
        ],
      ),
    );
  }

  Widget _buildSuggestionChips() {
    final chips = [
      '📞 Who to call first?',
      '💰 Udhari summary',
      '📊 Business report',
      '⚠️ Low stock alert',
      '🌟 Best customers',
      '📈 Revenue today',
      '🔴 High urgent debtors',
    ];
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: chips.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (ctx, i) => ActionChip(
          label: Text(chips[i], style: const TextStyle(fontSize: 11)),
          onPressed: () {
            _controller.text = chips[i];
            _sendMessage();
          },
          backgroundColor: Colors.indigo.withOpacity(0.08),
          labelStyle: TextStyle(color: Colors.indigo.shade700),
          side: BorderSide(color: Colors.indigo.withOpacity(0.2)),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.indigo.shade100, Colors.purple.shade100],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const _B2BAISparkle(size: 40),
            ),
            const SizedBox(height: 20),
            const Text('Fiinny AI – Business Assistant',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            Text(
              'Ask me anything about your business:\n'
              '• 📞 Whom should I call first for udhari?\n'
              '• 💼 Business performance & revenue\n'
              '• 📦 Inventory & low stock alerts\n'
              '• 🌟 Best vs risky customers\n'
              '• 💡 Smart advice & gyan',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], height: 1.6),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(AiMessage message) {
    final isUser = message.isUser;
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
              ),
              child: const _B2BAISparkle(size: 18),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser ? Colors.indigo.shade700 : Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [if (!isUser) BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
              ),
              child: Text(
                message.text,
                style: TextStyle(color: isUser ? Colors.white : Colors.black87, height: 1.4),
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            Container(
              width: 30, height: 30,
              decoration: BoxDecoration(color: Colors.grey[300], shape: BoxShape.circle),
              child: const Icon(Icons.person, color: Colors.black54, size: 16),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInputField() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2))],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: InputDecoration(
                  hintText: 'Ask about your business...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  filled: true,
                  fillColor: Colors.grey[100],
                  contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                ),
                maxLines: null,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                enabled: !_isProcessing,
              ),
            ),
            const SizedBox(width: 6),
            // Mic
            Container(
              decoration: BoxDecoration(
                color: _isListening ? Colors.redAccent : Colors.grey[200],
                borderRadius: BorderRadius.circular(24),
              ),
              child: IconButton(
                icon: Icon(_isListening ? Icons.mic : Icons.mic_none,
                    color: _isListening ? Colors.white : Colors.black54),
                onPressed: _speechEnabled ? (_isListening ? _stopListening : _startListening) : null,
              ),
            ),
            const SizedBox(width: 6),
            // Send
            Container(
              decoration: BoxDecoration(
                color: Colors.indigo.shade700,
                borderRadius: BorderRadius.circular(24),
              ),
              child: IconButton(
                icon: _isProcessing
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.send, color: Colors.white),
                onPressed: _isProcessing ? null : _sendMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Animated sparkle icon for B2B AI ────────────────────────────────────────
class _B2BAISparkle extends StatefulWidget {
  final double size;
  const _B2BAISparkle({this.size = 28});

  @override
  State<_B2BAISparkle> createState() => _B2BAISparkleState();
}

class _B2BAISparkleState extends State<_B2BAISparkle> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, child) => ShaderMask(
        blendMode: BlendMode.srcIn,
        shaderCallback: (bounds) => LinearGradient(
          colors: const [
            Color(0xFF3949AB), // Indigo
            Color(0xFF8E24AA), // Purple
            Color(0xFF00ACC1), // Teal
            Color(0xFF3949AB), // Loop
          ],
          transform: GradientRotation(_controller.value * 2 * 3.14159),
        ).createShader(bounds),
        child: Icon(Icons.auto_awesome, size: widget.size, color: Colors.white),
      ),
    );
  }
}
