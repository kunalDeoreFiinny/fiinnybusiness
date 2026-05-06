import { useState } from 'react';
import { Search, RotateCcw, Package, CheckCircle, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  collection, query, where, getDocs, addDoc, updateDoc,
  doc, serverTimestamp, increment, orderBy, limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { useToast } from '../contexts/ToastContext';

interface LineItem {
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  retailerName?: string;
  customerName?: string;
  phoneNumber?: string;
  grandTotal?: number;
  netAmount?: number;
  totalAmount?: number;
  subtotal?: number;
  createdAt?: any;
  invoiceDate?: string;
  lineItems: LineItem[];
}

interface ReturnItem {
  idx: number;
  returnQty: number;
  selected: boolean;
}

const RETURN_REASONS = [
  'Defective / Damaged',
  'Wrong Item Delivered',
  'Customer Changed Mind',
  'Duplicate Order',
  'Quality Not Satisfactory',
  'Other',
];

const REFUND_METHODS = ['Cash', 'Store Credit', 'UPI / Bank Transfer'];

function getOrderTotal(o: SalesOrder) {
  return Number(o.grandTotal || o.netAmount || o.totalAmount || o.subtotal || 0);
}

export default function ReturnsPage() {
  const { tenantId } = useAuth();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [refundMethod, setRefundMethod] = useState(REFUND_METHODS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [showRecentReturns, setShowRecentReturns] = useState(false);
  const [recentReturns, setRecentReturns] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  if (!tenantId) return null;

  async function handleSearch() {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSelectedOrder(null);
    setOrders([]);
    try {
      const col = getTenantCollection(db, tenantId!, 'salesOrders');
      const term = searchTerm.trim();

      // Search by order number
      const byNum = await getDocs(
        query(col, where('orderNumber', '==', term), limit(10))
      );
      const byPhone = term.length >= 8
        ? await getDocs(query(col, where('phoneNumber', '==', term), orderBy('createdAt', 'desc'), limit(10)))
        : { docs: [] };

      const seen = new Set<string>();
      const results: SalesOrder[] = [];
      for (const snap of [...byNum.docs, ...byPhone.docs]) {
        if (!seen.has(snap.id)) {
          seen.add(snap.id);
          results.push({ id: snap.id, ...snap.data() } as SalesOrder);
        }
      }
      setOrders(results);
      if (results.length === 0) showToast('No orders found', 'error');
    } catch (e: any) {
      showToast('Search failed: ' + e.message, 'error');
    } finally {
      setSearching(false);
    }
  }

  function selectOrder(order: SalesOrder) {
    setSelectedOrder(order);
    setReturnItems(
      (order.lineItems || []).map((_, idx) => ({ idx, returnQty: 0, selected: false }))
    );
    setDone(null);
  }

  function toggleItem(idx: number) {
    setReturnItems(prev =>
      prev.map(ri => ri.idx === idx ? { ...ri, selected: !ri.selected, returnQty: ri.selected ? 0 : 1 } : ri)
    );
  }

  function setReturnQty(idx: number, qty: number) {
    const item = selectedOrder!.lineItems[idx];
    const max = item.quantity;
    setReturnItems(prev =>
      prev.map(ri => ri.idx === idx ? { ...ri, returnQty: Math.min(Math.max(0, qty), max) } : ri)
    );
  }

  function getRefundTotal() {
    if (!selectedOrder) return 0;
    return returnItems.reduce((sum, ri) => {
      if (!ri.selected || ri.returnQty <= 0) return sum;
      const item = selectedOrder.lineItems[ri.idx];
      const unitPrice = item.unitPrice || item.price || 0;
      return sum + unitPrice * ri.returnQty;
    }, 0);
  }

  async function handleSubmit() {
    if (!selectedOrder) return;
    const itemsToReturn = returnItems.filter(ri => ri.selected && ri.returnQty > 0);
    if (itemsToReturn.length === 0) {
      showToast('Select at least one item to return', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const returnLineItems = itemsToReturn.map(ri => {
        const item = selectedOrder.lineItems[ri.idx];
        return {
          productId: item.productId || '',
          productName: item.productName,
          sku: item.sku || '',
          returnQty: ri.returnQty,
          unitPrice: item.unitPrice || item.price || 0,
          refundAmount: (item.unitPrice || item.price || 0) * ri.returnQty,
        };
      });

      const refundTotal = getRefundTotal();

      // Write return doc
      const returnsCol = getTenantCollection(db, tenantId!, 'returns');
      const returnRef = await addDoc(returnsCol, {
        originalOrderId: selectedOrder.id,
        originalOrderNumber: selectedOrder.orderNumber,
        customerName: selectedOrder.retailerName || selectedOrder.customerName || '',
        phoneNumber: selectedOrder.phoneNumber || '',
        returnItems: returnLineItems,
        reason,
        refundMethod,
        refundTotal,
        notes,
        status: 'processed',
        createdAt: serverTimestamp(),
      });

      // Restock inventory — increment loosePieces on each product
      for (const ri of itemsToReturn) {
        const item = selectedOrder.lineItems[ri.idx];
        if (item.productId) {
          try {
            const prodRef = getTenantDoc(db, tenantId!, 'products', item.productId);
            await updateDoc(prodRef, { loosePieces: increment(ri.returnQty) });
          } catch {
            // non-critical if product doc not found
          }
        }
      }

      setDone(`RET-${returnRef.id.slice(-6).toUpperCase()}`);
      showToast('Return processed successfully', 'success');
    } catch (e: any) {
      showToast('Failed to process return: ' + e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function loadRecentReturns() {
    setLoadingRecent(true);
    try {
      const col = getTenantCollection(db, tenantId!, 'returns');
      const snap = await getDocs(query(col, orderBy('createdAt', 'desc'), limit(20)));
      setRecentReturns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      // ignore
    } finally {
      setLoadingRecent(false);
    }
  }

  function resetForm() {
    setSelectedOrder(null);
    setOrders([]);
    setSearchTerm('');
    setReturnItems([]);
    setReason(RETURN_REASONS[0]);
    setRefundMethod(REFUND_METHODS[0]);
    setNotes('');
    setDone(null);
  }

  // ── Success screen ──────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Return Processed</h2>
          <p className="text-gray-500 mb-1">Return ID: <span className="font-mono font-semibold text-gray-700">{done}</span></p>
          <p className="text-gray-500 mb-6">Refund: <span className="font-semibold text-gray-800">₹{getRefundTotal().toFixed(2)}</span> via {refundMethod}</p>
          <button onClick={resetForm} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Process Another Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-blue-600" /> Returns & Exchanges
            </h1>
            <p className="text-gray-500 text-sm mt-1">Search an order to initiate a return</p>
          </div>
          <button
            onClick={() => { setShowRecentReturns(v => !v); if (!showRecentReturns) loadRecentReturns(); }}
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          >
            Recent Returns {showRecentReturns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Recent returns */}
        {showRecentReturns && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Returns</h3>
            {loadingRecent ? (
              <div className="flex items-center gap-2 text-gray-400 py-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
            ) : recentReturns.length === 0 ? (
              <p className="text-gray-400 text-sm">No returns yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-4">Order #</th>
                      <th className="pb-2 pr-4">Customer</th>
                      <th className="pb-2 pr-4">Reason</th>
                      <th className="pb-2 pr-4">Refund</th>
                      <th className="pb-2">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReturns.map(r => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono text-xs">{r.originalOrderNumber}</td>
                        <td className="py-2 pr-4">{r.customerName || '—'}</td>
                        <td className="py-2 pr-4 text-gray-600">{r.reason}</td>
                        <td className="py-2 pr-4 font-semibold">₹{Number(r.refundTotal || 0).toFixed(2)}</td>
                        <td className="py-2 text-gray-600">{r.refundMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Find Original Order</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Bill number or customer phone…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchTerm.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Order results */}
          {orders.length > 0 && !selectedOrder && (
            <div className="mt-4 space-y-2">
              {orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-gray-800">{order.orderNumber}</span>
                    <span className="ml-3 text-gray-500 text-sm">{order.retailerName || order.customerName || 'Customer'}</span>
                    {order.phoneNumber && <span className="ml-2 text-gray-400 text-xs">{order.phoneNumber}</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-700">₹{getOrderTotal(order).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.invoiceDate || (order.createdAt?.toDate?.()?.toLocaleDateString() ?? '')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Return form */}
        {selectedOrder && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800">Order {selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.retailerName || selectedOrder.customerName || 'Customer'} · ₹{getOrderTotal(selectedOrder).toFixed(2)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Select Items to Return
              </h3>
              <div className="space-y-2">
                {(selectedOrder.lineItems || []).map((item, idx) => {
                  const ri = returnItems[idx];
                  if (!ri) return null;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition ${ri.selected ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <input
                        type="checkbox"
                        checked={ri.selected}
                        onChange={() => toggleItem(idx)}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Ordered: {item.quantity} · ₹{(item.unitPrice || item.price || 0).toFixed(2)} each</p>
                      </div>
                      {ri.selected && (
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-xs text-gray-500 font-medium">Return qty:</label>
                          <input
                            type="number"
                            min={1}
                            max={item.quantity}
                            value={ri.returnQty}
                            onChange={e => setReturnQty(idx, parseInt(e.target.value) || 0)}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      )}
                      {ri.selected && (
                        <p className="text-sm font-semibold text-blue-700 w-20 text-right shrink-0">
                          ₹{((item.unitPrice || item.price || 0) * ri.returnQty).toFixed(2)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Reason</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {RETURN_REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {REFUND_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Any additional details…"
              />
            </div>

            {/* Summary + submit */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Refund Total</p>
                <p className="text-2xl font-bold text-gray-800">₹{getRefundTotal().toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-0.5">via {refundMethod}</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || returnItems.filter(ri => ri.selected && ri.returnQty > 0).length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Process Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
