import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddSalePayment } from '../AddSalePayment';
import { VehicleStatus } from '../../../../shared/domain/constants';

describe('AddSalePayment Use Case', () => {
  const mockVehicleRepo = {
    addSalePayment: vi.fn(),
  };

  let useCase: AddSalePayment;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AddSalePayment(mockVehicleRepo as any);
  });

  it('should call repository with correct data when adding a payment', async () => {
    const request = {
      vehicleId: 1,
      amount: 50000000,
      note: 'Deposit for Car',
      receiver: 'NV01',
      nextStatus: VehicleStatus.DEPOSIT_SALE,
      seller: 'NV01',
      buyerName: 'Customer A',
      salePrice: 500000000,
      commission: 2000000,
      buyingBonus: 1000000,
      date: '2026-04-27'
    };

    await useCase.execute(request);

    expect(mockVehicleRepo.addSalePayment).toHaveBeenCalledWith(
      1,
      {
        amount: 50000000,
        note: 'Deposit for Car',
        date: '2026-04-27',
        receiver: 'NV01',
        staff_id: '',
        staff_expense_id: ''
      },
      VehicleStatus.DEPOSIT_SALE,
      'NV01',
      'Customer A',
      500000000,
      2000000,
      1000000
    );
  });

  it('should throw error if amount is negative', async () => {
    const request = {
      vehicleId: 1,
      amount: -100,
      note: 'Invalid',
      receiver: 'NV01',
      nextStatus: VehicleStatus.DEPOSIT_SALE,
      seller: 'NV01'
    };

    await expect(useCase.execute(request)).rejects.toThrow('Số tiền không được âm');
  });

  it('should use current date if no date provided', async () => {
    const request = {
      vehicleId: 1,
      amount: 1000,
      note: 'Test',
      receiver: 'NV01',
      nextStatus: VehicleStatus.SOLD,
      seller: 'NV01'
    };

    await useCase.execute(request);

    const today = new Date().toISOString().split('T')[0];
    expect(mockVehicleRepo.addSalePayment).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ date: today }),
      VehicleStatus.SOLD,
      'NV01',
      undefined,
      undefined,
      undefined,
      undefined
    );
  });
});
