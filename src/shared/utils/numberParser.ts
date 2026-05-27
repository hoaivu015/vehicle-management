/**
 * Smart Input Parser for numeric values with abbreviations
 */

/**
 * Parses a smart input string (e.g., "1.2t", "500tr", "50k", "1,5tr") into a number.
 * Supports Vietnamese decimal (,) and thousand (.) separators.
 */
export function parseSmartInput(input: string): number {
  if (!input) return 0;
  
  // Convert to lowercase and remove spaces
  let cleanInput = input.toLowerCase().replace(/\s/g, '').replace(/đ/g, '');
  
  // Detect if it has common abbreviations
  const hasSuffix = /[kmtrtyỷ]$/.test(cleanInput);
  
  if (hasSuffix) {
    // If it has a suffix, treat both ',' and '.' as decimal separators
    // because people rarely use thousand separators when typing "1.5tr"
    cleanInput = cleanInput.replace(/,/g, '.');
  } else {
    // If no suffix, assume vi-VN standard: '.' is thousand, ',' is decimal
    // We remove thousand dots and change decimal comma to dot
    cleanInput = cleanInput.replace(/\./g, '').replace(/,/g, '.');
  }

  // Check for suffixes and multiply accordingly
  if (cleanInput.endsWith('t') || cleanInput.endsWith('ty') || cleanInput.endsWith('tỷ')) {
    const val = parseFloat(cleanInput.replace(/(t|ty|tỷ)$/, ''));
    return isNaN(val) ? 0 : Math.round(val * 1_000_000_000);
  }
  
  if (cleanInput.endsWith('tr') || cleanInput.endsWith('m')) {
    const val = parseFloat(cleanInput.replace(/(tr|m)$/, ''));
    return isNaN(val) ? 0 : Math.round(val * 1_000_000);
  }
  
  if (cleanInput.endsWith('k')) {
    const val = parseFloat(cleanInput.replace(/k$/, ''));
    return isNaN(val) ? 0 : Math.round(val * 1_000);
  }
  
  // Default: try to parse as a raw number
  const rawVal = parseFloat(cleanInput);
  return isNaN(rawVal) ? 0 : rawVal;
}
