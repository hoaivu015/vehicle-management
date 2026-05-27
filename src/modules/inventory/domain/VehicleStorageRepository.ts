export interface VehicleStorageRepository {
  uploadImage(file: File, fileName?: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}
