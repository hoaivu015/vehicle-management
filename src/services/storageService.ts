import { supabase } from '@/src/shared/infrastructure/supabase';
import imageCompression from 'browser-image-compression';

const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.6,
  maxWidthOrHeight: 1600,
  useWebWorker: true
};

const UPLOAD_TIMEOUT_MS = 90000;

/**
 * Uploads an image to Firebase Storage with compression.
 * @param file The file to upload.
 * @param folder The folder in storage.
 * @returns The download URL of the uploaded image.
 */
export const uploadImage = async (file: File, folder: string = 'cars'): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Vui lòng đăng nhập để tải ảnh lên hệ thống.");
  }

  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, DEFAULT_COMPRESSION_OPTIONS);
  } catch (compressError) {
    console.warn("Compression failed, using original:", compressError);
  }

  const fileName = (fileToUpload as File).name || 'image.jpg';
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  const storagePath = `${Date.now()}_${cleanFileName}`;
  
  const uploadTask = supabase.storage.from(folder).upload(storagePath, fileToUpload, {
    cacheControl: '3600',
    upsert: false
  });

  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Quá thời gian tải lên (90 giây). Vui lòng kiểm tra kết nối mạng.")), UPLOAD_TIMEOUT_MS)
  );

  try {
    const response = await Promise.race([uploadTask, timeout]) as any;
    
    if (response.error) {
      throw response.error;
    }

    const { data: { publicUrl } } = supabase.storage.from(folder).getPublicUrl(storagePath);
    return publicUrl;
  } catch (error: any) {
    console.error("Storage upload error details:", error);
    if (error.statusCode === '403') {
      throw new Error("Bạn không có quyền tải ảnh lên. Vui lòng liên hệ quản trị viên để kiểm tra quyền access Bucket.");
    }
    throw error;
  }
};
