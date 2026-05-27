import imageCompression from 'browser-image-compression';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.6,
  maxWidthOrHeight: 1600,
  useWebWorker: true
};

/**
 * Uploads an image to Cloudinary with compression.
 * This is the unified storage service for the entire application.
 * @param file The file to upload.
 * @param folder The folder in Cloudinary (defaults to 'inventory').
 * @returns The secure URL of the uploaded image.
 */
export const uploadImage = async (file: File, folder: string = 'inventory'): Promise<string> => {
  if (!UPLOAD_PRESET) {
    throw new Error('Cloudinary Upload Preset chưa được cấu hình. Vui lòng kiểm tra file .env.');
  }

  // 1. Compress image before upload
  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, DEFAULT_COMPRESSION_OPTIONS);
  } catch (compressError) {
    console.warn("Compression failed, using original:", compressError);
  }

  // 2. Prepare Form Data
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  // 3. Upload to Cloudinary API
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('Cloudinary API Error:', data.error);
      throw new Error(data.error.message || 'Lỗi từ máy chủ Cloudinary');
    }

    if (!data.secure_url) {
      throw new Error('Không nhận được URL ảnh từ Cloudinary');
    }

    return data.secure_url;
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Cloudinary Upload Exception:', err);
    throw new Error(err.message || 'Không thể kết nối đến máy chủ Cloudinary. Vui lòng kiểm tra kết nối mạng.');
  }
};
