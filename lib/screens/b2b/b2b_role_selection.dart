import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/b2b_language_service.dart';

class B2BRoleSelectionScreen extends StatefulWidget {
  final String userId; // The actual logged-in user ID
  const B2BRoleSelectionScreen({required this.userId, super.key});

  @override
  State<B2BRoleSelectionScreen> createState() => _B2BRoleSelectionScreenState();
}

class _B2BRoleSelectionScreenState extends State<B2BRoleSelectionScreen> {
  final B2BLanguageService lang = B2BLanguageService();
  bool _isLoading = true;
  List<Map<String, dynamic>> _employers = [];

  @override
  void initState() {
    super.initState();
    _checkRoles();
  }

  Future<void> _checkRoles() async {
    try {
      final doc = await FirebaseFirestore.instance.collection('users').doc(widget.userId).get();
      if (doc.exists && doc.data()!.containsKey('employers')) {
        final List<dynamic> employerIds = doc.data()!['employers'];
        
        List<Map<String, dynamic>> finalEmployers = [];
        for (final empId in employerIds) {
          try {
             final empDoc = await FirebaseFirestore.instance.collection('users').doc(empId).get();
             if (empDoc.exists) {
               final businessName = empDoc.data()!['businessName'] ?? 'Business';
               finalEmployers.add({'id': empId, 'name': businessName});
             }
          } catch (_) {}
        }

        if (mounted) {
          setState(() {
            _employers = finalEmployers;
          });
        }
      }
    } catch (_) {}

    if (mounted) {
      if (_employers.isEmpty) {
         // Not staff anywhere, proceed normally to their own Dashboard
         Navigator.pushReplacementNamed(context, '/b2b/dashboard', arguments: widget.userId);
      } else {
         setState(() => _isLoading = false);
      }
    }
  }

  void _proceedAsOwner() {
    Navigator.pushReplacementNamed(context, '/b2b/dashboard', arguments: widget.userId);
  }

  void _proceedAsStaff(String employerId) {
    // If they click associate, they masquerade with the employer's ID so data routes to the employer's DB
    Navigator.pushReplacementNamed(context, '/b2b/dashboard', arguments: employerId);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(backgroundColor: Colors.white, body: Center(child: CircularProgressIndicator()));
    }

    return ValueListenableBuilder<String>(
      valueListenable: lang.currentLanguage,
      builder: (context, currentLang, child) {
         return Scaffold(
           backgroundColor: Colors.grey[50],
           appBar: AppBar(
             backgroundColor: Colors.white,
             elevation: 0,
             title: Text(lang.t('Choose Profile'), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
             leading: IconButton(
               icon: const Icon(Icons.arrow_back_rounded, color: Colors.black87),
               onPressed: () => Navigator.pop(context),
             ),
           ),
           body: Padding(
             padding: const EdgeInsets.all(24.0),
             child: Column(
               crossAxisAlignment: CrossAxisAlignment.stretch,
               children: [
                 const Icon(Icons.co_present_rounded, size: 80, color: Colors.indigo),
                 const SizedBox(height: 24),
                 Text(
                   lang.t('You have been granted access to external businesses.'),
                   textAlign: TextAlign.center,
                   style: const TextStyle(fontSize: 16, color: Colors.black87),
                 ),
                 const SizedBox(height: 32),
                 Text(lang.t('Staff Access:'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
                 const SizedBox(height: 12),
                 ..._employers.map((emp) => Padding(
                   padding: const EdgeInsets.only(bottom: 12.0),
                   child: ElevatedButton.icon(
                     onPressed: () => _proceedAsStaff(emp['id']),
                     icon: const Icon(Icons.business_center_rounded),
                     style: ElevatedButton.styleFrom(
                       backgroundColor: Colors.orange.shade600,
                       foregroundColor: Colors.white,
                       padding: const EdgeInsets.symmetric(vertical: 16),
                       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                     ),
                     label: Text(
                       '${lang.t('Access')} ${emp['name']}',
                       style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                     ),
                   ),
                 )),
                 const Spacer(),
                 Row(
                   children: [
                     const Expanded(child: Divider()),
                     Padding(
                       padding: const EdgeInsets.symmetric(horizontal: 16),
                       child: Text(lang.t('OR'), style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                     ),
                     const Expanded(child: Divider()),
                   ],
                 ),
                 const SizedBox(height: 24),
                 ElevatedButton.icon(
                   onPressed: _proceedAsOwner,
                   icon: const Icon(Icons.storefront_rounded),
                   style: ElevatedButton.styleFrom(
                     backgroundColor: Colors.indigo,
                     foregroundColor: Colors.white,
                     padding: const EdgeInsets.symmetric(vertical: 16),
                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                   ),
                   label: Text(
                     lang.t('Continue to My Business'),
                     style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
