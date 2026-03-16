// ─────────────────────────────────────────────────────────────────
//  GST Calculator Utility
//  Handles intra-state (CGST + SGST) vs inter-state (IGST) split
//  based on seller and buyer state comparison.
// ─────────────────────────────────────────────────────────────────

export interface GSTLineItem {
  description: string;
  hsnCode?: string;
  quantity: number;
  rate: number;          // Rate EXCLUSIVE of GST
  gstPct: number;        // Total GST % (e.g. 5, 12, 18, 28)
}

export interface GSTBreakdown {
  taxableValue: number;
  cgst: number;
  cgstPct: number;
  sgst: number;
  sgstPct: number;
  igst: number;
  igstPct: number;
  totalTax: number;
  grossAmount: number;   // taxableValue + totalTax
  isInterState: boolean;
}

export interface GSTLineResult extends GSTBreakdown {
  description: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  gstPct: number;
}

export interface GSTSummaryResult {
  lines: GSTLineResult[];
  totals: GSTBreakdown;
  // Grouped by GST rate for GSTR tables
  byRate: Record<number, {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  }>;
}

// Indian states — used to detect intra vs inter state
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
  'Lakshadweep', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Andaman and Nicobar Islands'
];

// Common GST rates in India
export const GST_RATES = [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28];

/**
 * Determine if a transaction is inter-state or intra-state.
 * If states are the same (or buyer state is empty) → intra-state (CGST+SGST).
 * Else → inter-state (IGST).
 */
export function isInterState(sellerState: string, buyerState: string): boolean {
  if (!buyerState || !sellerState) return false;
  return sellerState.trim().toLowerCase() !== buyerState.trim().toLowerCase();
}

/**
 * Calculate GST for a single line item.
 * Rate is EXCLUSIVE of GST (i.e., taxable = qty × rate).
 */
export function calcLineGST(
  item: GSTLineItem,
  sellerState: string,
  buyerState: string
): GSTLineResult {
  const interState = isInterState(sellerState, buyerState);
  const taxableValue = item.quantity * item.rate;
  const totalTax = taxableValue * (item.gstPct / 100);
  const halfPct = item.gstPct / 2;

  const cgst = interState ? 0 : taxableValue * (halfPct / 100);
  const sgst = interState ? 0 : taxableValue * (halfPct / 100);
  const igst = interState ? totalTax : 0;

  return {
    description: item.description,
    hsnCode: item.hsnCode || '',
    quantity: item.quantity,
    rate: item.rate,
    gstPct: item.gstPct,
    taxableValue,
    cgst,
    cgstPct: interState ? 0 : halfPct,
    sgst,
    sgstPct: interState ? 0 : halfPct,
    igst,
    igstPct: interState ? item.gstPct : 0,
    totalTax,
    grossAmount: taxableValue + totalTax,
    isInterState: interState,
  };
}

/**
 * Calculate GST for a full invoice — returns per-line breakdown, totals, and grouped-by-rate.
 * Rate is EXCLUSIVE of GST.
 */
export function calcInvoiceGST(
  items: GSTLineItem[],
  sellerState: string,
  buyerState: string
): GSTSummaryResult {
  const lines = items
    .filter(i => i.quantity > 0 || i.rate > 0)
    .map(i => calcLineGST(i, sellerState, buyerState));

  const totals: GSTBreakdown = {
    taxableValue: lines.reduce((s, l) => s + l.taxableValue, 0),
    cgst: lines.reduce((s, l) => s + l.cgst, 0),
    cgstPct: 0,
    sgst: lines.reduce((s, l) => s + l.sgst, 0),
    sgstPct: 0,
    igst: lines.reduce((s, l) => s + l.igst, 0),
    igstPct: 0,
    totalTax: lines.reduce((s, l) => s + l.totalTax, 0),
    grossAmount: lines.reduce((s, l) => s + l.grossAmount, 0),
    isInterState: isInterState(sellerState, buyerState),
  };

  // Group by GST rate for GSTR-style tables
  const byRate: GSTSummaryResult['byRate'] = {};
  for (const l of lines) {
    if (!byRate[l.gstPct]) {
      byRate[l.gstPct] = { taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    }
    byRate[l.gstPct].taxableValue += l.taxableValue;
    byRate[l.gstPct].cgst += l.cgst;
    byRate[l.gstPct].sgst += l.sgst;
    byRate[l.gstPct].igst += l.igst;
    byRate[l.gstPct].totalTax += l.totalTax;
  }

  return { lines, totals, byRate };
}

/**
 * Reverse calculation: given a GROSS amount (inclusive of GST),
 * extract the taxable value and tax amount.
 */
export function reverseCalcGST(grossAmount: number, gstPct: number): {
  taxableValue: number;
  taxAmount: number;
} {
  const taxableValue = grossAmount / (1 + gstPct / 100);
  const taxAmount = grossAmount - taxableValue;
  return { taxableValue, taxAmount };
}

/** Format a number as Indian currency string */
export function fmtINR(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Round to 2 decimal places */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
