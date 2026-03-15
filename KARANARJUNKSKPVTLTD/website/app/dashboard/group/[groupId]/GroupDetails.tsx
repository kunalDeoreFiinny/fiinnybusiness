"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft, Edit2, RefreshCw, Plus, Bell, Handshake,
    ChevronDown, BarChart2, Hourglass, Receipt, Send,
    TrendingUp, PieChart, Calendar, MoreVertical, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data for Groups ---
const groupsData: Record<string, any> = {
    "1": { name: "Goa Trip 🌴", totalSpent: 45000, yourShare: 15000, youOwe: 500, members: ["You", "Arjun", "Karan"], color: "bg-orange-500" },
    "2": { name: "Flat 402 Rent", totalSpent: 24000, yourShare: 12000, youOwe: 0, members: ["You", "Aana"], color: "bg-blue-500" },
    "3": { name: "Office Lunch", totalSpent: 5000, yourShare: 1200, youOwe: 0, members: ["You", "Team"], color: "bg-green-500" },
};

const initialMessages = [
    { id: 1, sender: "Arjun", text: "Guys, I paid for the drinks! 🍹", time: "10:30 AM", avatar: "A" },
    { id: "me", sender: "me", text: "Awesome, adding it to Splitwise.", time: "10:32 AM", avatar: "Y" },
    { id: 2, sender: "Karan", text: "How much was the cab?", time: "10:35 AM", avatar: "K" },
];

// --- SUB-COMPONENTS (Defined OUTSIDE to prevent lag) ---

