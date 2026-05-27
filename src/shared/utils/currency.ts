/**
 * Currency Utility for Vietnamese Dong (VND)
 * Now refactored to use dedicated number modules for formatting and parsing.
 */

export { formatCurrency, formatCurrency as formatVND, numberToVietnameseText } from './numberFormatter';
export { parseSmartInput } from './numberParser';
