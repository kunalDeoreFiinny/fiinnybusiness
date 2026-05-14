import React from 'react';
import { Icons } from './Icons';

type ShipmentStatus =
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

interface Step {
  key: ShipmentStatus | 'placed';
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    key: 'placed',
    label: 'Order Placed',
    sublabel: 'Payment confirmed',
    icon: Icons.CheckCircle,
  },
  {
    key: 'processing',
    label: 'Processing',
    sublabel: 'Being prepared',
    icon: Icons.Box,
  },
  {
    key: 'packed',
    label: 'Packed',
    sublabel: 'Ready to dispatch',
    icon: Icons.PackageCheck,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    sublabel: 'On the way',
    icon: Icons.Truck,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    sublabel: 'Arriving today',
    icon: Icons.MapPin,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    sublabel: 'Order complete',
    icon: Icons.CheckCircle2,
  },
];

const STATUS_ORDER: (ShipmentStatus | 'placed')[] = [
  'placed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

function getActiveIndex(status?: ShipmentStatus | null): number {
  if (!status) return 0; // only "placed" is done
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

interface Props {
  shipmentStatus?: ShipmentStatus | null;
  trackingId?: string;
  cancelled?: boolean;
}

export function OrderTracker({ shipmentStatus, trackingId, cancelled }: Props) {
  const activeIdx = getActiveIndex(shipmentStatus);

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
        <Icons.AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <p className="font-sans font-bold text-red-700 text-sm">Shipment Cancelled</p>
          <p className="font-sans text-xs text-red-600 mt-0.5">This order has been cancelled or returned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-0">
        {STEPS.map((step, idx) => {
          const done = idx <= activeIdx;
          const active = idx === activeIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    idx < activeIdx ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  style={{ left: '50%' }}
                />
              )}

              {/* Icon circle */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? active
                      ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200'
                      : 'bg-emerald-500 border-emerald-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${done ? 'text-white' : 'text-slate-300'}`}
                />
                {active && (
                  <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center px-1">
                <p
                  className={`font-sans text-[11px] font-bold leading-tight ${
                    done ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`font-sans text-[10px] mt-0.5 leading-tight ${
                    active ? 'text-emerald-600' : 'text-slate-300'
                  }`}
                >
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {trackingId && (
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 mt-2">
          <Icons.QrCode className="w-4 h-4 text-primary/50 shrink-0" />
          <span className="font-sans text-xs font-semibold text-primary/60">AWB / Tracking ID</span>
          <span className="font-mono text-xs text-primary font-bold ml-1">{trackingId}</span>
        </div>
      )}
    </div>
  );
}
