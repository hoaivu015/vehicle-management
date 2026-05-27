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
  } catch (e) {
    return dateString;
  }
};

/**
 * Calculates the number of days between a purchase date and today
 * or between purchase date and sale date if sold.
 */
export const calculateAging = (purchaseDate: string, saleDate?: string): number => {
  if (!purchaseDate) return 0;
  
  const start = new Date(purchaseDate);
  const end = saleDate ? new Date(saleDate) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  // Set both dates to midnight to get accurate day difference
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};
