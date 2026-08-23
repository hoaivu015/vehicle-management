import { describe, it, expect } from 'vitest';
import { parseSmartInput } from '../numberParser';

describe('numberParser - parseSmartInput', () => {
  it('handles standard integer inputs', () => {
    expect(parseSmartInput('1000')).toBe(1000);
    expect(parseSmartInput('5000000')).toBe(5000000);
  });

  it('handles empty or invalid inputs', () => {
    expect(parseSmartInput('')).toBe(0);
    expect(parseSmartInput('abc')).toBe(0);
  });

  it('handles "k" (thousands) abbreviations correctly', () => {
    expect(parseSmartInput('50k')).toBe(50000);
    expect(parseSmartInput('500k')).toBe(500000);
    expect(parseSmartInput('1.5k')).toBe(1500);
    expect(parseSmartInput('1,5k')).toBe(1500);
    // Thousand separator before k
    expect(parseSmartInput('1.500k')).toBe(1500000);
    expect(parseSmartInput('1,500k')).toBe(1500000);
  });

  it('handles "tr" / "m" (millions) abbreviations correctly', () => {
    expect(parseSmartInput('50tr')).toBe(50000000);
    expect(parseSmartInput('500tr')).toBe(500000000);
    expect(parseSmartInput('1.5tr')).toBe(1500000);
    expect(parseSmartInput('1,5tr')).toBe(1500000);
    expect(parseSmartInput('1.5m')).toBe(1500000);
    // Thousand separator before tr
    expect(parseSmartInput('1.500tr')).toBe(1500000000);
    expect(parseSmartInput('1,500tr')).toBe(1500000000);
  });

  it('handles "t" / "ty" / "tỷ" (billions) abbreviations correctly', () => {
    expect(parseSmartInput('1t')).toBe(1000000000);
    expect(parseSmartInput('2.5t')).toBe(2500000000);
    expect(parseSmartInput('1,2tỷ')).toBe(1200000000);
    expect(parseSmartInput('3ty')).toBe(3000000000);
  });

  it('handles formatted strings with thousand separators without suffix', () => {
    expect(parseSmartInput('1.500.000')).toBe(1500000);
    expect(parseSmartInput('1,500,000')).toBe(1500000);
    expect(parseSmartInput('500.000.000')).toBe(500000000);
    expect(parseSmartInput('1.500.000 đ')).toBe(1500000);
  });
});
