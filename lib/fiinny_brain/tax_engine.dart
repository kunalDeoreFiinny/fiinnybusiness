import 'dart:math';
import '../models/transaction_model.dart';
import '../models/tax_profile_model.dart';

class TaxCalculationResult {
  final double grossSalary;
  final double totalDeductions;
  final double taxableIncome;
  final double taxAmount;
  final double cess;
  final double netTaxPayable;
  final Map<String, double> deductionBreakdown;

  TaxCalculationResult({
    required this.grossSalary,
    required this.totalDeductions,
    required this.taxableIncome,
    required this.taxAmount,
    required this.cess,
    required this.netTaxPayable,
    required this.deductionBreakdown,
  });
}

class TaxEngine {
  /// Aggregates transactions into tax buckets for a given financial year.
  static Map<String, double> aggregateTaxData(
      List<TransactionModel> txns, DateTime financialYearStart) {
    Map<String, double> summary = {
      '80C': 0.0, // EPF/PPF/ELSS/Life Insurance
      '80D': 0.0, // Health Insurance
      'HRA_RentPaid': 0.0,
      'Other_Deductions': 0.0,
    };

    final fyEnd = DateTime(financialYearStart.year + 1, 3, 31);

    for (var txn in txns) {
      if (txn.date.isBefore(financialYearStart) || txn.date.isAfter(fyEnd)) {
        continue;
      }

      if (txn.type != 'expense') continue;

      final cat = txn.category.toLowerCase();
      final sub = (txn.note ?? '').toLowerCase() +
          ' ' +
          (txn.source ?? '').toLowerCase();

      // Basic categorization logic mapping Fiinny categories to tax buckets.
      if (cat.contains('insurance') ||
          sub.contains('life insurance') ||
          sub.contains('lic')) {
        summary['80C'] = (summary['80C'] ?? 0) + txn.amount;
      } else if (cat.contains('health') ||
          sub.contains('health insurance') ||
          sub.contains('mediclaim')) {
        summary['80D'] = (summary['80D'] ?? 0) + txn.amount;
      } else if (cat.contains('rent') || sub.contains('rent')) {
        summary['HRA_RentPaid'] = (summary['HRA_RentPaid'] ?? 0) + txn.amount;
      } else if (cat.contains('mutual fund') && sub.contains('elss')) {
        summary['80C'] = (summary['80C'] ?? 0) + txn.amount;
      } else if (sub.contains('ppf') || sub.contains('epf')) {
        summary['80C'] = (summary['80C'] ?? 0) + txn.amount;
      }
    }

    return summary;
  }

