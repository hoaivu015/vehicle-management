import { describe, it, expect, vi } from 'vitest';
import { DeleteVehicleCost } from '../DeleteVehicleCost';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';
import { VehicleRepository } from '../../domain/VehicleRepository';
import { StaffRepository } from '../../../staff/domain/StaffRepository';

describe('DeleteVehicleCost — Audit Trail Logging', () => {
  it('should log an immutable audit trail entry into vehicle.history when a vehicle cost is deleted', async () => {
    const mockVehicle = createMockVehicle({
      id: 99,
      code: 'AUDIT-CAR',
      status: VehicleStatus.IN_STOCK,
      cost_history: [
        { amount: 2500000, note: 'Rửa khoang máy', date: '2026-05-01', staff_id: '', staff_expense_id: '' }
      ],
      history: []
    });

    const mockVehicleRepo = {
      getById: vi.fn().mockResolvedValue(mockVehicle),
      update: vi.fn().mockImplementation((_id, data) => Promise.resolve({ ...mockVehicle, ...data }))
    };
    const mockStaffRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };

    const useCase = new DeleteVehicleCost(
      mockVehicleRepo as unknown as VehicleRepository,
      mockStaffRepo as unknown as StaffRepository
    );
    const updated = await useCase.execute({
      vehicleId: 99,
      costIndex: 0,
      user: 'Admin Kế toán',
      reason: 'Nhập trùng hóa đơn'
    });

    expect(updated.cost_history?.length).toBe(0);
    expect(updated.history?.length).toBe(1);
    expect(updated.history?.[0].user).toBe('Admin Kế toán');
    expect(updated.history?.[0].note).toContain('Đã xóa chi phí: "Rửa khoang máy"');
    expect(updated.history?.[0].note).toContain('Nhập trùng hóa đơn');
  });
});
