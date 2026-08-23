/**
 * Smart Input Parser for numeric values with abbreviations
 */

/**
 * Parses a smart input string (e.g., "1.2t", "500tr", "50k", "1,5tr", "1.500k", "1.500tr") into a number.
 * Supports Vietnamese decimal (,) and thousand (.) separators as well as English formats.
 */
export function parseSmartInput(input: string): number {
  if (!input) return 0;
  
  // Convert to lowercase and remove spaces & currency symbols
  const cleanInput = input.toLowerCase().replace(/\s/g, '').replace(/đ/g, '');
  
  // Detect if it has common abbreviations
  const suffixMatch = cleanInput.match(/(tỷ|ty|tr|t|m|k)$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  const numPart = suffix ? cleanInput.slice(0, -suffix.length) : cleanInput;

  let normalizedNum = numPart;

  if (numPart.includes('.') && numPart.includes(',')) {
    // Both separators present: Determine which is decimal
    const lastDot = numPart.lastIndexOf('.');
    const lastComma = numPart.lastIndexOf(',');
    if (lastComma > lastDot) {
      // vi-VN format: 1.500,5
      normalizedNum = numPart.replace(/\./g, '').replace(',', '.');
    } else {
      // en-US format: 1,500.5
      normalizedNum = numPart.replace(/,/g, '');
    }
  } else if (numPart.includes('.')) {
    // Only dot present:
    // If followed by groups of 3 digits e.g. "1.500.000" or single group "1.500" with suffix "1.500k"
    if (/^\d{1,3}(\.\d{3})+$/.test(numPart)) {
      normalizedNum = numPart.replace(/\./g, '');
    } else if (suffix && /^\d+\.\d{3}$/.test(numPart)) {
      normalizedNum = numPart.replace(/\./g, '');
    } else {
      // Decimal dot e.g. "1.5" or "1.25"
      normalizedNum = numPart;
    }
  } else if (numPart.includes(',')) {
    // Only comma present:
    if (/^\d{1,3}(,\d{3})+$/.test(numPart)) {
      normalizedNum = numPart.replace(/,/g, '');
    } else if (suffix && /^\d+,\d{3}$/.test(numPart)) {
      normalizedNum = numPart.replace(/,/g, '');
    } else {
      // Decimal comma e.g. "1,5" -> "1.5"
      normalizedNum = numPart.replace(',', '.');
    }
  }

  const val = parseFloat(normalizedNum);
  if (isNaN(val)) return 0;

  if (suffix === 't' || suffix === 'ty' || suffix === 'tỷ') {
    return Math.round(val * 1_000_000_000);
  }
  if (suffix === 'tr' || suffix === 'm') {
    return Math.round(val * 1_000_000);
  }
  if (suffix === 'k') {
    return Math.round(val * 1_000);
  }

  return Math.round(val);
}