  /// Calculates tax under the Old Regime (FY 2023-24 rules as baseline).
  static TaxCalculationResult calculateOldRegime(
      TaxProfileModel profile, Map<String, double> deductions) {
    double gross = profile.declaredSalary;

    // 1. Standard Deduction
    double standardDeduction = min(50000.0, gross);

    // 2. 80C Deduction (Max 1.5L)
    double sec80C = min(150000.0, deductions['80C'] ?? 0.0);

    // 3. 80D Deduction (Max 25k for non-senior, 50k for senior)
    double sec80DLimit = profile.age >= 60 ? 50000.0 : 25000.0;
    double sec80D = min(sec80DLimit, deductions['80D'] ?? 0.0);

    // 4. HRA Exemption (Simplified heuristic assumption: basic = 50% of gross)
    double basicSalary = gross * 0.50;
    double rentPaid = profile.declaredRent > 0
        ? profile.declaredRent
        : (deductions['HRA_RentPaid'] ?? 0.0);
    double rentMinus10PercentBasic = max(0.0, rentPaid - (0.10 * basicSalary));
    double percentageOfBasic =
        profile.isMetro ? 0.50 * basicSalary : 0.40 * basicSalary;

    // HRA is min of: Actual HRA received (assume 20% gross for now), rent - 10% basic, 40%/50% basic
    double actualHraReceived =
        gross * 0.20; // Assumption if employer data missing
    double hraExemption = rentPaid > 0
        ? [actualHraReceived, rentMinus10PercentBasic, percentageOfBasic]
            .reduce(min)
        : 0.0;

    double totalDeductions = standardDeduction + sec80C + sec80D + hraExemption;
    double taxableIncome = max(0.0, gross - totalDeductions);

    // Old Regime Slabs (Below 60 years)
    double tax = 0.0;
    if (profile.age < 60) {
      if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
        tax += 500000 * 0.20; // 5L to 10L
        tax += 250000 * 0.05; // 2.5L to 5L
      } else if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.20;
        tax += 250000 * 0.05; // 2.5L to 5L
      } else if (taxableIncome > 250000) {
        tax += (taxableIncome - 250000) * 0.05;
      }
    } else {
      // Add senior citizen slabs if needed... (simplified for MVP)
    }

    // Rebate 87A (Old regime: taxable income <= 5L gets max 12.5k rebate)
    if (taxableIncome <= 500000) {
      tax = max(0.0, tax - 12500);
    }

    double cess = tax * 0.04;

    return TaxCalculationResult(
      grossSalary: gross,
      totalDeductions: totalDeductions,
      taxableIncome: taxableIncome,
      taxAmount: tax,
      cess: cess,
      netTaxPayable: tax + cess,
      deductionBreakdown: {
        'Standard Deduction': standardDeduction,
        '80C': sec80C,
        '80D': sec80D,
        'HRA': hraExemption,
      },
    );
  }

  /// Calculates tax under the New Regime (FY 2023-24 / 2024-25 Revised Slabs).
  static TaxCalculationResult calculateNewRegime(TaxProfileModel profile) {
    double gross = profile.declaredSalary;

    // Under new regime, Standard Deduction of 50k is available (from FY 23-24)
    double standardDeduction = min(50000.0, gross);
    double totalDeductions = standardDeduction;

    double taxableIncome = max(0.0, gross - totalDeductions);

    // New Regime Slabs (FY 23-24 onwards)
    // 0-3L: Nil
    // 3-6L: 5%
    // 6-9L: 10%
    // 9-12L: 15%
    // 12-15L: 20%
    // >15L: 30%
    double tax = 0.0;
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      tax += 300000 * 0.20; // 12-15
      tax += 300000 * 0.15; // 9-12
      tax += 300000 * 0.10; // 6-9
      tax += 300000 * 0.05; // 3-6
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.20;
      tax += 300000 * 0.15;
      tax += 300000 * 0.10;
      tax += 300000 * 0.05;
    } else if (taxableIncome > 900000) {
      tax += (taxableIncome - 900000) * 0.15;
      tax += 300000 * 0.10;
      tax += 300000 * 0.05;
    } else if (taxableIncome > 600000) {
      tax += (taxableIncome - 600000) * 0.10;
      tax += 300000 * 0.05;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    // Rebate 87A (New regime: taxable income <= 7L gets max 25k rebate)
    if (taxableIncome <= 700000) {
      tax = max(0.0, tax - 25000); // effectively 0

      // Marginal relief around 7L
    } else if (taxableIncome > 700000 && taxableIncome <= 727777) {
      // Marginal relief logic: tax payable cannot exceed income above 7L
      double maxTaxPayable = taxableIncome - 700000;
      if (tax > maxTaxPayable) {
        tax = maxTaxPayable;
      }
    }

    double cess = tax * 0.04;

    return TaxCalculationResult(
      grossSalary: gross,
      totalDeductions: totalDeductions,
      taxableIncome: taxableIncome,
      taxAmount: tax,
      cess: cess,
      netTaxPayable: tax + cess,
      deductionBreakdown: {
        'Standard Deduction': standardDeduction,
        '(Other deductions N/A)': 0.0,
      },
    );
  }
}
