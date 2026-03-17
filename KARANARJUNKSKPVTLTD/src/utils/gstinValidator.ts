/**
 * GSTIN Validator — validates Indian GST Identification Number format
 * Format: 2-digit state code + 10-digit PAN + 1 entity code + 1Z + 1 checksum
 * Example: 27AAPFU0939F1ZV (Maharashtra)
 */

export const INDIAN_STATES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli / Daman & Diu', '27': 'Maharashtra',
  '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa',
  '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana',
  '37': 'Andhra Pradesh (New)', '38': 'Ladakh',
};

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGSTIN(gstin: string): { valid: boolean; error?: string; state?: string } {
  if (!gstin) return { valid: false, error: 'GSTIN is required' };
  const g = gstin.trim().toUpperCase();
  if (g.length !== 15) return { valid: false, error: 'GSTIN must be exactly 15 characters' };
  if (!GSTIN_REGEX.test(g)) return { valid: false, error: 'Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)' };

  const stateCode = g.slice(0, 2);
  const stateName = INDIAN_STATES[stateCode];
  if (!stateName) return { valid: false, error: `Unknown state code: ${stateCode}` };

  return { valid: true, state: stateName };
}

export function getStateFromGSTIN(gstin: string): string {
  return INDIAN_STATES[gstin.slice(0, 2)] || 'Unknown';
}

/** Returns true if buyer and seller are in different states (IGST applies instead of CGST+SGST) */
export function isInterState(sellerGSTIN: string, buyerGSTIN: string): boolean {
  if (!sellerGSTIN || !buyerGSTIN) return false;
  return sellerGSTIN.slice(0, 2) !== buyerGSTIN.slice(0, 2);
}
