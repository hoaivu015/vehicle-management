import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteVehicle } from '../DeleteVehicle';
import { VehicleRepository } from '../../domain/VehicleRepository';
import { VehicleStorageRepository } from '../../domain/VehicleStorageRepository';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('DeleteVehicle UseCase', () => {
  let mockVehicleRepo: Partial<VehicleRepository>;
  let mockStorageRepo: Partial<VehicleStorageRepository>;
  let useCase: DeleteVehicle;

  const mockAvailableVehicle = createMockVehicle({
    id: 1,
    code: 'XE01',
    name: 'Honda Civic 2021',
    status: VehicleStatus.IN_STOCK,
    year: '2021',
    odo: 20000,
    color: 'Trắng',
    purchase_price: 600000000,
    purchase_date: '2026-01-01',
    image_url: 'https://cloudinary.com/car1.jpg',
  });

  beforeEach(() => {
    mockVehicleRepo = {
      getById: vi.fn().mockResolvedValue(mockAvailableVehicle),
      delete: vi.fn().mockResolvedValue(undefined)
    };
    mockStorageRepo = {
      deleteImage: vi.fn().mockResolvedValue(undefined),
      uploadImage: vi.fn().mockResolvedValue('url')
    };

    useCase = new DeleteVehicle(
      mockVehicleRepo as VehicleRepository,
      mockStorageRepo as VehicleStorageRepository
    );
  });

  it('xóa xe thành công và xóa ảnh lưu trữ tương ứng', async () => {
    await useCase.execute(1);

    expect(mockStorageRepo.deleteImage).toHaveBeenCalledWith('https://cloudinary.com/car1.jpg');
    expect(mockVehicleRepo.delete).toHaveBeenCalledWith('1');
  });

  it('chặn xóa xe đã bán (status SOLD) và ném lỗi', async () => {
    (mockVehicleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAvailableVehicle,
      status: VehicleStatus.SOLD
    });

    await expect(useCase.execute(1)).rejects.toThrow(
      'Không thể xóa xe đã bán. Vui lòng hủy trạng thái Đã bán trước khi thực hiện xóa xe.'
    );
    expect(mockVehicleRepo.delete).not.toHaveBeenCalled();
    expect(mockStorageRepo.deleteImage).not.toHaveBeenCalled();
  });

  it('chặn xóa xe đã phát sinh thanh toán mua xe', async () => {
    (mockVehicleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAvailableVehicle,
      purchase_paid_amount: 100000000
    });

    await expect(useCase.execute(1)).rejects.toThrow(
      'Không thể xóa xe đã phát sinh thanh toán tiền mua. Vui lòng đối soát và hoàn tiền mua xe trước khi xóa.'
    );
    expect(mockVehicleRepo.delete).not.toHaveBeenCalled();
  });

  it('ném lỗi nếu không tìm thấy xe để xóa', async () => {
    (mockVehicleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow('Không tìm thấy xe để xóa');
    expect(mockVehicleRepo.delete).not.toHaveBeenCalled();
  });
});
