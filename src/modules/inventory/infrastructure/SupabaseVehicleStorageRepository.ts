import { supabase } from '../../../shared/infrastructure/supabase';

export interface VehicleStorageRepository {
  uploadImage(file: File, fileName?: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}

export class SupabaseVehicleStorageRepository implements VehicleStorageRepository {
  private readonly bucketName = 'images';

  async uploadImage(file: File, requestedFileName?: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const finalFileName = requestedFileName 
      ? `${requestedFileName}.${fileExt}`
      : `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
    const filePath = `inventory/${finalFileName}`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      if (error.message.includes('bucket not found')) {
        throw new Error(`Bucket "${this.bucketName}" không tồn tại. Vui lòng tạo bucket trong Supabase Console.`);
      }
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl) return;

      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      
      const bucketIdx = pathParts.indexOf(this.bucketName);
      if (bucketIdx === -1) {
        // Fallback for different URL structures
        const inventoryIdx = pathParts.indexOf('inventory');
        if (inventoryIdx === -1) return;
        
        const filePath = pathParts.slice(inventoryIdx).join('/');
        await supabase.storage.from(this.bucketName).remove([filePath]);
        return;
      }

      const filePath = pathParts.slice(bucketIdx + 1).join('/');
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
    } catch (e: any) {
      console.error('Failed to delete image from Supabase:', e.message);
    }
  }
}
