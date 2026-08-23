import { diffCalendarDays } from './vehicle_calculations';

/**
 * Date Utilities
 */

/**
 * Formats a date string (YYYY-MM-DD) to dd-mm-yy
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '---';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback to original if invalid
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
};

/**
 * Calculates the number of days between a purchase date and today
 * or between purchase date and sale date if sold (SSoT).
 */
export const calculateAging = (purchaseDate: string, saleDate?: string): number => {
  return diffCalendarDays(purchaseDate, saleDate);
};

/**
 * Returns YYYY-MM-DD string in local timezone (GMT+7 safe)
 */
export const getTodayDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns YYYY-MM string in local timezone (GMT+7 safe)
 */
export const getTodayMonthString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};


