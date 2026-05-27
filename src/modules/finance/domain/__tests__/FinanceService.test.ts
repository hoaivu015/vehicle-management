import { describe, it, expect } from 'vitest';
import { FinanceService } from '@/src/modules/finance/domain/FinanceService';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { createMockVehicle } from '@/src/shared/utils/__tests__/mock_data';

describe('FinanceService', () => {
  const mockVehicles = [
    createMockVehicle({
      id: 1,
      code: 'CAR-001',
      name: 'Test Car 1',
      status: VehicleStatus.SOLD,
      purchase_price: 100000,
      sale_price: 150000,
      sale_date: '2024-04-01',
      sale_payment_history: [{ amount: 150000, date: '2024-04-01', receiver: 'Staff', staff_id: '', staff_expense_id: '', note: '' }],
      is_coinvested: false,
    }),
    createMockVehicle({
      id: 2,
      code: 'CAR-002',
      name: 'Test Car 2',
      status: VehicleStatus.IN_STOCK,
      purchase_price: 200000,
      is_coinvested: false,
    })
  ];

  it('should calculate monthly revenue correctly', () => {
    const revenue = FinanceService.calculateMonthlyRevenue(mockVehicles, '2024-04');
    expect(revenue).toBe(150000);
  });

  it('should return 0 revenue for month with no sales', () => {
    const revenue = FinanceService.calculateMonthlyRevenue(mockVehicles, '2024-05');
    expect(revenue).toBe(0);
  });

  it('should calculate monthly sales profit correctly', () => {
    const profit = FinanceService.calculateMonthlySalesProfit(mockVehicles, '2024-04');
    // 150000 (sale) - 100000 (purchase) = 50000
    expect(profit).toBe(50000);
  });
});
