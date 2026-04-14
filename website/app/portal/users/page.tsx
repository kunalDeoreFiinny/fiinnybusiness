"use client";
import React, { useEffect, useState } from 'react';
import { EmployeeService } from '@/lib/services/EmployeeService';
import { Employee } from '@/lib/models/Employee';
import { Plus, Trash2, User, Shield, Key, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PortalUserList() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        username: '',
        password: '',
        name: '',
        role: 'editor' as const
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await EmployeeService.getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this employee? They will lose access to the portal immediately.")) {
            try {
                await EmployeeService.deleteEmployee(id);
                fetchEmployees();
            } catch (error) {
                alert("Failed to delete employee");
            }
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await EmployeeService.addEmployee(newEmployee);
            setShowAddModal(false);
            setNewEmployee({ username: '', password: '', name: '', role: 'editor' });
            fetchEmployees();
        } catch (error) {
            alert("Failed to add employee");
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Employee Management</h1>
                    <p className="text-lg text-slate-500 font-medium">Control who has access to the Fiinny Internal Portal.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Employee
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-20 text-center">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading team...</p>
                    </div>
                ) : employees.map((emp, idx) => (
                    <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${emp.role === 'admin' ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <User className="w-7 h-7" />
                            </div>
                            <button 
                                onClick={() => emp.id && handleDelete(emp.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-1 mb-6">
                            <h3 className="text-xl font-black text-slate-900">{emp.name}</h3>
                            <p className="text-slate-500 font-medium font-mono text-sm">@{emp.username}</p>
                        </div>

                        <div className="flex items-center gap-2 mb-8">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                emp.role === 'admin' 
                                ? 'bg-teal-50 text-teal-600 border-teal-100' 
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                                <Shield className="w-3 h-3 inline-block mr-1 mb-0.5" />
                                {emp.role}
                            </span>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Created At</span>
                            <span>{emp.createdAt?.seconds ? new Date(emp.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Employee Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-lg p-10 relative z-10 shadow-2xl border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Employee</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddEmployee} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={newEmployee.name}
                                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="E.g., John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Username</label>
                                    <input 
                                        type="text"
                                        required
                                        value={newEmployee.username}
                                        onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="johndoe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Initial Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text"
                                            required
                                            value={newEmployee.password}
                                            onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-800 uppercase tracking-widest ml-1">Role</label>
                                    <select 
                                        value={newEmployee.role}
                                        onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value as 'admin' | 'editor'})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all font-bold appearance-none"
                                    >
                                        <option value="editor">Editor (Blogs only)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                >
                                    Confirm Addition
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
