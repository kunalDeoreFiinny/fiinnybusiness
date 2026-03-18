import 'package:flutter/material.dart';
import '../../services/b2b_language_service.dart';
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

  /// Prevents double-tap and shows spinner while loading contacts
  bool _isPickingContact = false;

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
    if (_isPickingContact) return; // prevent double-tap

    if (kIsWeb) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Contact import is not supported on Web.')),
      );
      return;
    }

    setState(() => _isPickingContact = true);

    try {
      // 1. Request permission — show spinner while waiting
      final status = await Permission.contacts.request();
      if (!mounted) return;

      if (!status.isGranted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Contacts permission required.')),
        );
        return;
      }

      // 2. Load contacts (can be slow on large address books)
      final contacts =
          await FlutterContacts.getContacts(withProperties: true);
      if (!mounted) return;

      // 3. Show picker — wait for user selection
      final selected = await showDialog<Contact>(
        context: context,
        builder: (context) => ContactPickerDialog(
          contacts: contacts,
          singleSelect: true,
        ),
      );

      if (!mounted) return;

      if (selected != null && selected.phones.isNotEmpty) {
        final rawPhone = selected.phones.first.number;
        final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
        final formattedPhone = cleanPhone.length >= 10
            ? '+91${cleanPhone.substring(cleanPhone.length - 10)}'
            : '+91$cleanPhone';

        Navigator.of(context).pop({
          'name': selected.displayName,
          'phone': formattedPhone,
          'isCustomer': widget.isCustomer,
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not load contacts: $e')),
      );
    } finally {
      if (mounted) setState(() => _isPickingContact = false);
    }
  }

  void _submit() {
    if (!_isValid) return;

    final name = _nameController.text.trim();
    final rawPhone = _phoneController.text.trim();

    String formattedPhone;
    if (rawPhone.isEmpty) {
      formattedPhone = 'NAMEONLY_${DateTime.now().millisecondsSinceEpoch}';
    } else {
      final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
      formattedPhone = cleanPhone.length >= 10
          ? '+91${cleanPhone.substring(cleanPhone.length - 10)}'
          : '+91$cleanPhone';
    }

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
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.blueGrey),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          title,
          style: const TextStyle(color: Colors.blueGrey, fontWeight: FontWeight.bold),
        ),
      ),
      // SafeArea + SingleChildScrollView ensures all buttons are visible
      // regardless of screen height, keyboard state, or ad banners
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Name field
              TextField(
                controller: _nameController,
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
                    borderSide: BorderSide(color: Colors.green.shade700, width: 1.5),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Phone field (optional)
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  labelText: lang.t('Mobile (Optional)'),
                  prefixIcon: const Icon(Icons.phone_android, color: Colors.blueGrey),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.blueGrey.shade200),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.blueGrey.shade200),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Divider(),
              const SizedBox(height: 20),
              // Save button — enabled only when name is filled
              ElevatedButton(
                onPressed: _isValid ? _submit : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  disabledBackgroundColor: Colors.blueGrey.shade100,
                  disabledForegroundColor: Colors.white,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  lang.t('Save'),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
              // Add via Contacts button — shows spinner while loading
              ElevatedButton(
                onPressed: _isPickingContact ? null : _importContact,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade50,
                  foregroundColor: Colors.green.shade700,
                  disabledBackgroundColor: Colors.grey.shade100,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                ),
                child: _isPickingContact
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.green.shade700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            lang.t('Loading Contacts...'),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.contacts_outlined, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            lang.t('Add via Contacts'),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
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
}
