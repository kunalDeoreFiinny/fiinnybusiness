import { ExpenseItem, IncomeItem } from "@/lib/firestore";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, MessageSquare, CreditCard, User, Users, Edit2, Trash2, ArrowDownLeft, ArrowUpRight, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: ExpenseItem | IncomeItem | null;
    onEdit: (tx: ExpenseItem | IncomeItem) => void;
    onDelete: (id: string, type: "expense" | "income") => void;
}

export default function TransactionDetailsModal({
    isOpen,
    onClose,
    transaction,
    onEdit,
    onDelete
}: TransactionDetailsModalProps) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    if (!isOpen || !transaction) return null;

    const isIncome = (transaction as any).kind === 'income';
    const isExpense = !isIncome;

    const handleDelete = () => {
        onDelete(transaction.id, isIncome ? "income" : "expense");
        onClose();
    };

    const handleEdit = () => {
        onEdit(transaction);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Transaction Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Amount & Title */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                            {isIncome ? <ArrowDownLeft className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                        </div>
                        <h2 className={`text-3xl font-bold mb-1 ${isIncome ? "text-green-600" : "text-slate-900"}`}>
                            {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString('en-IN')}
                        </h2>
                        <p className="text-slate-600 font-medium text-lg">
                            {transaction.title || transaction.note || (isIncome ? "Income" : "Expense")}
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-4">
                        {/* Date */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</p>
                                <p className="text-slate-900 font-medium">{format(transaction.date, "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                            <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</p>
                                <p className="text-slate-900 font-medium">{transaction.category || "Uncategorized"}</p>
                            </div>
                        </div>

                        {/* Counterparty / Merchant */}
                        {transaction.counterparty && (
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Merchant / Payer</p>
                                    <p className="text-slate-900 font-medium">{transaction.counterparty}</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        {(transaction.instrument || transaction.issuerBank) && (
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Method</p>
                                    <p className="text-slate-900 font-medium">
                                        {[transaction.issuerBank, transaction.instrument].filter(Boolean).join(" - ")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Note */}
                        {transaction.note && transaction.note !== transaction.title && (
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Note</p>
                                    <p className="text-slate-900 font-medium">{transaction.note}</p>
                                </div>
                            </div>
                        )}

                        {/* Split Details (Expense Only) */}
                        {isExpense && (transaction as ExpenseItem).friendIds && (transaction as ExpenseItem).friendIds.length > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                <Users className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Split With</p>
                                    <p className="text-slate-900 font-medium">{(transaction as ExpenseItem).friendIds.length} friends</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-slate-100 bg-slate-50 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {confirmingDelete ? (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18 }}
                                className="p-6 bg-red-50"
                            >
                                <div className="flex items-center gap-2 mb-4 text-red-700">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-bold">Delete this transaction permanently?</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmingDelete(false)}
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Yes, Delete
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.18 }}
                                className="p-6 flex gap-3"
                            >
                                <button
                                    onClick={() => setConfirmingDelete(true)}
                                    className="flex-1 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
