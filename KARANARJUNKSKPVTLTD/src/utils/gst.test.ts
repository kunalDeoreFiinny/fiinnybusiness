import { describe, it, expect } from 'vitest';
import { calcLineGST, calcInvoiceGST } from '../utils/gstCalculator';
import { validateGSTIN, isInterState, getStateFromGSTIN } from '../utils/gstinValidator';

// ─── GST Calculator Tests ──────────────────────────────────────────────────

describe('calcLineGST', () => {
  it('intra-state 18% splits into CGST 9% + SGST 9%', () => {
    const result = calcLineGST({ description: 'Test', quantity: 1, rate: 1000, gstPct: 18 }, 'Maharashtra', 'Maharashtra');
    expect(result.cgst).toBe(90);
    expect(result.sgst).toBe(90);
    expect(result.igst).toBe(0);
    expect(result.grossAmount).toBe(1180);
  });

  it('inter-state 18% uses IGST only', () => {
    const result = calcLineGST({ description: 'Test', quantity: 1, rate: 1000, gstPct: 18 }, 'Maharashtra', 'Delhi');
    expect(result.igst).toBe(180);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.grossAmount).toBe(1180);
  });

  it('intra-state 5% splits correctly', () => {
    const result = calcLineGST({ description: 'Test', quantity: 1, rate: 500, gstPct: 5 }, 'Karnataka', 'Karnataka');
    expect(result.cgst).toBe(12.5);
    expect(result.sgst).toBe(12.5);
    expect(result.igst).toBe(0);
  });

  it('0% GST results in zero tax', () => {
    const result = calcLineGST({ description: 'Test', quantity: 1, rate: 1000, gstPct: 0 }, 'Maharashtra', 'Maharashtra');
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(0);
    expect(result.grossAmount).toBe(1000);
  });

  it('28% GST inter-state applies IGST', () => {
    const result = calcLineGST({ description: 'Test', quantity: 1, rate: 1000, gstPct: 28 }, 'Tamil Nadu', 'Maharashtra');
    expect(result.igst).toBe(280);
    expect(result.grossAmount).toBe(1280);
  });
});


// ─── GSTIN Validator Tests ─────────────────────────────────────────────────

describe('validateGSTIN', () => {
  it('accepts valid Maharashtra GSTIN', () => {
    const result = validateGSTIN('27AAPFU0939F1ZV');
    expect(result.valid).toBe(true);
    expect(result.state).toBe('Maharashtra');
  });

  it('rejects wrong length', () => {
    const result = validateGSTIN('27AAPFU0939F1Z');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('15 characters');
  });

  it('rejects invalid format', () => {
    const result = validateGSTIN('INVALIDGSTIN1234');
    expect(result.valid).toBe(false);
  });

  it('rejects unknown state code', () => {
    const result = validateGSTIN('99AAPFU0939F1ZV');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('state code');
  });

  it('accepts empty string gracefully', () => {
    const result = validateGSTIN('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });
});

// ─── Inter-state Detection Tests ──────────────────────────────────────────

describe('isInterState', () => {
  it('same state is intra-state', () => {
    expect(isInterState('27AAPFU0939F1ZV', '27XXXXX9999X1ZX')).toBe(false);
  });

  it('different states is inter-state', () => {
    expect(isInterState('27AAPFU0939F1ZV', '07XXXXX9999X1ZX')).toBe(true);
  });
});

describe('getStateFromGSTIN', () => {
  it('returns state name for known code', () => {
    expect(getStateFromGSTIN('27AAPFU0939F1ZV')).toBe('Maharashtra');
  });
  it('returns Delhi for code 07', () => {
    expect(getStateFromGSTIN('07AAPFU0939F1ZV')).toBe('Delhi');
  });
});
