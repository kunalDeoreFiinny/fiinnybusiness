import { ExpenseItem, IncomeItem } from "@/lib/firestore";

export interface TaxProfile {
    declaredSalary: number;
    declaredRent: number;
    age: number;
    isMetro: boolean;
}

export interface TaxCalculationResult {
    grossSalary: number;
    totalDeductions: number;
    taxableIncome: number;
    taxAmount: number;
    cess: number;
    netTaxPayable: number;
    deductionBreakdown: Record<string, number>;
}

export class TaxEngine {
    /**
     * Aggregates transactions into tax buckets for a given financial year.
     */
    static aggregateTaxData(
        expenses: ExpenseItem[],
        financialYearStart: Date
    ): Record<string, number> {
        const summary: Record<string, number> = {
            '80C': 0.0, // EPF/PPF/ELSS/Life Insurance
            '80D': 0.0, // Health Insurance
            'HRA_RentPaid': 0.0,
            'Other_Deductions': 0.0,
        };

        const fyEnd = new Date(financialYearStart.getFullYear() + 1, 2, 31); // March 31 of next year

        for (const txn of expenses) {
            // Firestore timestamps are converted to dates
            let txnDate = txn.date;
            if (typeof (txnDate as any).toDate === 'function') {
                txnDate = (txnDate as any).toDate();
            }

            if (txnDate < financialYearStart || txnDate > fyEnd) {
                continue;
            }

            const cat = (txn.category || '').toLowerCase();
            const sub = ((txn.note || '') + ' ' + (txn.counterparty || '')).toLowerCase();

            // Basic categorization logic mapping Fiinny categories to tax buckets.
            if (cat.includes('insurance') || sub.includes('life insurance') || sub.includes('lic')) {
                summary['80C'] += txn.amount;
            } else if (cat.includes('health') || sub.includes('health insurance') || sub.includes('mediclaim')) {
                summary['80D'] += txn.amount;
            } else if (cat.includes('rent') || sub.includes('rent')) {
                summary['HRA_RentPaid'] += txn.amount;
            } else if (cat.includes('mutual fund') && sub.includes('elss')) {
                summary['80C'] += txn.amount;
            } else if (sub.includes('ppf') || sub.includes('epf')) {
                summary['80C'] += txn.amount;
            }
        }

        return summary;
    }

    /**
     * Calculates tax under the Old Regime (FY 2023-24 rules as baseline).
     */
    static calculateOldRegime(
        profile: TaxProfile,
        deductions: Record<string, number>
    ): TaxCalculationResult {
        const gross = profile.declaredSalary;

        // 1. Standard Deduction
        const standardDeduction = Math.min(50000.0, gross);

        // 2. 80C Deduction (Max 1.5L)
        const sec80C = Math.min(150000.0, deductions['80C'] || 0.0);

        // 3. 80D Deduction (Max 25k for non-senior, 50k for senior)
        const sec80DLimit = profile.age >= 60 ? 50000.0 : 25000.0;
        const sec80D = Math.min(sec80DLimit, deductions['80D'] || 0.0);

        // 4. HRA Exemption (Simplified heuristic assumption: basic = 50% of gross)
        const basicSalary = gross * 0.50;
        const rentPaid = profile.declaredRent > 0
            ? profile.declaredRent
            : (deductions['HRA_RentPaid'] || 0.0);
        const rentMinus10PercentBasic = Math.max(0.0, rentPaid - (0.10 * basicSalary));
        const percentageOfBasic = profile.isMetro ? 0.50 * basicSalary : 0.40 * basicSalary;

        // HRA is min of: Actual HRA received (assume 20% gross for now), rent - 10% basic, 40%/50% basic
        const actualHraReceived = gross * 0.20; // Assumption if employer data missing
        const hraExemption = rentPaid > 0
            ? Math.min(actualHraReceived, rentMinus10PercentBasic, percentageOfBasic)
            : 0.0;

        const totalDeductions = standardDeduction + sec80C + sec80D + hraExemption;
        const taxableIncome = Math.max(0.0, gross - totalDeductions);

        // Old Regime Slabs (Below 60 years)
        let tax = 0.0;
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
        }

        // Rebate 87A (Old regime: taxable income <= 5L gets max 12.5k rebate)
        if (taxableIncome <= 500000) {
            tax = Math.max(0.0, tax - 12500);
        }

        const cess = tax * 0.04;

        return {
            grossSalary: gross,
            totalDeductions,
            taxableIncome,
            taxAmount: tax,
            cess,
            netTaxPayable: tax + cess,
            deductionBreakdown: {
                'Standard Deduction': standardDeduction,
                '80C': sec80C,
                '80D': sec80D,
                'HRA': hraExemption,
            },
        };
    }

    /**
     * Calculates tax under the New Regime (FY 2023-24 / 2024-25 Revised Slabs).
     */
    static calculateNewRegime(profile: TaxProfile): TaxCalculationResult {
        const gross = profile.declaredSalary;

        // Under new regime, Standard Deduction of 50k is available (from FY 23-24)
        const standardDeduction = Math.min(50000.0, gross);
        const totalDeductions = standardDeduction;

        const taxableIncome = Math.max(0.0, gross - totalDeductions);

        // New Regime Slabs (FY 23-24 onwards)
        let tax = 0.0;
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
            tax = Math.max(0.0, tax - 25000); // effectively 0
        } else if (taxableIncome > 700000 && taxableIncome <= 727777) {
            // Marginal relief logic: tax payable cannot exceed income above 7L
            const maxTaxPayable = taxableIncome - 700000;
            if (tax > maxTaxPayable) {
                tax = maxTaxPayable;
            }
        }

        const cess = tax * 0.04;

        return {
            grossSalary: gross,
            totalDeductions,
            taxableIncome,
            taxAmount: tax,
            cess,
            netTaxPayable: tax + cess,
            deductionBreakdown: {
                'Standard Deduction': standardDeduction,
                '(Other deductions N/A)': 0.0,
            },
        };
    }
}
