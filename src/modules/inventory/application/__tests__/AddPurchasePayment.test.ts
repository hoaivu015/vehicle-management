import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddPurchasePayment, AddPurchasePaymentRequest } from '../AddPurchasePayment';
import { VehicleRepository } from '../../domain/VehicleRepository';

describe('AddPurchasePayment UseCase', () => {
  let mockVehicleRepo: Partial<VehicleRepository>;
  let useCase: AddPurchasePayment;

  beforeEach(() => {
    mockVehicleRepo = {
      addPurchasePayment: vi.fn().mockResolvedValue(undefined)
    };

    useCase = new AddPurchasePayment(mockVehicleRepo as VehicleRepository);
  });

  it('thêm đợt thanh toán mua xe thành công', async () => {
    const request: AddPurchasePaymentRequest = {
      vehicleId: 10,
      amount: 150000000,
      note: 'Thanh toán đợt 2 mua xe',
      receiver: 'Chủ cũ xe A',
      date: '2026-03-15'
    };

    await useCase.execute(request);

    expect(mockVehicleRepo.addPurchasePayment).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        amount: 150000000,
        note: 'Thanh toán đợt 2 mua xe',
        receiver: 'Chủ cũ xe A',
        date: '2026-03-15'
      })
    );
  });

  it('ném lỗi nếu số tiền <= 0', async () => {
    const request: AddPurchasePaymentRequest = {
      vehicleId: 10,
      amount: 0,
      note: 'Số tiền sai',
      receiver: 'Chủ cũ'
    };

    await expect(useCase.execute(request)).rejects.toThrow('Số tiền thanh toán phải lớn hơn 0');
    expect(mockVehicleRepo.addPurchasePayment).not.toHaveBeenCalled();
  });
});
