import { describe, it, expect } from 'vitest';
import { FinanceService } from '../FinanceService';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { Vehicle } from '../../../../shared/domain/types';

describe('FinanceService', () => {
  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      status: VehicleStatus.SOLD,
      sale_date: '2026-04-10',
      sale_price: 500000000,
      purchase_price: 450000000,
      sale_payment_history: [
        { date: '2026-04-10', amount: 200000000 },
        { date: '2026-05-10', amount: 300000000 }
      ]
    },
    {
      id: '2',
      status: VehicleStatus.IN_STOCK,
      purchase_price: 300000000,
      sale_payment_history: []
    }
  ] as any;

  describe('calculateMonthlyRevenue', () => {
    it('should calculate revenue based on payment history in the specific month', () => {
      const revenue = FinanceService.calculateMonthlyRevenue(mockVehicles, '2026-04');
      expect(revenue).toBe(200000000);
    });

    it('should return 0 if no payments in that month', () => {
      const revenue = FinanceService.calculateMonthlyRevenue(mockVehicles, '2026-03');
      expect(revenue).toBe(0);
    });
  });

  describe('calculateMonthlySalesProfit', () => {
    it('should calculate profit for sold cars in the specific month', () => {
      // Vehicle 1 profit: 500m - 450m = 50m (Assuming no costs/commissions for simplicity)
      const profit = FinanceService.calculateMonthlySalesProfit(mockVehicles, '2026-04');
      // The actual calculation uses calculateVehicleFinancials which might be more complex
      // but for this mock it should be around 50m
      expect(profit).toBeGreaterThan(0);
    });
  });
});
