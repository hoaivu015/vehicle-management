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

  it('should calculate opening cash balance before current month correctly', () => {
    const pastVehicles = [
      createMockVehicle({
        id: 10,
        code: 'CAR-OLD',
        name: 'Old Car',
        purchase_price: 50000,
        purchase_payment_history: [{ amount: 50000, date: '2024-03-15', receiver: '', staff_id: '', staff_expense_id: '', note: '' }],
        sale_price: 80000,
        sale_payment_history: [{ amount: 80000, date: '2024-03-28', receiver: '', staff_id: '', staff_expense_id: '', note: '' }],
      })
    ];

    const pastExpenses = [
      { id: 1, name: 'Electricity March', amount: 10000, date: '2024-03-20', category: 'Vận hành', created_at: null },
      { id: 2, name: 'Electricity April', amount: 15000, date: '2024-04-05', category: 'Vận hành', created_at: null },
    ];

    // Initial capital 1,000,000 + March Inflow 80,000 - March Purchase 50,000 - March Expense 10,000 = 1,020,000
    const openingBalanceApril = FinanceService.calculateOpeningCashBalance(1_000_000, pastVehicles, pastExpenses, '2024-04');
    expect(openingBalanceApril).toBe(1_020_000);
  });

  it('should correctly account for co-investment capital inflow in total cash balance', () => {
    const coinvestedVehicle = createMockVehicle({
      id: 20,
      code: 'CAR-COINVEST',
      name: 'Co-invested Car',
      purchase_price: 500000000,
      purchase_date: '2026-05-01',
      is_coinvested: true,
      coinvestor_code: 'NV01',
      coinvest_amount: 200000000, // Partner contributes 200M
      purchase_payment_history: [
        { amount: 500000000, date: '2026-05-01', receiver: 'Seller', staff_id: '', staff_expense_id: '', note: 'Chi 100% mua xe' }
      ],
      cost_history: [
        { amount: 10000000, date: '2026-05-02', staff_id: '', staff_expense_id: '', note: 'Spa xe' } // 10M spa paid directly by showroom
      ]
    });

    const expenses: import('../ExpenseRepository').Expense[] = [];

    // Total Capital (1,000,000,000) + Coinvest Inflow (200,000,000) - Purchase Outflow (500,000,000) - Spa Cost (10,000,000)
    // = 690,000,000 (Company spent net 310,000,000 from own capital)
    const cashBalance = FinanceService.calculateTotalCashBalance(1_000_000_000, [coinvestedVehicle], expenses);
    expect(cashBalance).toBe(690_000_000);
  });

  it('should include co-investment capital inflow in weekly cashflow thu', () => {
    const coinvestedVehicle = createMockVehicle({
      id: 21,
      code: 'CAR-COINVEST-WEEK',
      name: 'Weekly Co-invested Car',
      purchase_price: 500000000,
      purchase_date: '2026-05-03', // Week 1 (Day 3)
      is_coinvested: true,
      coinvestor_code: 'NV01',
      coinvest_amount: 200000000,
      purchase_payment_history: [
        { amount: 500000000, date: '2026-05-03', receiver: 'Seller', staff_id: '', staff_expense_id: '', note: '' }
      ],
      cost_history: []
    });

    const weekly = FinanceService.calculateWeeklyCashflow([coinvestedVehicle], '2026-05', []);
    expect(weekly[0].thu).toBe(200000000); // Week 1 thu 200M
    expect(weekly[0].chi).toBe(500000000); // Week 1 chi 500M
  });
});
