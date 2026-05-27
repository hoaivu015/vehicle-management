/**
 * Cloudinary Optimization Utility.
 * Transforms Cloudinary URLs to include optimization parameters for mobile performance.
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | string;
  crop?: 'fill' | 'scale' | 'thumb' | 'fit';
}

export const optimizeCloudinaryUrl = (url: string | null | undefined, options: CloudinaryOptions = {}): string => {
  if (!url) return "/default-car.jpg";
  if (!url.includes('cloudinary.com')) return url;

  const {
    width = 800,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  // Parameters to inject
  const params = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`
  ];

  if (options.height) {
    params.push(`h_${options.height}`);
  }

  const transformation = params.join(',');

  // Handle both /upload/ and /v12345/ paths
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  return url;
};
