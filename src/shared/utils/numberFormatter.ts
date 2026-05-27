/**
 * Number and Currency Formatting Utilities
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
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(amount) + ' đ';
  }

  const absAmount = Math.abs(amount);

  if (absAmount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return billions.toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + ' Tỷ';
  }

  if (absAmount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return millions.toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + ' Tr';
  }

  if (absAmount >= 1_000) {
    return (amount / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + 'k';
  }

  return amount.toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + ' đ';
}

/**
 * Converts a number to Vietnamese text representation.
 */
export function numberToVietnameseText(amount: number): string {
  if (amount === 0) return 'Không đồng';
  

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
