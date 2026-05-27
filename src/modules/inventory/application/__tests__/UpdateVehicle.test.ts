import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateVehicle } from '../UpdateVehicle';
import { VehicleStatus } from '../../../../shared/domain/constants';

import { createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('UpdateVehicle Use Case', () => {
  const mockVehicleRepo = {
    getAll: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
  };

  const mockExpenseRepo = {
    add: vi.fn(),
    deleteByNameAndCategory: vi.fn(),
  };

  const mockStaffRepo = {
    getByCode: vi.fn(),
    update: vi.fn(),
  };

  let useCase: UpdateVehicle;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateVehicle(
      mockVehicleRepo as any,
      mockExpenseRepo as any,
      mockStaffRepo as any
    );
  });

  const baseVehicle = createMockVehicle({
    id: 1,
    code: 'V01',
    name: 'Car 1',
    year: '2024',
    status: VehicleStatus.SOLD,
    purchase_price: 1000,
    purchase_date: '2024-01-01',
    buyer: 'NV01',
    total_cost: 100,
    cost_history: [],
    is_coinvested: true,
    coinvestor_code: 'NV01',
    coinvest_amount: 500,
    partner_profit_shared: false,
    partner_capital_repaid: false,
    sale_price: 1100, // Profit = 0
    buying_commission: 0,
    buying_bonus: 0,
    commission: 0
  });

  it('should sync with staff expenses when partner_profit_shared is ticked', async () => {
    mockVehicleRepo.getById.mockResolvedValue(baseVehicle);
    mockVehicleRepo.update.mockResolvedValue({ ...baseVehicle, partner_profit_shared: true });
    
    mockStaffRepo.getByCode.mockResolvedValue({
      id: 's1',
      code: 'NV01',
      expenses: []
    });

    await useCase.execute({
      id: 1,
      data: { partner_profit_shared: true }
    });

    // 1. Verify general expense added
    expect(mockExpenseRepo.add).toHaveBeenCalledWith(expect.objectContaining({
      category: 'Đối tác',
      name: expect.stringContaining('Chia LN đối tác')
    }));

    // 2. Verify staff expense added
    expect(mockStaffRepo.update).toHaveBeenCalledWith('s1', expect.objectContaining({
      expenses: expect.arrayContaining([
        expect.objectContaining({
          category: 'Lợi nhuận góp vốn',
          is_reimbursed: true
        })
      ])
    }));
  });

  it('should remove staff expenses when partner_profit_shared is UNticked', async () => {
    const alreadySharedVehicle = { ...baseVehicle, partner_profit_shared: true };
    mockVehicleRepo.getById.mockResolvedValue(alreadySharedVehicle);
    mockVehicleRepo.update.mockResolvedValue({ ...baseVehicle, partner_profit_shared: false });
    
    const staffWithExpense = {
      id: 's1',
      code: 'NV01',
      expenses: [
        { 
          id: 'exp1', 
          note: `Chia LN đối tác: ${baseVehicle.name} (${baseVehicle.code})`, 
          amount: 0, // Matches partnerProfitShare when sale_price=1100 and commissions=0
          is_reimbursed: true 
        }
      ]
    };
    mockStaffRepo.getByCode.mockResolvedValue(staffWithExpense);

    await useCase.execute({
      id: 1,
      data: { partner_profit_shared: false }
    });

    // Verify staff expense removed
    expect(mockStaffRepo.update).toHaveBeenCalledWith('s1', expect.objectContaining({
      expenses: []
    }));
  });
});
