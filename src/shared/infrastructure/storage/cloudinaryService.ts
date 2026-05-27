export const uploadToCloudinary = async (file: File, publicId?: string): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Thiếu cấu hình Cloudinary trong environment variables.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  
  // Create signature using Web Crypto API
  // Parameters must be sorted alphabetically: public_id, timestamp
  let signatureString = `timestamp=${timestamp}${apiSecret}`;
  if (publicId) {
    signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  }

  const encodedAsBytes = new TextEncoder().encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', encodedAsBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  if (publicId) {
    formData.append('public_id', publicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Lỗi khi tải ảnh lên Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
};
