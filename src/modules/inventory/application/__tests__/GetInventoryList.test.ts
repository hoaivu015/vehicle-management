import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetInventoryList } from '../GetInventoryList';
import { VehicleRepository } from '../../domain/VehicleRepository';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('GetInventoryList UseCase', () => {
  let mockVehicleRepo: Partial<VehicleRepository>;
  let useCase: GetInventoryList;

  const mockAvailable = [
    createMockVehicle({ id: 1, code: 'XE01', name: 'Car 1', status: VehicleStatus.IN_STOCK, purchase_price: 300000000, seller: 'NV01' }),
    createMockVehicle({ id: 2, code: 'XE02', name: 'Car 2', status: VehicleStatus.DEPOSIT_SALE, purchase_price: 400000000, seller: 'NV02' })
  ];

  const mockSold = [
    createMockVehicle({ id: 3, code: 'XE03', name: 'Car 3', status: VehicleStatus.SOLD, purchase_price: 500000000, sale_date: '2026-04-10', seller: 'NV01' })
  ];

  beforeEach(() => {
    mockVehicleRepo = {
      getAvailableVehicles: vi.fn().mockResolvedValue(mockAvailable),
      getSoldVehiclesByMonth: vi.fn().mockResolvedValue(mockSold),
      getVehiclesByStaff: vi.fn().mockResolvedValue([mockAvailable[0]]),
      getVehiclesByCodes: vi.fn().mockResolvedValue([...mockAvailable, ...mockSold])
    };

    useCase = new GetInventoryList(mockVehicleRepo as VehicleRepository);
  });

  it('lấy danh sách xe khả dụng thành công', async () => {
    const cars = await useCase.getAvailable();
    expect(cars).toHaveLength(2);
    expect(mockVehicleRepo.getAvailableVehicles).toHaveBeenCalledOnce();
  });

  it('lấy danh sách xe đã bán theo tháng thành công', async () => {
    const cars = await useCase.getSold('2026-04');
    expect(cars).toHaveLength(1);
    expect(mockVehicleRepo.getSoldVehiclesByMonth).toHaveBeenCalledWith('2026-04');
  });

  it('lấy danh sách xe cá nhân theo mã nhân viên thành công', async () => {
    const cars = await useCase.getPersonal('NV01');
    expect(cars).toHaveLength(1);
    expect(mockVehicleRepo.getVehiclesByStaff).toHaveBeenCalledWith('NV01');
  });

  it('lấy danh sách xe theo phòng ban thành công', async () => {
    const cars = await useCase.getDepartment(['NV01', 'NV02']);
    expect(cars).toHaveLength(3);
    expect(mockVehicleRepo.getVehiclesByCodes).toHaveBeenCalledWith(['NV01', 'NV02']);
  });
});
