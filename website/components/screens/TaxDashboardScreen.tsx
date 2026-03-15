import { useMemo, useState } from "react";
import { ExpenseItem, IncomeItem, UserProfile } from "@/lib/firestore";
import { TaxEngine, TaxProfile } from "@/lib/tax_engine";
import { motion } from "framer-motion";
import { Calculator, AlertCircle, FileText, CheckCircle2, TrendingDown } from "lucide-react";

// Local currency formatter
function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount);
}

interface TaxDashboardScreenProps {
    expenses: ExpenseItem[];
    incomes: IncomeItem[];
    userProfile: UserProfile | null;
}

export default function TaxDashboardScreen({ expenses, incomes, userProfile }: TaxDashboardScreenProps) {
    // Determine current financial year start (April 1st)
    const currentFYStart = useMemo(() => {
        const now = new Date();
        const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        return new Date(year, 3, 1); // April 1st
    }, []);

    // Estimate Salary from incomes
    const estimatedSalary = useMemo(() => {
        let total = 0;
        incomes.forEach(i => {
            const iDate = i.date as any;
            const txDate = typeof iDate.toDate === 'function' ? iDate.toDate() : iDate;
            if (txDate >= currentFYStart) {
                const cat = (i.category || '').toLowerCase();
                const note = (i.note || '').toLowerCase();
                if (cat.includes('salary') || note.includes('salary')) {
                    total += i.amount;
                }
            }
        });

        // If we can't find explicitly marked salary, just sum all income for the year as a fallback estimate
        if (total === 0) {
            incomes.forEach(i => {
                const iDate = i.date as any;
                const txDate = typeof iDate.toDate === 'function' ? iDate.toDate() : iDate;
                if (txDate >= currentFYStart) {
                    total += i.amount;
                }
            });
        }

        // Project annualized salary if we are partway through the year
        const now = new Date();
        const monthsPassed = (now.getFullYear() - currentFYStart.getFullYear()) * 12 + (now.getMonth() - currentFYStart.getMonth()) + 1;

        if (monthsPassed < 12 && total > 0) {
            return (total / monthsPassed) * 12;
        }

        return total;
    }, [incomes, currentFYStart]);

    // Build the Tax Profile
    const profile: TaxProfile = useMemo(() => {
        // Calculate age from DOB if available, otherwise default to 30
        // Currently UserProfile does not store DOB on the web side
        const age = 30;

        return {
            declaredSalary: estimatedSalary,
            declaredRent: 0, // Will be inferred dynamically via HRA_RentPaid
            age: age,
            isMetro: true // Defaulting to true for safer HRA assumption
        };
    }, [estimatedSalary, userProfile]);

    // Perform Calculations
    const calculations = useMemo(() => {
        const aggregatedDeductions = TaxEngine.aggregateTaxData(expenses, currentFYStart);
        const oldRegime = TaxEngine.calculateOldRegime(profile, aggregatedDeductions);
        const newRegime = TaxEngine.calculateNewRegime(profile);

        const isNewBetter = newRegime.netTaxPayable <= oldRegime.netTaxPayable;
        const recommended = isNewBetter ? newRegime : oldRegime;
        const savings = Math.abs(oldRegime.netTaxPayable - newRegime.netTaxPayable);

        return {
            aggregatedDeductions,
            oldRegime,
            newRegime,
            isNewBetter,
            recommended,
            savings
        };
    }, [expenses, currentFYStart, profile]);

    const { aggregatedDeductions, oldRegime, newRegime, isNewBetter, recommended, savings } = calculations;

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Tax Autopilot</h2>
                <p className="text-slate-500">
                    Live calculation for FY {currentFYStart.getFullYear()}-{currentFYStart.getFullYear() + 1}
                </p>
            </div>

            {/* Main Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Estimated Annual Income</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(profile.declaredSalary, 'INR')}</p>
                    <p className="text-xs text-slate-400 mt-2">Projected from tracked income</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Deductions Found</p>
                    <p className="text-2xl font-bold text-teal-600">
                        {formatCurrency(
                            Object.values(aggregatedDeductions).reduce((a, b) => a + b, 0),
                            'INR'
                        )}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Auto-detected from expenses</p>
                </div>

                <div className={`rounded-2xl p-6 border shadow-sm ${savings > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                    <p className="text-sm font-medium text-emerald-800 mb-1">Potential Savings</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(savings, 'INR')}</p>
                    <p className="text-xs text-emerald-700 mt-2 font-medium">By picking the right regime</p>
                </div>
            </div>

            {/* Regime Recommendation Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                    <div className="inline-flex flex-col md:flex-row items-center gap-3 mb-4">
                        <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-500/30">
                            Fiinny Recommendation
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Opt for the {isNewBetter ? 'New' : 'Old'} Regime</h3>
                    <p className="text-slate-300 max-w-md">
                        Based on your tracked expenses and investments, the {isNewBetter ? 'New' : 'Old'} tax regime will minimize your tax liability to {formatCurrency(recommended.netTaxPayable, 'INR')}.
                    </p>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[200px]">
                    <p className="text-sm text-slate-300 mb-1">Estimated Tax</p>
                    <p className="text-3xl font-bold text-white mb-2">{formatCurrency(recommended.netTaxPayable, 'INR')}</p>
                    {savings > 0 && (
                        <p className="text-xs text-emerald-400 flex items-center justify-center gap-1 font-medium">
                            <TrendingDown className="w-3 h-3" /> Saves {formatCurrency(savings, 'INR')}
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Detailed Comparison */}
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Regime Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Old Regime Card */}
                <div className={`bg-white rounded-3xl p-6 border-2 transition-all ${!isNewBetter ? 'border-teal-500 shadow-md ring-4 ring-teal-500/10' : 'border-slate-200 opacity-70'}`}>
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${!isNewBetter ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">Old Regime</h4>
                                <p className="text-xs text-slate-500">Maximizes exemptions</p>
                            </div>
                        </div>
                        {!isNewBetter && <CheckCircle2 className="w-6 h-6 text-teal-500" />}
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Gross Salary</span>
                            <span className="font-medium">{formatCurrency(oldRegime.grossSalary, 'INR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Deductions</span>
                            <span className="font-medium text-teal-600">-{formatCurrency(oldRegime.totalDeductions, 'INR')}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                            <span className="text-slate-600 font-medium">Taxable Income</span>
                            <span className="font-bold">{formatCurrency(oldRegime.taxableIncome, 'INR')}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-sm text-slate-500 mb-1">Total Tax Payable</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(oldRegime.netTaxPayable, 'INR')}</p>
                    </div>
                </div>

                {/* New Regime Card */}
                <div className={`bg-white rounded-3xl p-6 border-2 transition-all ${isNewBetter ? 'border-teal-500 shadow-md ring-4 ring-teal-500/10' : 'border-slate-200 opacity-70'}`}>
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isNewBetter ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">New Regime</h4>
                                <p className="text-xs text-slate-500">Lower slab rates</p>
                            </div>
                        </div>
                        {isNewBetter && <CheckCircle2 className="w-6 h-6 text-teal-500" />}
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Gross Salary</span>
                            <span className="font-medium">{formatCurrency(newRegime.grossSalary, 'INR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Standard Deduction</span>
                            <span className="font-medium text-teal-600">-{formatCurrency(newRegime.totalDeductions, 'INR')}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                            <span className="text-slate-600 font-medium">Taxable Income</span>
                            <span className="font-bold">{formatCurrency(newRegime.taxableIncome, 'INR')}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-sm text-slate-500 mb-1">Total Tax Payable</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(newRegime.netTaxPayable, 'INR')}</p>
                    </div>
                </div>
            </div>

            {/* Detected Deductions Breakdown via Rules Engine */}
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Auto-Detected Deductions</h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <th className="px-6 py-4 font-medium">Category / Section</th>
                            <th className="px-6 py-4 font-medium">Detected Amount</th>
                            <th className="px-6 py-4 font-medium">Eligible Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-700">80C Investments</span>
                                <p className="text-xs text-slate-500">ELSS, EPF, PPF, Life Insurance</p>
                            </td>
                            <td className="px-6 py-4 font-bold">{formatCurrency(aggregatedDeductions['80C'] || 0, 'INR')}</td>
                            <td className="px-6 py-4">
                                {(aggregatedDeductions['80C'] || 0) > 150000 ? (
                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-max">
                                        <AlertCircle className="w-3 h-3" /> Capped at ₹1.5L
                                    </span>
                                ) : (
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">Fully Eligible</span>
                                )}
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-700">80D Health Insurance</span>
                                <p className="text-xs text-slate-500">Premiums paid</p>
                            </td>
                            <td className="px-6 py-4 font-bold">{formatCurrency(aggregatedDeductions['80D'] || 0, 'INR')}</td>
                            <td className="px-6 py-4">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">Eligible</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-700">HRA / Rent Paid</span>
                                <p className="text-xs text-slate-500">Estimated based on rent transactions</p>
                            </td>
                            <td className="px-6 py-4 font-bold">{formatCurrency(aggregatedDeductions['HRA_RentPaid'] || 0, 'INR')}</td>
                            <td className="px-6 py-4">
                                <span className="text-slate-500 text-xs">Exemption calculated automatically</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                    <strong>Disclaimer:</strong> This is a simulation based on your parsed transactions in Fiinny. It is not an official ITR calculation. Final eligibility for deductions depends on official receipts and declarations. For accurate filing, we recommend utilizing the fully integrated ERI service when filling.
                </p>
            </div>

        </div>
    );
}
