import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from './Icons';
import { OrderTracker } from './OrderTracker';

export interface PaymentDetailOrder {
  id: string;
  createdAt?: { seconds?: number } | string;
  status?: string;
  totalAmount?: number;
  items?: Array<{ id?: string; name: string; quantity: number; price?: number }>;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  state?: string;
  district?: string;
  pinCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  failureReason?: string;
  shipmentStatus?: 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingId?: string;
  shiprocketOrderId?: string;
}

interface Props {
  order: PaymentDetailOrder | null;
  onClose: () => void;
  isAdmin?: boolean;
  onShipmentUpdate?: (
    orderId: string,
    data: { shipmentStatus?: string; trackingId?: string },
  ) => Promise<void>;
  onCreateShiprocket?: (orderId: string) => Promise<void>;
}

const SHIPMENT_STATUSES = [
  { value: 'processing',       label: 'Processing — Being Prepared' },
  { value: 'packed',           label: 'Packed — Ready to Dispatch' },
  { value: 'shipped',          label: 'Shipped — In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered',        label: 'Delivered' },
  { value: 'cancelled',        label: 'Cancelled' },
];

export function PaymentDetailModal({
  order,
  onClose,
  isAdmin = false,
  onShipmentUpdate,
  onCreateShiprocket,
}: Props) {
  const [shipStatus, setShipStatus] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [savingShipment, setSavingShipment] = useState(false);
  const [creatingShiprocket, setCreatingShiprocket] = useState(false);
  const [shipmentMsg, setShipmentMsg] = useState('');

  const date = !order
    ? '-'
    : typeof order.createdAt === 'string'
      ? order.createdAt
      : order.createdAt?.seconds
        ? new Date(order.createdAt.seconds * 1000).toLocaleString('en-IN')
        : '-';

  const handleSaveShipment = async () => {
    if (!order || !onShipmentUpdate) return;
    setSavingShipment(true);
    setShipmentMsg('');
    try {
      await onShipmentUpdate(order.id, {
        ...(shipStatus ? { shipmentStatus: shipStatus } : {}),
        ...(trackingInput.trim() ? { trackingId: trackingInput.trim() } : {}),
      });
      setShipmentMsg('Shipment updated successfully.');
      setShipStatus('');
      setTrackingInput('');
    } catch {
      setShipmentMsg('Failed to update. Please try again.');
    } finally {
      setSavingShipment(false);
    }
  };

  const handleCreateShiprocket = async () => {
    if (!order || !onCreateShiprocket) return;
    setCreatingShiprocket(true);
    setShipmentMsg('');
    try {
      await onCreateShiprocket(order.id);
      setShipmentMsg('Shipment created on ShipRocket successfully.');
    } catch (err) {
      setShipmentMsg(err instanceof Error ? err.message : 'ShipRocket creation failed.');
    } finally {
      setCreatingShiprocket(false);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="bg-white relative z-10 w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100">
              <div>
                <h2 className="font-sans text-2xl font-bold text-primary">Order Details</h2>
                <p className="font-mono text-sm text-primary/50 mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Icons.X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="px-8 py-7 space-y-7">

              {/* Status badges + date */}
              <div className="flex flex-wrap gap-4 items-start">
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-2">Payment</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-sans font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.paymentStatus ?? 'pending'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-2">Order Status</p>
                  <span className="px-3 py-1.5 rounded-full text-sm font-sans font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {order.status ?? 'Placed'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-2">Date</p>
                  <span className="text-sm font-sans font-semibold text-primary/70">{date}</span>
                </div>
              </div>

              {/* Failure reason */}
              {order.paymentStatus === 'failed' && order.failureReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex gap-3">
                  <Icons.AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-sans font-bold text-red-700">Payment Failed</p>
                    <p className="text-sm font-sans text-red-600 mt-1">{order.failureReason}</p>
                  </div>
                </div>
              )}

              {/* Tracking timeline — only for paid orders */}
              {order.paymentStatus === 'paid' && (
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-4">
                    Order Tracking
                  </p>
                  <OrderTracker
                    shipmentStatus={order.shipmentStatus ?? null}
                    trackingId={order.trackingId}
                    cancelled={order.shipmentStatus === 'cancelled'}
                  />
                </div>
              )}

              {/* Razorpay IDs */}
              {(order.razorpayPaymentId || order.razorpayOrderId) && (
                <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                  {order.razorpayPaymentId && (
                    <div className="flex gap-3 items-start">
                      <span className="font-sans text-sm font-bold text-primary/50 w-32 shrink-0">Payment ID</span>
                      <span className="font-mono text-sm text-primary/80 break-all">{order.razorpayPaymentId}</span>
                    </div>
                  )}
                  {order.razorpayOrderId && (
                    <div className="flex gap-3 items-start">
                      <span className="font-sans text-sm font-bold text-primary/50 w-32 shrink-0">Razorpay Order</span>
                      <span className="font-mono text-sm text-primary/80 break-all">{order.razorpayOrderId}</span>
                    </div>
                  )}
                  {order.shiprocketOrderId && (
                    <div className="flex gap-3 items-start">
                      <span className="font-sans text-sm font-bold text-primary/50 w-32 shrink-0">ShipRocket ID</span>
                      <span className="font-mono text-sm text-primary/80 break-all">{order.shiprocketOrderId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Customer */}
              {(order.customerName || order.customerPhone || order.customerEmail) && (
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-3">Customer</p>
                  <div className="space-y-1.5">
                    {order.customerName && (
                      <p className="text-base font-sans font-bold text-primary">{order.customerName}</p>
                    )}
                    {order.customerEmail && (
                      <p className="text-sm font-sans text-primary/60">{order.customerEmail}</p>
                    )}
                    {order.customerPhone && (
                      <p className="text-sm font-sans text-primary/60">{order.customerPhone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery address */}
              {(order.address || order.state || order.district) && (
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-3">
                    Delivery Address
                  </p>
                  <p className="text-base font-sans text-primary/80 leading-relaxed">
                    {[order.address, order.district, order.state, order.pinCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div>
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40 mb-3">Items</p>
                  <div>
                    {order.items.map((item, idx) => (
                      <div
                        key={item.id ?? idx}
                        className="flex justify-between items-center py-3.5 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="text-base font-sans font-semibold text-primary">{item.name}</p>
                          <p className="text-sm font-sans text-primary/50 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        {item.price != null && (
                          <p className="text-base font-sans font-bold text-primary">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-200">
                <p className="font-sans font-bold text-primary text-lg">Total Amount</p>
                <p className="font-sans text-3xl font-black text-primary">
                  ₹{Number(order.totalAmount ?? 0).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Admin shipment management panel */}
              {isAdmin && order.paymentStatus === 'paid' && (
                <div className="border-t-2 border-dashed border-slate-200 pt-6 space-y-4">
                  <p className="text-xs font-sans font-bold uppercase tracking-widest text-primary/40">
                    Shipment Management
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-sans font-semibold text-primary/70">Update Status</label>
                      <select
                        value={shipStatus}
                        onChange={(e) => setShipStatus(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">— Select new status —</option>
                        {SHIPMENT_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-sans font-semibold text-primary/70">AWB / Tracking ID</label>
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="e.g. 1234567890"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => void handleSaveShipment()}
                      disabled={savingShipment || (!shipStatus && !trackingInput.trim())}
                      className="flex-1 py-3 px-5 bg-primary text-secondary-container rounded-xl font-sans font-bold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {savingShipment ? (
                        <><div className="w-4 h-4 border-2 border-secondary-container/30 border-t-secondary-container rounded-full animate-spin" /> Saving…</>
                      ) : (
                        <><Icons.CheckCircle className="w-4 h-4" /> Save Status</>
                      )}
                    </button>

                    {onCreateShiprocket && !order.shiprocketOrderId && (
                      <button
                        onClick={() => void handleCreateShiprocket()}
                        disabled={creatingShiprocket}
                        className="flex-1 py-3 px-5 bg-emerald-600 text-white rounded-xl font-sans font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creatingShiprocket ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                        ) : (
                          <><Icons.Truck className="w-4 h-4" /> Create ShipRocket Shipment</>
                        )}
                      </button>
                    )}

                    {order.shiprocketOrderId && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl">
                        <Icons.CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-sans font-semibold text-emerald-700">
                          ShipRocket #{order.shiprocketOrderId}
                        </span>
                      </div>
                    )}
                  </div>

                  {shipmentMsg && (
                    <p className={`text-sm font-sans font-semibold ${
                      shipmentMsg.includes('success') ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {shipmentMsg}
                    </p>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
