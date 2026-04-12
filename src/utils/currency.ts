/**
 * Currency Utility for Vietnamese Dong (VND)
 */

/**
 * Formats a number into a human-readable currency string with dynamic scaling.
 * @param amount The amount in VND
 * @param options Formatting options
 */
export function formatCurrency(amount: number | undefined | null, options: { showFull?: boolean } = {}): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 đ';
  }

  if (options.showFull) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  }

  const absAmount = Math.abs(amount);

  if (absAmount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    // If it's a whole number or has simple decimal, use 1 or 2 decimal places
    return billions.toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + ' Tỷ';
  }

  if (absAmount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return millions.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' Tr';
  }

  if (absAmount >= 1_000) {
    return (amount / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + 'k';
  }

  return amount.toLocaleString('vi-VN') + ' đ';
}

/**
 * Parses a smart input string (e.g., "1.2t", "500tr", "50k") into a number.
 */
export function parseSmartInput(input: string): number {
  if (!input) return 0;
  
  // Remove spaces and commas, convert to lowercase
  const cleanInput = input.toLowerCase().replace(/[\s,]/g, '').replace(/đ/g, '');
  
  // Check for suffixes
  if (cleanInput.endsWith('t') || cleanInput.endsWith('ty') || cleanInput.endsWith('tỷ')) {
    const val = parseFloat(cleanInput.replace(/(t|ty|tỷ)$/, ''));
    return isNaN(val) ? 0 : val * 1_000_000_000;
  }
  
  if (cleanInput.endsWith('tr') || cleanInput.endsWith('m')) {
    const val = parseFloat(cleanInput.replace(/(tr|m)$/, ''));
    return isNaN(val) ? 0 : val * 1_000_000;
  }
  
  if (cleanInput.endsWith('k')) {
    const val = parseFloat(cleanInput.replace(/k$/, ''));
    return isNaN(val) ? 0 : val * 1_000;
  }
  
  // Default: try to parse as a raw number (might have dots as separators)
  const rawVal = parseFloat(cleanInput.replace(/\./g, ''));
  return isNaN(rawVal) ? 0 : rawVal;
}

/**
 * Converts a number to Vietnamese text representation.
 */
export function numberToVietnameseText(amount: number): string {
  if (amount === 0) return 'Không đồng';
  
  const units = ['', 'nghìn', 'triệu', 'tỷ'];
  const absAmount = Math.abs(amount);
  
  if (absAmount < 1000) return `${amount} đồng`;

  const parts: string[] = [];
  
  const billions = Math.floor(absAmount / 1_000_000_000);
  const millions = Math.floor((absAmount % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((absAmount % 1_000_000) / 1_000);
  const remainder = absAmount % 1_000;

  if (billions > 0) parts.push(`${billions} tỷ`);
  if (millions > 0) parts.push(`${millions} triệu`);
  if (thousands > 0) parts.push(`${thousands} nghìn`);
  if (remainder > 0) parts.push(`${remainder} đồng`);

  let text = parts.join(' ');
  if (amount < 0) text = 'Âm ' + text;
  
  return text.charAt(0).toUpperCase() + text.slice(1);
}
