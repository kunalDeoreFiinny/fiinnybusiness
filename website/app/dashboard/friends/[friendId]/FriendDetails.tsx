"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft, Edit2, RefreshCw, Plus, Bell, Handshake,
    ChevronDown, BarChart2, Hourglass, Receipt, Send,
    TrendingUp, PieChart, Calendar, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data ---
const friendsData: Record<string, any> = {
    "1": { name: "Karan 😵", youOwe: 0, owesYou: 4500, phone: "+917232839475", avatar: "K", color: "bg-teal-500" },
    "2": { name: "Arjun Tanpure", youOwe: 0, owesYou: 8839, phone: "+918658032751", avatar: "A", color: "bg-teal-500" },
    "3": { name: "Aana", youOwe: 1200, owesYou: 0, phone: "+919420529370", avatar: "A", color: "bg-teal-500" },
};

const initialMessages = [
    { id: 1, sender: "friend", text: "Hey, sent you the money for dinner!", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Got it, thanks!", time: "10:32 AM" },
    { id: 3, sender: "friend", text: "Are we splitting the Uber too?", time: "10:35 AM" },
];

// --- SUB-COMPONENTS (Defined OUTSIDE to fix lag) ---

const HistoryView = ({ friend }: { friend: any }) => {
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-28 group hover:border-red-200 transition-colors">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-red-400 transition-colors">You Owe</p>
                    <p className="text-3xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">₹{friend.youOwe}</p>
                </div>
                <div className="bg-[#00796b] p-5 rounded-2xl border border-[#00695c] shadow-lg shadow-teal-900/10 flex flex-col justify-between h-28 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <p className="text-xs font-bold text-teal-100 uppercase tracking-widest relative z-10">Owes You</p>
                    <p className="text-3xl font-bold text-white relative z-10">₹{friend.owesYou}</p>
                </div>
            </section>

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

            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-lg"><RefreshCw className="w-5 h-5 text-[#00796b]" /></div>
                        <h2 className="text-lg font-bold text-slate-900">Recurring</h2>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl flex gap-4 items-start border border-slate-100 mb-4">
                    <Hourglass className="w-5 h-5 text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">No shared recurring items yet.</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-[#00796b] hover:text-[#004d40] transition-colors pl-1">
                    <Plus className="w-4 h-4" /> Add recurring expense
                </button>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)} className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors select-none">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-lg"><BarChart2 className="w-5 h-5 text-[#00796b]" /></div>
                        <h2 className="text-lg font-bold text-slate-900">Monthly Breakdown</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-teal-50 text-[#00796b] text-xs font-bold rounded-full">+ ₹{friend.owesYou}</span>
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

const ChartView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Spending Trend</h3>
                    <p className="text-sm text-slate-500">Last 6 months activity</p>
                </div>
                <div className="p-2 bg-teal-50 rounded-xl"><TrendingUp className="w-5 h-5 text-[#00796b]" /></div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
                {[
                    { m: 'Aug', h: '40%', v: '₹2k' },
                    { m: 'Sep', h: '60%', v: '₹4k' },
                    { m: 'Oct', h: '30%', v: '₹1.5k' },
                    { m: 'Nov', h: '85%', v: '₹6k' },
                    { m: 'Dec', h: '50%', v: '₹3k' },
                    { m: 'Jan', h: '70%', v: '₹5k', active: true }
                ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                        <div className="relative w-full flex justify-center h-full items-end">
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded-lg font-bold mb-2">
                                {bar.v}
                            </div>
                            <div
                                style={{ height: bar.h }}
                                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out ${bar.active ? 'bg-[#00796b]' : 'bg-slate-200 group-hover:bg-[#4db6ac]'}`}
                            />
                        </div>
                        <span className={`text-xs font-bold ${bar.active ? 'text-[#00796b]' : 'text-slate-400'}`}>{bar.m}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">₹24,500</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Avg / Month</p>
                <p className="text-2xl font-bold text-slate-900">₹4,083</p>
            </div>
        </div>
    </motion.div>
);

const AnalyticsView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        <div className="bg-[#00796b] p-6 rounded-3xl shadow-lg shadow-teal-900/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-teal-100 font-medium text-sm mb-1">Top Category</p>
                    <h3 className="text-3xl font-bold">Food & Dining</h3>
                    <p className="text-teal-100 text-sm mt-2 opacity-80">65% of total expenses</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <PieChart className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Spending by Category</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {[
                    { name: "Food & Dining", amount: "₹5,200", percent: "65%", color: "bg-teal-500" },
                    { name: "Transportation", amount: "₹1,800", percent: "20%", color: "bg-orange-400" },
                    { name: "Entertainment", amount: "₹800", percent: "10%", color: "bg-blue-500" },
                    { name: "Others", amount: "₹400", percent: "5%", color: "bg-slate-300" },
                ].map((cat, i) => (
                    <div key={i} className="p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-700 text-sm">{cat.name}</span>
                            <span className="font-bold text-slate-900 text-sm">{cat.amount}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-full rounded-full ${cat.color}`} style={{ width: cat.percent }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

const ChatView = ({ messages, messageInput, setMessageInput, handleSendMessage, handleKeyDown, messagesEndRef }: any) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-col h-[calc(100vh-250px)]">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-t-3xl p-6 overflow-y-auto space-y-4">
            <div className="text-center">
                <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full">TODAY</span>
            </div>
            {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-4 rounded-2xl text-sm font-medium ${msg.sender === 'me'
                        ? 'bg-[#00796b] text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                        }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-teal-200' : 'text-slate-400'}`}>{msg.time}</p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border border-t-0 border-slate-200 p-4 rounded-b-3xl shadow-sm">
            <div className="flex items-center gap-3">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Plus className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                <button
                    onClick={handleSendMessage}
                    className="p-3 bg-[#00796b] text-white rounded-xl hover:bg-[#00695c] transition-colors shadow-lg shadow-teal-900/20"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    </motion.div>
);

// --- MAIN COMPONENT ---

export default function FriendDetails() {
    const params = useParams();
    const friendId = params.friendId as string;
    const friend = friendsData[friendId] || friendsData["2"];

    // State
    const [activeTab, setActiveTab] = useState("history");
    const [messages, setMessages] = useState(initialMessages);
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { id: "history", label: "History" },
        { id: "chart", label: "Chart" },
        { id: "analytics", label: "Analytics" },
        { id: "chat", label: "Chat" },
    ];

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    const handleSendMessage = () => {
        if (messageInput.trim() === "") return;
        const newMessage = {
            id: messages.length + 1,
            sender: "me",
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, newMessage]);
        setMessageInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 pb-20">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/friends" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group">
                            <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:text-slate-900 transition-colors" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">{friend.name}</h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><Calendar className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex space-x-8 relative overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative py-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-[#00796b]" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="active-tab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00796b] rounded-t-full shadow-sm" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'history' && <HistoryView key="history" friend={friend} />}
                    {activeTab === 'chart' && <ChartView key="chart" />}
                    {activeTab === 'analytics' && <AnalyticsView key="analytics" />}
                    {activeTab === 'chat' && (
                        <ChatView
                            key="chat"
                            messages={messages}
                            messageInput={messageInput}
                            setMessageInput={setMessageInput}
                            handleSendMessage={handleSendMessage}
                            handleKeyDown={handleKeyDown}
                            messagesEndRef={messagesEndRef}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}