const HistoryView = ({ group }: { group: any }) => {
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">

            {/* Balance Cards */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 group hover:border-orange-200 transition-colors">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-orange-400 transition-colors">You Owe</p>
                    <div>
                        <p className="text-3xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">₹{group.youOwe}</p>
                        <p className="text-xs text-slate-400 mt-1">in this group</p>
                    </div>
                </div>
                <div className="bg-[#00796b] p-5 rounded-2xl border border-[#00695c] shadow-lg shadow-teal-900/10 flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <p className="text-xs font-bold text-teal-100 uppercase tracking-widest relative z-10">Total Spent</p>
                    <div>
                        <p className="text-3xl font-bold text-white relative z-10">₹{group.totalSpent}</p>
                        <p className="text-xs text-teal-200 mt-1 relative z-10">Your share: ₹{group.yourShare}</p>
                    </div>
                </div>
            </section>

            {/* Action Buttons */}
            <section className="grid grid-cols-3 gap-4">
                <button className="group bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-teal-500/50 hover:shadow-md transition-all active:scale-95">
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors"><Receipt className="w-5 h-5 text-[#00796b]" /></div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#00796b]">Expense</span>
                </button>
                <button className="group bg-[#00796b] border border-[#00796b] p-4 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-lg hover:bg-[#00695c] transition-all active:scale-95">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Handshake className="w-5 h-5 text-white" /></div>
                    <span className="text-sm font-bold text-white">Settle Up</span>
                </button>
                <button className="group bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-orange-400/50 hover:shadow-md transition-all active:scale-95">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors"><Bell className="w-5 h-5 text-orange-500" /></div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600">Remind</span>
                </button>
            </section>

            {/* Monthly Breakdown */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)} className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors select-none">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-lg"><BarChart2 className="w-5 h-5 text-[#00796b]" /></div>
                        <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">3 New</span>
                        <motion.div animate={{ rotate: isBreakdownExpanded ? 180 : 0 }}>
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                    {isBreakdownExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-slate-100">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                                            {i === 0 ? "🍹" : i === 1 ? "🚕" : "🍕"}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{i === 0 ? "Drinks at Club" : i === 1 ? "Uber to Hotel" : "Pizza Dinner"}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{i === 0 ? "Arjun paid ₹5,000" : "You paid ₹800"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{i === 0 ? "YOU OWE" : "YOU LENT"}</p>
                                        <p className={`text-sm font-bold ${i === 0 ? "text-orange-500" : "text-teal-600"}`}>
                                            {i === 0 ? "₹1,500" : "₹400"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </motion.div>
    );
};

const ChartView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Group Spending</h3>
                    <p className="text-sm text-slate-500">Last 6 months</p>
                </div>
                <div className="p-2 bg-teal-50 rounded-xl"><TrendingUp className="w-5 h-5 text-[#00796b]" /></div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
                {[{ m: 'Aug', h: '40%' }, { m: 'Sep', h: '60%' }, { m: 'Oct', h: '30%' }, { m: 'Nov', h: '85%' }, { m: 'Dec', h: '50%' }, { m: 'Jan', h: '70%', active: true }]
                    .map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                            <div className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${bar.active ? 'bg-[#00796b]' : 'bg-slate-200 group-hover:bg-teal-200'}`} style={{ height: bar.h }} />
                            <span className={`text-xs font-bold ${bar.active ? 'text-[#00796b]' : 'text-slate-400'}`}>{bar.m}</span>
                        </div>
                    ))}
            </div>
        </div>
    </motion.div>
);

const AnalyticsView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        <div className="bg-[#00796b] p-6 rounded-3xl shadow-lg shadow-teal-900/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10">
                <p className="text-teal-100 font-medium text-sm mb-1">Top Category</p>
                <h3 className="text-3xl font-bold">Food & Dining</h3>
                <p className="text-teal-100 text-sm mt-2 opacity-80">65% of group expenses</p>
            </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900">Category Breakdown</h3>
            {[
                { name: "Food & Dining", percent: "65%", color: "bg-teal-500" },
                { name: "Transportation", percent: "20%", color: "bg-orange-400" },
                { name: "Entertainment", percent: "15%", color: "bg-blue-500" },
            ].map((cat, i) => (
                <div key={i}>
                    <div className="flex justify-between text-sm font-bold text-slate-700 mb-1"><span>{cat.name}</span><span>{cat.percent}</span></div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className={`h-full ${cat.color}`} style={{ width: cat.percent }} /></div>
                </div>
            ))}
        </div>
    </motion.div>
);

const ChatView = ({ messages, messageInput, setMessageInput, handleSendMessage, handleKeyDown, messagesEndRef }: any) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-col h-[calc(100vh-250px)]">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-t-3xl p-6 overflow-y-auto space-y-4">
            <div className="text-center"><span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full">TODAY</span></div>
            {messages.map((msg: any) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender !== 'me' && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{msg.avatar}</div>}
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm font-medium ${msg.sender === 'me' ? 'bg-[#00796b] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                        {msg.sender !== 'me' && <p className="text-[10px] font-bold text-slate-400 mb-1">{msg.sender}</p>}
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-teal-200' : 'text-slate-400'}`}>{msg.time}</p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border border-t-0 border-slate-200 p-4 rounded-b-3xl shadow-sm">
            <div className="flex items-center gap-3">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><Plus className="w-5 h-5" /></button>
                <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message group..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                <button onClick={handleSendMessage} className="p-3 bg-[#00796b] text-white rounded-xl hover:bg-[#00695c] transition-colors shadow-lg shadow-teal-900/20"><Send className="w-4 h-4" /></button>
            </div>
        </div>
    </motion.div>
);

// --- MAIN COMPONENT ---

export default function GroupDetails() {
    const params = useParams();
    const groupId = params.groupId as string;
    const group = groupsData[groupId] || groupsData["1"];

    const [activeTab, setActiveTab] = useState("history");
    const [messages, setMessages] = useState(initialMessages);
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { id: "history", label: "History" },
        { id: "chart", label: "Chart" },
        { id: "analytics", label: "Analytics" },
        { id: "chat", label: "Group Chat" },
    ];

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeTab]);

    const handleSendMessage = () => {
        if (messageInput.trim() === "") return;
        setMessages([...messages, { id: messages.length + 1, sender: "me", text: messageInput, time: "Now", avatar: "Y" }]);
        setMessageInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") handleSendMessage(); };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 pb-20">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/group" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group">
                            <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:text-slate-900 transition-colors" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">{group.name}</h1>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Users className="w-3 h-3" /> {group.members.join(", ")}</p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><MoreVertical className="w-5 h-5" /></button>
                </div>
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative py-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-[#00796b]" : "text-slate-500 hover:text-slate-700"}`}>
                                {tab.label}
                                {activeTab === tab.id && <motion.div layoutId="active-group-tab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00796b] rounded-t-full shadow-sm" />}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'history' && <HistoryView key="history" group={group} />}
                    {activeTab === 'chart' && <ChartView key="chart" />}
                    {activeTab === 'analytics' && <AnalyticsView key="analytics" />}
                    {activeTab === 'chat' && <ChatView key="chat" messages={messages} messageInput={messageInput} setMessageInput={setMessageInput} handleSendMessage={handleSendMessage} handleKeyDown={handleKeyDown} messagesEndRef={messagesEndRef} />}
                </AnimatePresence>
            </main>
        </div>
    );
}