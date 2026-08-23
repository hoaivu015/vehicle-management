import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateVehicleStatus, UpdateStatusRequest } from '../UpdateVehicleStatus';
import { VehicleRepository } from '../../domain/VehicleRepository';
import { VehicleStatus, UserRole } from '../../../../shared/domain/constants';
import { UnauthorizedError } from '../../../../shared/domain/errors';
import { createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('UpdateVehicleStatus UseCase', () => {
  let mockVehicleRepo: Partial<VehicleRepository>;
  let useCase: UpdateVehicleStatus;

  const mockVehicle = createMockVehicle({
    id: 1,
    code: 'XE01',
    name: 'Mazda 3 2022',
    status: VehicleStatus.IN_STOCK,
    year: '2022',
    odo: 15000,
    color: 'Đỏ',
    purchase_price: 500000000,
    purchase_date: '2026-01-01',
  });

  beforeEach(() => {
    mockVehicleRepo = {
      getById: vi.fn().mockResolvedValue(mockVehicle),
      updateStatus: vi.fn().mockResolvedValue(undefined)
    };

    useCase = new UpdateVehicleStatus(mockVehicleRepo as VehicleRepository);
  });

  it('chuyển trạng thái hợp lệ thành công với quyền ACCOUNTANT / ADMIN (IN_STOCK -> DEPOSIT_SALE)', async () => {
    const request: UpdateStatusRequest = {
      id: 1,
      nextStatus: VehicleStatus.DEPOSIT_SALE,
      user: 'ACC01',
      userRole: UserRole.ACCOUNTANT,
      note: 'Khách đặt cọc giữ xe'
    };

    await useCase.execute(request);

    expect(mockVehicleRepo.updateStatus).toHaveBeenCalledWith(
      1,
      VehicleStatus.DEPOSIT_SALE,
      expect.objectContaining({
        status: VehicleStatus.DEPOSIT_SALE,
        user: 'ACC01',
        note: 'Khách đặt cọc giữ xe'
      }),
      undefined
    );
  });

  it('chặn nhân viên SALE đổi trạng thái xe (Zero Trust RBAC: Sale không có quyền EDIT_INVENTORY)', async () => {
    const request: UpdateStatusRequest = {
      id: 1,
      nextStatus: VehicleStatus.DEPOSIT_SALE,
      user: 'SALE01',
      userRole: UserRole.STAFF // Sale không có quyền đổi trạng thái xe
    };

    await expect(useCase.execute(request)).rejects.toThrow(UnauthorizedError);
    expect(mockVehicleRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('ném lỗi nếu chuyển trạng thái không hợp lệ theo State Machine (IN_STOCK -> BANK_CONFIRMED)', async () => {
    const request: UpdateStatusRequest = {
      id: 1,
      nextStatus: VehicleStatus.BANK_CONFIRMED, // Không hợp lệ từ IN_STOCK
      user: 'ADMIN01',
      userRole: UserRole.ADMIN
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      'Chuyển đổi trạng thái từ IN_STOCK sang BANK_CONFIRMED không hợp lệ.'
    );
    expect(mockVehicleRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('ném lỗi nếu không tìm thấy xe', async () => {
    (mockVehicleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const request: UpdateStatusRequest = {
      id: 999,
      nextStatus: VehicleStatus.DEPOSIT_SALE,
      user: 'ADMIN01',
      userRole: UserRole.ADMIN
    };

    await expect(useCase.execute(request)).rejects.toThrow('Không tìm thấy xe');
  });
});
