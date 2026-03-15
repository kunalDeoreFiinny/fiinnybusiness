"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Shield, FileText, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export default function TaxAutopilotWeb() {
    const [pan, setPan] = useState("");
    const [dob, setDob] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    const [activeRegime, setActiveRegime] = useState<"old" | "new">("new");

    // Mock Tax Data
    const mockData = {
        grossSalary: 1850000,
        deductions: {
            "80C (ELSS/PPF)": 150000,
            "80D (Health Insurance)": 25000,
            "HRA (Rent Paid)": 240000,
            "Standard Deduction": 50000,
        },
        oldRegimeTax: 215800,
        newRegimeTax: 161200, // Recommended
    };

    const currentDeductions = activeRegime === "old"
        ? Object.entries(mockData.deductions)
        : [["Standard Deduction", mockData.deductions["Standard Deduction"]]];

    const handleFetchData = (e: React.FormEvent) => {
        e.preventDefault();
        if (pan.length !== 10) return;

        setIsFetching(true);
        // Simulate API call to Gov ERI / Form 26AS fetch
        setTimeout(() => {
            setIsFetching(false);
            setDataFetched(true);
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900 border-t-4 border-teal-500">

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 py-4 px-6 md:px-12 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex justify-between items-center">
                <Link href="/" className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                    Fiinny <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-md uppercase tracking-widest font-bold hidden sm:inline-block">Tax Autopilot</span>
                </Link>
                <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    Back to Main
                </Link>
            </nav>

            <main className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6">

                <AnimatePresence mode="wait">
                    {!dataFetched ? (
                        /* --- STEP 1: INPUT FORM (KYC / FETCH) --- */
                        <motion.div
                            key="input-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto w-full"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">File ITR in 3 simple steps</h1>
                                <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                                    We securely connect to official Income Tax APIs to fetch your Form 26AS and AIS automatically.
                                </p>
                            </div>

                            {/* 3 Simple Steps UI */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 relative max-w-3xl mx-auto">
                                {/* Connecting Line for Desktop */}
                                <div className="hidden md:block absolute top-[24px] left-[15%] right-[15%] h-[2px] bg-slate-200 border-t-2 border-dashed border-slate-300 z-0"></div>

                                {/* Step 1 */}
                                <div className="relative z-10 flex flex-col items-center text-center flex-1">
                                    <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 text-teal-600 font-bold text-lg flex items-center justify-center mb-4 shadow-sm">
                                        1
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Link your PAN</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">Enter your PAN to proceed for fetching all your finance data.</p>
                                </div>

                                {/* Step 2 */}
                                <div className="relative z-10 flex flex-col items-center text-center flex-1">
                                    <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 text-teal-600 font-bold text-lg flex items-center justify-center mb-4 shadow-sm">
                                        2
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Auto fill details</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">All your data will auto fetch from ITD, no manual entry needed.</p>
                                </div>

                                {/* Step 3 */}
                                <div className="relative z-10 flex flex-col items-center text-center flex-1">
                                    <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 text-teal-600 font-bold text-lg flex items-center justify-center mb-4 shadow-sm">
                                        3
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Review and file</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">Just review the final summary, hit submit, and you're done.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200 border border-slate-100 max-w-xl mx-auto">
                                <form onSubmit={handleFetchData} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">PAN Number</label>
                                        <input
                                            type="text"
                                            value={pan}
                                            onChange={(e) => setPan(e.target.value.toUpperCase())}
                                            placeholder="ABCDE1234F"
                                            className="w-full text-xl text-slate-900 font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                            maxLength={10}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            className="w-full text-lg text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isFetching || pan.length !== 10 || !dob}
                                        className="w-full bg-slate-900 text-white font-bold text-lg py-5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative shadow-lg shadow-slate-900/20"
                                    >
                                        {isFetching ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin mr-3 text-teal-400" />
                                                Fetching securely from ITD API...
                                            </>
                                        ) : (
                                            <>
                                                Securely Fetch Tax Data
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    256-bit Encryption • Govt. Authorized ERI Hub
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* --- STEP 2: RESULTS DASHBOARD (TAX CENTER) --- */
                        <motion.div
                            key="results-dashboard"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-10">
                                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Your Custom Tax Plan</h1>
                                <p className="text-slate-500 font-medium">Based on your official ITD records (FY 2023-24)</p>
                            </div>

                            {/* Top Banner Recommendation */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white mb-8 shadow-xl shadow-teal-900/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                                <div className="relative z-10 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm mb-4">
                                        <CheckCircle2 className="w-4 h-4" /> Recommendation
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Choose the New Regime</h2>
                                    <p className="text-emerald-50 text-lg opacity-90">You save ₹54,600 compared to the old regime.</p>
                                </div>

                                <button className="relative z-10 w-full md:w-auto bg-white text-teal-800 font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
                                    <FileText className="w-5 h-5 mr-2" /> Download ITR-1 JSON
                                </button>
                            </div>

                            {/* Regime Comparator Section */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Regime Comparison</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* New Regime Card (Selected) */}
                                    <div
                                        onClick={() => setActiveRegime("new")}
                                        className={`cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${activeRegime === 'new' ? 'bg-white border-teal-500 shadow-xl shadow-teal-100' : 'bg-slate-100 border-transparent hover:bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className={`text-xl font-bold ${activeRegime === 'new' ? 'text-teal-700' : 'text-slate-600'}`}>New Regime</h4>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">Recommended for you</p>
                                            </div>
                                            {activeRegime === 'new' && <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                        </div>

                                        <p className="text-4xl font-black text-slate-900 mb-2">₹1,61,200</p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Total Tax Payable</p>

                                        <div className="space-y-4 pt-6 border-t border-slate-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Gross Income</span>
                                                <span className="font-bold text-slate-800">₹{mockData.grossSalary.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Total Deductions</span>
                                                <span className="font-bold text-emerald-600">- ₹50,000</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Old Regime Card */}
                                    <div
                                        onClick={() => setActiveRegime("old")}
                                        className={`cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${activeRegime === 'old' ? 'bg-white border-slate-800 shadow-xl shadow-slate-200' : 'bg-slate-100 border-transparent hover:bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className={`text-xl font-bold ${activeRegime === 'old' ? 'text-slate-900' : 'text-slate-600'}`}>Old Regime</h4>
                                                <p className="text-sm text-slate-500 mt-1 font-medium">Higher Tax Liability</p>
                                            </div>
                                            {activeRegime === 'old' && <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div>}
                                        </div>

                                        <p className="text-4xl font-black text-slate-900 mb-2">₹2,15,800</p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Total Tax Payable</p>

                                        <div className="space-y-4 pt-6 border-t border-slate-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Gross Income</span>
                                                <span className="font-bold text-slate-800">₹{mockData.grossSalary.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Total Deductions</span>
                                                <span className="font-bold text-emerald-600">- ₹4,65,000</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions Breakdown */}
                            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900">Breakdown for {activeRegime === 'new' ? 'New' : 'Old'} Regime</h3>
                                    <div className="p-2 bg-slate-50 rounded-lg hidden sm:block">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {currentDeductions.map(([label, amount], i) => (
                                        <div key={i} className="flex justify-between items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-teal-400" />
                                                <span className="font-bold text-slate-700">{label}</span>
                                            </div>
                                            <span className="font-bold text-slate-900 text-lg">₹{amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
