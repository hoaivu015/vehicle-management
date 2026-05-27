import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStorageRepository } from '../domain/VehicleStorageRepository';

export class DeleteVehicle {
  constructor(
    private readonly repository: VehicleRepository,
    private readonly storageRepository: VehicleStorageRepository
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Kiểm tra tồn tại và lấy URL ảnh
    const car = await this.repository.getById(id.toString());
    if (!car) throw new Error('Không tìm thấy xe để xóa');

    if (car.status === 'SOLD') {
      throw new Error('Không thể xóa xe đã bán. Vui lòng hủy trạng thái Đã bán trước khi thực hiện xóa xe.');
    }

    // 2. Xóa ảnh nếu có
    if (car.image_url) {
      try {
        await this.storageRepository.deleteImage(car.image_url);
      } catch (e) {
        console.error('Failed to delete associated image:', e);
        // We continue deleting the record even if image deletion fails
      }
    }
    
    // 3. Thực hiện xóa thông qua Repository
    await this.repository.delete(id.toString());
  }
}
