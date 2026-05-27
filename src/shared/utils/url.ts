/**
 * Utility functions for URL manipulation
 */

/**
 * Sanitizes an image URL by trimming whitespace.
 * @param url The raw URL string
 * @returns Sanitized URL string
 */
export const sanitizeImageUrl = (url: string): string => {
  return url.trim();
};

/**
 * Converts a Google Drive sharing link to a direct image link.
 * @param url The raw Google Drive URL
 * @returns A direct link to the image or the original URL if not a Drive link
 */
export const convertDriveLink = (url: string): string => {
  const cleanUrl = url.trim();
  
  // Pattern 1: Standard sharing link /file/d/ID/view...
  const driveIdMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    const fileId = driveIdMatch[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }
  
  // Pattern 2: Open link drive.google.com/open?id=ID
  const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (cleanUrl.includes('drive.google.com') && idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?id=${idMatch[1]}&export=view`;
  }

  return cleanUrl;
};
