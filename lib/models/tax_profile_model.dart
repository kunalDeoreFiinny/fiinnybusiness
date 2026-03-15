import 'package:cloud_firestore/cloud_firestore.dart';

class TaxProfileModel {
  String? id;
  String userId;
  String pan;
  DateTime dateOfBirth;
  String? employerName;
  String regimePreference; // 'old' or 'new'
  double declaredSalary;
  bool isMetro; // True = 50% HRA, False = 40% HRA
  double declaredRent;

  TaxProfileModel({
    this.id,
    required this.userId,
    required this.pan,
    required this.dateOfBirth,
    this.employerName,
    this.regimePreference = 'new',
    this.declaredSalary = 0.0,
    this.isMetro = false,
    this.declaredRent = 0.0,
  });

  int get age {
    final today = DateTime.now();
    int a = today.year - dateOfBirth.year;
    if (today.month < dateOfBirth.month ||
        (today.month == dateOfBirth.month && today.day < dateOfBirth.day)) {
      a--;
    }
    return a;
  }

  Map<String, dynamic> toMap() => {
        'userId': userId,
        'pan': pan,
        'dateOfBirth': dateOfBirth.toIso8601String(),
        'employerName': employerName,
        'regimePreference': regimePreference,
        'declaredSalary': declaredSalary,
        'isMetro': isMetro,
        'declaredRent': declaredRent,
      };

  static TaxProfileModel fromMap(Map<String, dynamic> map, {String? id}) {
    return TaxProfileModel(
      id: id ?? map['id'],
      userId: map['userId'] ?? '',
      pan: map['pan'] ?? '',
      dateOfBirth: map['dateOfBirth'] != null
          ? DateTime.tryParse(map['dateOfBirth']) ?? DateTime(1990, 1, 1)
          : DateTime(1990, 1, 1),
      employerName: map['employerName'],
      regimePreference: map['regimePreference'] ?? 'new',
      declaredSalary: (map['declaredSalary'] ?? 0.0).toDouble(),
      isMetro: map['isMetro'] ?? false,
      declaredRent: (map['declaredRent'] ?? 0.0).toDouble(),
    );
  }
}
