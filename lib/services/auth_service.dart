import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final _auth = FirebaseAuth.instance;
  final _firestore = FirebaseFirestore.instance;
  final _googleSignIn = GoogleSignIn();

  String? currentUserPhone; // New: store E.164 phone for global use

  /// Records one app-open event per session into activityLog subcollection.
  /// Structure: users/{phone}/activityLog/{date}  →  { date, openCount (incremented), lastOpenAt }
  Future<void> _recordActivityLog(String phone) async {
    try {
      final today = DateTime.now().toIso8601String().split('T')[0]; // YYYY-MM-DD
      final logRef = _firestore
          .collection('users')
          .doc(phone)
          .collection('activityLog')
          .doc(today);
      await logRef.set({
        'date': today,
        'openCount': FieldValue.increment(1),
        'lastOpenAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      // NEW: Update parent user doc with last log date so Admin Dashboard can filter active users.
      await _firestore.collection('users').doc(phone).set({
        'lastLogDate': today,
        'lastLogAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (_) {
      // non-critical — don't block login
    }
  }

  /// Google Sign-In (Phone is primary ID in Firestore)
  Future<User?> signInWithGoogle({
    required String phone,
    String? countryCode,
  }) async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null; // User cancelled

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final userCredential = await _auth.signInWithCredential(credential);

    final user = userCredential.user;
    if (user != null) {
      final e164Phone =
      phone.startsWith('+') ? phone : '${countryCode ?? "+91"}$phone';
      currentUserPhone = e164Phone;

      final docRef = _firestore.collection('users').doc(e164Phone);
      final doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({
          'phone': e164Phone,
          'name': user.displayName ?? '',
          'email': user.email ?? '',
          'avatar': user.photoURL ?? '',
          'country': '',
          'currency': '',
          'onboarded': false,
          'createdAt': FieldValue.serverTimestamp(),
        });
      } else {
        // Optional: sync display name / avatar if changed
        await docRef.update({
          'name': user.displayName ?? '',
          'email': user.email ?? '',
          'avatar': user.photoURL ?? '',
        });
      }
      // Record session
      await _recordActivityLog(e164Phone);
    }
    return user;
  }

  /// Phone Auth (OTP-based) — Creates/Updates Firestore doc
  Future<void> signInWithPhone(
      String phone,
      Function(String, int?) codeSent,
      Function(AuthCredential) verificationCompleted,
      String? countryCode,
      ) async {
    final e164Phone =
    phone.startsWith('+') ? phone : '${countryCode ?? "+91"}$phone';
    currentUserPhone = e164Phone;

    await _auth.verifyPhoneNumber(
      phoneNumber: e164Phone,
      verificationCompleted: (credential) async {
        await _auth.signInWithCredential(credential);

        final user = _auth.currentUser;
        if (user != null) {
          final docRef = _firestore.collection('users').doc(e164Phone);
          final doc = await docRef.get();
          if (!doc.exists) {
            await docRef.set({
              'phone': e164Phone,
              'name': '',
              'email': '',
              'avatar': '',
              'country': '',
              'currency': '',
              'onboarded': false,
              'createdAt': FieldValue.serverTimestamp(),
            });
          }
          // Record session
          await _recordActivityLog(e164Phone);
        }
        verificationCompleted(credential);
      },
      verificationFailed: (e) => throw Exception(e.message),
      codeSent: (verificationId, resendToken) =>
          codeSent(verificationId, resendToken),
      codeAutoRetrievalTimeout: (verificationId) {},
    );
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
    currentUserPhone = null;
  }

  User? get currentUser => _auth.currentUser;
}
