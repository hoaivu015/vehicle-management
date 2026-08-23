import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelSale } from '../CancelSale';
import { VehicleStatus } from '../../../../shared/domain/constants';

describe('CancelSale Use Case', () => {
  const mockVehicleRepo = {
    getById: vi.fn(),
    cancelSale: vi.fn(),
    update: vi.fn()
  };

  const mockExpenseRepo = {
    deleteByNameAndCategory: vi.fn()
  };

  const mockStaffRepo = {
    getByCode: vi.fn(),
    update: vi.fn()
  };

  let useCase: CancelSale;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVehicleRepo.getById.mockResolvedValue({
      id: 1,
      code: 'V01',
      name: 'Mazda CX-5',
      partner_profit_shared: false
    });
    useCase = new CancelSale(
      mockVehicleRepo as unknown as import('../../domain/VehicleRepository').VehicleRepository,
      mockExpenseRepo as unknown as import('../../../finance/domain/ExpenseRepository').ExpenseRepository,
      mockStaffRepo as unknown as import('../../../staff/domain/StaffRepository').StaffRepository
    );
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

  it('should revert partner profit sharing and clean up expenses when cancelling sale with partner_profit_shared', async () => {
    mockVehicleRepo.getById.mockResolvedValue({
      id: 1,
      code: 'V01',
      name: 'Mazda CX-5',
      partner_profit_shared: true,
      coinvestor_code: 'NV01'
    });

    mockStaffRepo.getByCode.mockResolvedValue({
      id: 'staff-1',
      expenses: [{ id: 'exp-1', note: 'Chia LN đối tác: Mazda CX-5 (V01)', amount: 20000000 }]
    });

    const request = {
      vehicleId: 1,
      userCode: 'ADMIN01'
    };

    await useCase.execute(request);

    expect(mockExpenseRepo.deleteByNameAndCategory).toHaveBeenCalledWith(
      'Chia LN đối tác: Mazda CX-5 (V01)',
      'Đối tác'
    );
    expect(mockStaffRepo.update).toHaveBeenCalledWith('staff-1', { expenses: [] });
    expect(mockVehicleRepo.update).toHaveBeenCalledWith('1', { partner_profit_shared: false });
  });

  it('should record other income when cancelType is FORFEIT', async () => {
    mockVehicleRepo.getById.mockResolvedValue({
      id: 1,
      code: 'V01',
      name: 'Mazda CX-5',
      partner_profit_shared: false,
      sale_payment_history: [{ amount: 50000000, date: '2026-08-01' }]
    });

    const mockExpenseAdd = vi.fn();
    const expenseRepoWithAdd = {
      ...mockExpenseRepo,
      add: mockExpenseAdd
    };

    const cancelSaleWithForfeit = new CancelSale(
      mockVehicleRepo as unknown as import('../../domain/VehicleRepository').VehicleRepository,
      expenseRepoWithAdd as unknown as import('../../../finance/domain/ExpenseRepository').ExpenseRepository,
      mockStaffRepo as unknown as import('../../../staff/domain/StaffRepository').StaffRepository
    );

    await cancelSaleWithForfeit.execute({
      vehicleId: 1,
      userCode: 'ADMIN01',
      cancelType: 'FORFEIT'
    });

    expect(mockExpenseAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('Tịch thu cọc xe Mazda CX-5'),
        amount: 50000000,
        category: 'Thu nhập khác'
      })
    );
  });
});
