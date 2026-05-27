import { describe, it, expect } from 'vitest';
import { StaffSalaryService } from '../StaffSalaryService';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { createMockStaff, createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('StaffSalaryService', () => {
  const mockStaff = createMockStaff({
    code: 'NV01',
    base_salary: 10000000,
    target: 5
  });

  const mockCars = [
    createMockVehicle({
      id: 1,
      code: 'C1',
      seller: 'NV01',
      status: VehicleStatus.SOLD,
      sale_date: '2026-04-10',
      commission: 2000000,
      sale_price: 500000000,
      purchase_price: 450000000,
      total_cost: 10000000,
      buying_commission: 0,
      buying_bonus: 0
    }),
    createMockVehicle({
      id: 2,
      code: 'C2',
      coinvestor_code: 'NV01',
      is_coinvested: true,
      coinvest_amount: 100000000,
      status: VehicleStatus.SOLD,
      sale_date: '2026-04-15',
      sale_price: 600000000,
      purchase_price: 500000000,
      total_cost: 10000000,
      partner_profit_shared: false,
      buying_commission: 0,
      buying_bonus: 0,
      commission: 0
    })
  ];

  it('should calculate monthly salary correctly for sales and co-investment', () => {
    const salary = StaffSalaryService.calculateMonthlySalary(mockStaff, mockCars, '2026-04');
    
    expect(salary.base).toBe(10000000);
    expect(salary.soldCount).toBe(1);
    
    // KPI 1/5 = 20% -> multiplier 0.7 (based on financial_formulas.ts)
    // salesCommission = 2000000 * 0.7 = 1400000
    expect(salary.salesCommission).toBe(1400000);
    
    // Co-investment for Car 2:
    // Net profit = 600 - (500 + 10) = 90M
    // Total capital = 510M. NV01 coinvest 100M (~19.6%)
    // Partner share = 90M * (100/510) = 17,647,058.8...
    expect(salary.coinvestProfitShare).toBe(17647059);
    expect(salary.totalSalary).toBe(10000000 + 1400000 + 17647059);
  });

  it('should EXCLUDE profit share if already marked as partner_profit_shared', () => {
    const carsWithSharedProfit = [
      createMockVehicle({
        ...mockCars[1],
        partner_profit_shared: true
      })
    ];
    
    const salary = StaffSalaryService.calculateMonthlySalary(mockStaff, carsWithSharedProfit, '2026-04');
    
    expect(salary.coinvestProfitShare).toBe(0);
    expect(salary.coinvestedCars.length).toBe(1);
  });

  it('should include carry-over unpaid expenses in net salary', () => {
    const staffWithExpenses = createMockStaff({
      ...mockStaff,
      expenses: [
        { id: 'e1', amount: 500000, note: 'Tires', date: '2026-03-20', is_reimbursed: false, type: 'operating' },
        { id: 'e2', amount: 200000, note: 'Oil', date: '2026-04-05', is_reimbursed: false, type: 'operating' },
        { id: 'e3', amount: 300000, note: 'Lunch', date: '2026-04-06', is_reimbursed: true, type: 'operating' }
      ]
    });
    
    const salary = StaffSalaryService.calculateMonthlySalary(staffWithExpenses, [], '2026-04');
    
    // Unreimbursed: 500k (carry over) + 200k (current month) = 700k
    expect(salary.totalReimbursements).toBe(700000);
    expect(salary.netSalary).toBe(salary.totalSalary + 700000);
  });

  it('should correctly calculate buying commission and bonus', () => {
    const staffAsBuyer = createMockStaff({ code: 'BUYER01' });
    const carsBought = [
      createMockVehicle({
        buyer: 'BUYER01',
        purchase_date: '2026-04-01',
        buying_commission: 3000000,
        buying_bonus: 1000000,
        buying_bonus_paid: false
      })
    ];

    const salary = StaffSalaryService.calculateMonthlySalary(staffAsBuyer, carsBought, '2026-04');
    expect(salary.boughtCount).toBe(1);
    expect(salary.buyingCommission).toBe(3000000);
    expect(salary.buyingBonus).toBe(1000000);
  });
});
