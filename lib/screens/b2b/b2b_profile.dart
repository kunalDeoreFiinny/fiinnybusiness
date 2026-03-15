import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/b2b_language_service.dart';

class B2BProfileScreen extends StatefulWidget {
  final String userId;
  const B2BProfileScreen({required this.userId, super.key});

  @override
  State<B2BProfileScreen> createState() => _B2BProfileScreenState();
}

class _B2BProfileScreenState extends State<B2BProfileScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _staffPhoneController = TextEditingController();
  bool _isLoading = true;
  bool _isSaving = false;
  List<Map<String, dynamic>> _staffMembers = [];

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _loadStaff();
  }

  Future<void> _loadStaff() async {
    try {
      final snap = await FirebaseFirestore.instance
          .collection('users')
          .doc(widget.userId)
          .collection('staff')
          .get();
      
      if (mounted) {
        setState(() {
          _staffMembers = snap.docs.map((d) => {'id': d.id, ...d.data()}).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _addStaff() async {
    final rawPhone = _staffPhoneController.text.trim();
    if (rawPhone.isEmpty) return;

    final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
    final formattedPhone = cleanPhone.length >= 10 ? '+91${cleanPhone.substring(cleanPhone.length - 10)}' : '+91$cleanPhone';

    setState(() => _isLoading = true);

    try {
      final batch = FirebaseFirestore.instance.batch();
      
      // 1. Add to owner's staff subcollection
      final staffRef = FirebaseFirestore.instance
          .collection('users')
          .doc(widget.userId)
          .collection('staff')
          .doc(formattedPhone);
          
      batch.set(staffRef, {
        'addedAt': DateTime.now().toIso8601String(),
        'role': 'associate',
        'phone': formattedPhone,
      });

      // 2. Add to staff's employers array (assuming they have logged in at least once or will in the future, we can just merge setting the employers array)
      // Since doc ID for users in Fiinny is often their phone number (if phone auth) or uid.
      // We will query to see if a user has this phone number to get their UID, OR we just set a document with phone number as ID if using Phone Auth.
      // Assuming phone number is the doc ID for phone-auth users:
      final employeeDocRef = FirebaseFirestore.instance.collection('users').doc(formattedPhone);
      batch.set(employeeDocRef, {
        'employers': FieldValue.arrayUnion([widget.userId])
      }, SetOptions(merge: true));

      await batch.commit();

      _staffPhoneController.clear();
      await _loadStaff();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('Staff added successfully.'))));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('Failed to add staff.'))));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _removeStaff(String phoneId) async {
    setState(() => _isLoading = true);
    try {
      final batch = FirebaseFirestore.instance.batch();
      
      final staffRef = FirebaseFirestore.instance
          .collection('users')
          .doc(widget.userId)
          .collection('staff')
          .doc(phoneId);
      batch.delete(staffRef);

      final employeeDocRef = FirebaseFirestore.instance.collection('users').doc(phoneId);
      batch.set(employeeDocRef, {
        'employers': FieldValue.arrayRemove([widget.userId])
      }, SetOptions(merge: true));

      await batch.commit();
      await _loadStaff();
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final localName = prefs.getString('b2b_business_name_${widget.userId}');
    
    if (localName != null && localName.isNotEmpty) {
      _nameController.text = localName;
    } else {
      // Try fetching from firestore if not in prefs
      try {
        final doc = await FirebaseFirestore.instance.collection('users').doc(widget.userId).get();
        if (doc.exists && doc.data() != null) {
          final name = doc.data()!['businessName'] as String?;
          if (name != null) {
            _nameController.text = name;
            await prefs.setString('b2b_business_name_${widget.userId}', name);
          }
        }
      } catch (_) {}
    }
    
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('Please enter a business name.'))));
      return;
    }

    setState(() => _isSaving = true);

    // Save to SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('b2b_business_name_${widget.userId}', name);

    // Save to Firestore
    try {
      await FirebaseFirestore.instance.collection('users').doc(widget.userId).set({
        'businessName': name,
      }, SetOptions(merge: true));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('Profile updated successfully.'))));
        Navigator.pop(context, true); // true indicates a change was made
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang.t('Failed to update cloud profile.'))));
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _staffPhoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 1,
            title: Text(lang.t('Business Profile'), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.black87),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          body: _isLoading 
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.storefront_rounded, size: 60, color: Colors.indigo),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        labelText: lang.t('Business Name'),
                        prefixIcon: const Icon(Icons.business_rounded),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        filled: true,
                        fillColor: Colors.grey[50],
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _isSaving ? null : _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))
                      ),
                      child: _isSaving 
                        ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(lang.t('Save Business Name'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: Divider(),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.people_alt_rounded, color: Colors.indigo),
                        const SizedBox(width: 8),
                        Text(lang.t('Manage Staff / Associates'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _staffPhoneController,
                            keyboardType: TextInputType.phone,
                            decoration: InputDecoration(
                              labelText: lang.t('Staff Phone No.'),
                              prefixText: '+91 ',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        IconButton.filled(
                          onPressed: _isLoading ? null : _addStaff,
                          icon: const Icon(Icons.person_add_rounded),
                          style: IconButton.styleFrom(backgroundColor: Colors.indigo, padding: const EdgeInsets.all(14)),
                        )
                      ],
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: _staffMembers.isEmpty 
                        ? Center(child: Text(lang.t('No staff added yet.'), style: const TextStyle(color: Colors.grey)))
                        : ListView.separated(
                            itemCount: _staffMembers.length,
                            separatorBuilder: (_, __) => const Divider(height: 1),
                            itemBuilder: (context, index) {
                              final staff = _staffMembers[index];
                              return ListTile(
                                leading: const CircleAvatar(backgroundColor: Colors.indigo, child: Icon(Icons.person, color: Colors.white)),
                                title: Text(staff['phone'] ?? staff['id']),
                                subtitle: Text(lang.t('Role: Associate')),
                                trailing: IconButton(
                                  icon: const Icon(Icons.remove_circle_outline_rounded, color: Colors.red),
                                  onPressed: () => _removeStaff(staff['id']),
                                ),
                              );
                            },
                          ),
                    ),
                  ],
                ),
              ),
        );
      }
    );
  }
}
