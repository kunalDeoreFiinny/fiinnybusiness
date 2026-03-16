import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
import '../../core/ads/ads_banner_card.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import '../../widgets/contact_picker_dialog.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class B2BAddCustomerScreen extends StatefulWidget {
  final String userId;
  final bool isCustomer;

  const B2BAddCustomerScreen({
    required this.userId,
    required this.isCustomer,
    super.key,
  });

  @override
  State<B2BAddCustomerScreen> createState() => _B2BAddCustomerScreenState();
}

class _B2BAddCustomerScreenState extends State<B2BAddCustomerScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();

  bool get _isValid {
    return _nameController.text.trim().isNotEmpty;
  }

  @override
  void initState() {
    super.initState();
    _nameController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _importContact() async {
    if (kIsWeb) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contact import is not supported on Web.')));
      return;
    }
    if (!await Permission.contacts.request().isGranted) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contacts permission required.')));
      return;
    }
    if (!mounted) return;
    
    // Capture navigator reference BEFORE any await to avoid !_debugLocked error
    final nav = Navigator.of(context);
    
    final contacts = await FlutterContacts.getContacts(withProperties: true);
    if (!mounted) return;
    
    final selected = await showDialog<Contact>(
      context: context,
      builder: (context) => ContactPickerDialog(
        contacts: contacts,
        singleSelect: true,
      ),
    );

    if (selected != null && selected.phones.isNotEmpty) {
      final rawPhone = selected.phones.first.number;
      final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
      final formattedPhone = cleanPhone.length >= 10 ? '+91${cleanPhone.substring(cleanPhone.length - 10)}' : '+91$cleanPhone';
      
      // Use captured navigator — never use context after async gaps that cross frame boundaries
      nav.pop({
        'name': selected.displayName,
        'phone': formattedPhone,
        'isCustomer': widget.isCustomer,
      });
    }
  }

  void _submit() {
    if (!_isValid) return;
    
    final name = _nameController.text.trim();
    final rawPhone = _phoneController.text.trim();
    
    String formattedPhone;
    if (rawPhone.isEmpty) {
      // Logic for tracking by name only if phone is empty
      formattedPhone = 'NAMEONLY_${DateTime.now().millisecondsSinceEpoch}';
    } else {
      final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
      formattedPhone = cleanPhone.length >= 10 ? '+91${cleanPhone.substring(cleanPhone.length - 10)}' : '+91$cleanPhone';
    }

    // Rather than duplicating save logic, we pop with the result back to dashboard
    Navigator.pop(context, {
      'name': name,
      'phone': formattedPhone,
      'isCustomer': widget.isCustomer,
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isCustomer ? lang.t('Add Customer') : lang.t('Add Supplier');
    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: const AdsBannerCard(
        placement: 'b2b_add_customer_bottom',
        inline: false,
        inlineMaxHeight: 60,
        margin: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: EdgeInsets.zero,
        backgroundColor: Colors.transparent,
        boxShadow: [],
        minHeight: 52,
      ),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.blueGrey),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(title, style: const TextStyle(color: Colors.blueGrey, fontWeight: FontWeight.bold)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _nameController,
              autofocus: true,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: lang.t('Name'),
                labelStyle: TextStyle(color: Colors.green.shade700),
                prefixIcon: const Icon(Icons.account_circle_outlined, color: Colors.blueGrey),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.green.shade700, width: 1.5)
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.green.shade700, width: 2)
                ),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: lang.t('Mobile (Optional)'),
                prefixIcon: const Icon(Icons.phone_android, color: Colors.blueGrey),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.blueGrey.shade200)
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.blueGrey.shade200)
                ),
              ),
            ),
            const SizedBox(height: 40),
            const Divider(),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isValid ? _submit : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green.shade700,
                disabledBackgroundColor: Colors.blueGrey.shade100,
                disabledForegroundColor: Colors.white,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                elevation: 0,
              ),
              child: Text(
                lang.t('Enter Name'),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)
              ),
            ),
            const SizedBox(height: 24),
            TextButton(
              onPressed: _importContact,
              style: TextButton.styleFrom(
                foregroundColor: Colors.green.shade700,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: Text(
                lang.t('Add via Contacts'),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)
              ),
            ),
          ],
        ),
      ),
    );
  }
}
