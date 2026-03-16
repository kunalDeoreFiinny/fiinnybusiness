import { useState, useEffect, useRef } from 'react';
import { getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { Bot, Send, Loader2, Sparkles, TrendingUp, Users, Package, AlertCircle, RefreshCw, Shield } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const QUICK_PROMPTS = [
  { label: '📦 Top selling products', prompt: 'What are my top selling products this month?' },
  { label: '💰 Best performing retailers', prompt: 'Which retailers have the highest order value?' },
  { label: '⚠️ Overdue payments', prompt: 'Which customers have overdue payments and how much do they owe?' },
  { label: '📉 Slow-moving stock', prompt: 'Which products are slow-moving and need attention?' },
  { label: '📈 Revenue this month', prompt: 'What is my total revenue this month compared to last month?' },
  { label: '🔄 Reorder suggestions', prompt: 'Which products should I reorder based on stock levels?' },
];

// ✅ Secure Cloud Function URL — OpenAI key lives server-side only
const CLOUD_FN_URL = 'https://us-central1-lifemap-72b21.cloudfunctions.net/karanArjunAIChat';

async function buildBusinessContext(tenantId: string): Promise<string> {
  try {
    const [invoicesSnap, inventorySnap, retailersSnap] = await Promise.all([
      getDocs(query(getTenantCollection(db, tenantId, 'invoices'), orderBy('createdAt', 'desc'), limit(50))),
      getDocs(query(getTenantCollection(db, tenantId, 'ratesheetItems'), limit(50))),
      getDocs(query(getTenantCollection(db, tenantId, 'retailers'), limit(30))),
    ]);

    const invoices = invoicesSnap.docs.map(d => d.data());
    const inventory = inventorySnap.docs.map(d => d.data());
    const retailers = retailersSnap.docs.map(d => d.data());

    const totalRevenue = invoices.reduce((s, i) => s + (i.grandTotal || i.totalAmount || 0), 0);
    const unpaidInvoices = invoices.filter(i => i.paymentStatus !== 'Paid');
    const totalOutstanding = unpaidInvoices.reduce((s, i) => s + (i.grandTotal || i.totalAmount || 0), 0);

    const productSales: Record<string, { qty: number; revenue: number }> = {};
    invoices.forEach(inv => {
      (inv.lineItems || inv.items || []).forEach((item: any) => {
        const name = item.productName || item.name || 'Unknown';
        if (!productSales[name]) productSales[name] = { qty: 0, revenue: 0 };
        productSales[name].qty += Number(item.quantity || item.qty || 0);
        productSales[name].revenue += Number(item.amount || item.total || 0);
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([name, { qty, revenue }]) => `${name}: ${qty} units, ₹${revenue.toLocaleString('en-IN')}`)
      .join('\n');

    const retailerSummary = retailers.slice(0, 10)
      .map((r: any) => `${r.name || r.businessName}: ₹${(r.outstandingAmount || 0).toLocaleString('en-IN')} outstanding`)
      .join('\n');

    const lowStockItems = inventory
      .filter((i: any) => (i.stock || i.quantity || 0) < (i.reorderLevel || 10))
      .slice(0, 10)
      .map((i: any) => `${i.productName || i.name}: ${i.stock || i.quantity || 0} units remaining`)
      .join('\n');

    return `
Business Context (Live data from KaranArjun SaaS):

FINANCIALS:
- Total invoices: ${invoices.length}
- Total revenue (recent 50 invoices): ₹${totalRevenue.toLocaleString('en-IN')}
- Unpaid invoices: ${unpaidInvoices.length} totalling ₹${totalOutstanding.toLocaleString('en-IN')}

TOP SELLING PRODUCTS (by revenue):
${topProducts || 'No product data available'}

RETAILER OUTSTANDING DUES:
${retailerSummary || 'No retailer data available'}

LOW STOCK ALERTS:
${lowStockItems || 'No low-stock items or reorder levels not set'}

INVENTORY: ${inventory.length} products in rate sheet
RETAILERS: ${retailers.length} retailers registered
    `.trim();
  } catch {
    return 'Business data could not be loaded. Please try again.';
  }
}

async function askAI(userMessage: string, context: string, history: Message[]): Promise<string> {
  try {
    const messages = history.slice(-8).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    messages.push({ role: 'user', content: userMessage });

    const response = await fetch(CLOUD_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, businessContext: context }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.reply || 'No response from AI.';
    }
    // Fallback if Cloud Function not deployed
    return getFallbackResponse(userMessage, context);
  } catch {
    return getFallbackResponse(userMessage, context);
  }
}

function getFallbackResponse(userMessage: string, context: string): string {
  const q = userMessage.toLowerCase();
  if (q.includes('top') && (q.includes('product') || q.includes('sell'))) {
    const lines = context.match(/TOP SELLING PRODUCTS[\s\S]*?(?=RETAILER|$)/)?.[0] || '';
    return `## 📦 Top Selling Products\n\n${lines.replace('TOP SELLING PRODUCTS (by revenue):', '').trim() || 'No sales data yet. Start creating invoices to track your top products!'}\n\n**💡 Tip:** Products with consistent sales should be kept well-stocked.`;
  }
  if (q.includes('outstanding') || q.includes('overdue') || q.includes('payment')) {
    const lines = context.match(/RETAILER OUTSTANDING[\s\S]*?(?=LOW STOCK|$)/)?.[0] || '';
    const totalMatch = context.match(/totalling ₹([\d,]+)/);
    return `## 💰 Outstanding Payments\n\n${lines.replace('RETAILER OUTSTANDING DUES:', '').trim() || 'No outstanding dues — great!'}\n\n${totalMatch ? `**Total Outstanding: ₹${totalMatch[1]}**` : ''}\n\n**💡 Tip:** Send WhatsApp reminders via the Payment Reminders page to collect dues faster.`;
  }
  if (q.includes('revenue') || q.includes('sales') || q.includes('month')) {
    const revenueMatch = context.match(/Total revenue[^₹]*₹([\d,]+)/);
    const invoiceMatch = context.match(/Total invoices: (\d+)/);
    return `## 📈 Revenue Summary\n\n- **Total Invoices:** ${invoiceMatch?.[1] || '0'}\n- **Total Revenue (recent):** ₹${revenueMatch?.[1] || '0'}\n\n**💡 Tip:** Use Financial Reports → P&L Statement for a month-by-month breakdown.`;
  }
  if (q.includes('stock') || q.includes('reorder') || q.includes('inventory')) {
    const lines = context.match(/LOW STOCK ALERTS[\s\S]*$/)?.[0] || '';
    return `## 📦 Stock & Reorder Suggestions\n\n${lines.replace('LOW STOCK ALERTS:', '').trim() || 'All items appear well-stocked.'}\n\n**💡 Tip:** Set reorder levels per product in Rate Sheet to get automatic alerts.`;
  }
  if (q.includes('retailer') || q.includes('customer')) {
    const totalRetailers = context.match(/(\d+) retailers/)?.[1];
    return `## 👥 Retailer Performance\n\nYou have **${totalRetailers || 0} retailers** registered.\n\nCheck the Retailers page for detailed order history, outstanding amounts, and payment status per retailer.\n\n**💡 Tip:** Use Payment Reminders to send automated WhatsApp follow-ups to slow payers.`;
  }
  return `## 🤖 AI Business Advisor\n\nHello! I have access to your live business data — invoices, inventory, retailers, and cashflow.\n\n**I can help with:**\n- 📦 Product performance & reorder suggestions\n- 💰 Revenue analysis & outstanding payments\n- 👥 Retailer insights\n- 📈 Business growth recommendations\n\nAsk me anything about your business!`;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:0.95rem;font-weight:700;margin:0.75rem 0 0.25rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.05rem;font-weight:800;margin:0.5rem 0 0.5rem;color:var(--primary-light)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.2rem;font-weight:800;margin:0.5rem 0">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:0.2rem 0 0.2rem 1rem;list-style:disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style="margin:0.5rem 0;padding:0">${m}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function AIAdvisorPage() {
  const { tenantId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '## 👋 Hi! I\'m your AI Business Advisor.\n\nI have access to your live business data — invoices, inventory, retailers, and cashflow. Ask me anything about your business!',
      ts: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');
  const [loadingContext, setLoadingContext] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenantId) return;
    buildBusinessContext(tenantId).then(ctx => {
      setContext(ctx);
      setLoadingContext(false);
    });
  }, [tenantId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const reply = await askAI(msg, context, messages);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, ts: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const card = { background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '16px', padding: '1.5rem' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>

      {/* Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', ...card, padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, hsla(152,60%,40%,0.08), hsla(260,60%,50%,0.06))' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>AI Business Advisor</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: loadingContext ? '#f59e0b' : '#10b981' }} />
              {loadingContext ? 'Loading your business data...' : 'Live data connected · GPT-4o mini'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 32, height: 32, borderRadius: '10px', background: msg.role === 'assistant' ? 'linear-gradient(135deg, #10b981, #6366f1)' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700 }}>
                {msg.role === 'assistant' ? <Bot size={16} /> : 'ME'}
              </div>
              <div style={{
                background: msg.role === 'user' ? 'var(--primary-light)' : 'var(--surface-base)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '0.75rem 1rem', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                maxWidth: '80%', fontSize: '0.9rem', lineHeight: 1.6,
                border: msg.role === 'assistant' ? '1px solid var(--surface-border)' : 'none',
              }} dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Bot size={16} />
              </div>
              <div style={{ background: 'var(--surface-base)', border: '1px solid var(--surface-border)', padding: '0.75rem 1rem', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: `bounce 1s infinite ${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.75rem' }}>
          <input
            className="input-field"
            style={{ flex: 1, margin: 0 }}
            placeholder="Ask about your business — sales, stock, payments, retailers..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={loading || loadingContext}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading || loadingContext}
            style={{ padding: '0 1.25rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        {/* Quick Prompts */}
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} /> Quick Questions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {QUICK_PROMPTS.map(q => (
              <button
                key={q.prompt}
                onClick={() => send(q.prompt)}
                disabled={loading || loadingContext}
                style={{ textAlign: 'left', padding: '0.6rem 0.8rem', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', font: 'inherit', fontSize: '0.8rem', color: 'var(--text-secondary)', transition: 'all 0.15s' }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div style={card}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={14} /> Live Data Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { icon: <TrendingUp size={13} />, label: 'Invoices & Revenue', color: '#10b981' },
              { icon: <Users size={13} />, label: 'Retailer Profiles', color: '#6366f1' },
              { icon: <Package size={13} />, label: 'Inventory & Stock', color: '#f59e0b' },
              { icon: <AlertCircle size={13} />, label: 'Outstanding Payments', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                {s.label}
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: loadingContext ? '#f59e0b' : s.color }} />
              </div>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div style={{ ...card, fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <Shield size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
          <span><strong style={{ color: '#10b981' }}>Secure</strong> · AI powered by GPT-4o mini via encrypted Cloud Function. Your API key is never exposed to the browser.</span>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}
