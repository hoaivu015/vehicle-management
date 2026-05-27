import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelSale } from '../CancelSale';
import { VehicleStatus } from '../../../../shared/domain/constants';

describe('CancelSale Use Case', () => {
  const mockVehicleRepo = {
    cancelSale: vi.fn(),
  };

  let useCase: CancelSale;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CancelSale(mockVehicleRepo as any);
  });

  it('should call repository with correct history entry when cancelling sale', async () => {
    const request = {
      vehicleId: 1,
      userCode: 'ADMIN01'
    };

    await useCase.execute(request);

    const today = new Date().toISOString().split('T')[0];
    expect(mockVehicleRepo.cancelSale).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        date: today,
        status: VehicleStatus.IN_STOCK,
        user: 'ADMIN01',
        note: expect.stringContaining('Hủy giao dịch')
      })
    );
  });
});
