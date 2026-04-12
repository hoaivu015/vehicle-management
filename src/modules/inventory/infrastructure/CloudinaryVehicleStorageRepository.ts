import { VehicleStorageRepository } from './SupabaseVehicleStorageRepository';
import { supabase } from '../../../shared/infrastructure/supabase';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export class CloudinaryVehicleStorageRepository implements VehicleStorageRepository {
  async uploadImage(file: File, fileName?: string): Promise<string> {
    if (!UPLOAD_PRESET) {
      throw new Error('Cloudinary Upload Preset chưa được cấu hình. Vui lòng kiểm tra file .env hoặc cài đặt Cloudinary.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    if (fileName) {
      // For unsigned uploads, Cloudinary only respects public_id if the preset 
      // is configured to allow it.
      formData.append('public_id', fileName);
    }
    
    formData.append('folder', 'inventory');

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
        throw new Error(data.error.message);
      }

      return data.secure_url;
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error);
      throw new Error(error.message || 'Không thể kết nối đến máy chủ Cloudinary');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl || !imageUrl.includes('cloudinary')) return;

      const { data, error } = await supabase.functions.invoke('delete-cloudinary-image', {
        body: { imageUrl }
      });

      if (error) throw error;
      console.log('Cloudinary image deletion request sent:', data);
    } catch (e) {
      console.error('Failed to delete image from Cloudinary:', e);
    }
  }
}
