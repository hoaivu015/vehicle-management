import { describe, it, expect } from 'vitest';
import { FinanceService } from '../FinanceService';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';
import { Expense } from '../ExpenseRepository';
import { calculateVehicleFinancials } from '@/src/shared/utils/vehicle_calculations';
import { createMockVehicle } from '@/src/shared/utils/__tests__/mock_data';

describe('Finance & Cash Reconciliation Industrial Test Suite', () => {
  it('should guarantee OpeningCashBalance(M+1) === ClosingCashBalance(M) across fiscal months', () => {
    const totalCapital = 10_000_000_000; // 10 Billion VND
    const month1 = '2026-08';
    const month2 = '2026-09';

    const vehicles: Vehicle[] = [
      createMockVehicle({
        id: 1,
        code: 'V01',
        name: 'Mercedes C300',
        status: VehicleStatus.SOLD,
        purchase_price: 1_200_000_000,
        purchase_date: '2026-08-05',
        purchase_paid_amount: 1_200_000_000,
        purchase_payment_history: [{ amount: 1_200_000_000, date: '2026-08-05', receiver: 'Seller', note: 'Mua xe', staff_id: '', staff_expense_id: '' }],
        sale_price: 1_400_000_000,
        received_amount: 1_400_000_000,
        sale_date: '2026-08-20',
        sale_payment_history: [{ amount: 1_400_000_000, date: '2026-08-20', receiver: 'NV01', note: 'Thanh toán', staff_id: '', staff_expense_id: '' }],
        cost_history: [
          { amount: 15_000_000, date: '2026-08-07', note: 'Spa dọn xe', staff_id: '', staff_expense_id: '' },
          { amount: 5_000_000, date: '2026-08-08', note: 'Thay gạt mưa', staff_id: 'NV01', staff_expense_id: 'exp-01' } // Staff advanced
        ],
        seller: 'NV01',
        buyer: 'NV02'
      }),
      createMockVehicle({
        id: 2,
        code: 'V02',
        name: 'BMW 320i',
        status: VehicleStatus.IN_STOCK,
        purchase_price: 900_000_000,
        purchase_date: '2026-08-25',
        purchase_paid_amount: 900_000_000,
        purchase_payment_history: [{ amount: 900_000_000, date: '2026-08-25', receiver: 'Seller', note: 'Mua xe', staff_id: '', staff_expense_id: '' }],
        is_coinvested: true,
        coinvest_amount: 300_000_000
      })
    ];

    const allExpenses: Expense[] = [
      { id: 1, name: 'Tiền mặt bằng showroom T8', amount: 50_000_000, category: 'Vận hành', date: '2026-08-01', created_at: '2026-08-01' },
      { id: 2, name: '[Thu] Thu tiền hoa hồng bảo hiểm', amount: 10_000_000, category: 'Thu khác', date: '2026-08-15', created_at: '2026-08-15' },
      { id: 3, name: 'Chi lương tháng 08/2026', amount: 45_000_000, category: 'Lương nhân sự', date: '2026-08-30', created_at: '2026-08-30' }
    ];

    // Compute Month 1 (August 2026)
    const openingAug = FinanceService.calculateOpeningCashBalance(totalCapital, vehicles, allExpenses, month1);
    expect(openingAug).toBe(totalCapital); // No past transactions before 2026-08-01

    // August Cashflow Direct Method:
    // Inflows: 1.4B (sale) + 300M (coinvest) + 10M (other inflow) = 1.710.000.000
    // Outflows: 1.2B (purchase V01) + 900M (purchase V02) + 15M (direct spa) + 50M (op expense) + 45M (payroll) = 2.210.000.000
    // Net Cashflow = 1.710.000.000 - 2.210.000.000 = -500.000.000
    const netAug = (1_400_000_000 + 300_000_000 + 10_000_000) - (1_200_000_000 + 900_000_000 + 15_000_000 + 50_000_000 + 45_000_000);
    expect(netAug).toBe(-500_000_000);

    const closingAug = openingAug + netAug;
    expect(closingAug).toBe(9_500_000_000);

    // Compute Month 2 Opening Balance (September 2026)
    const openingSep = FinanceService.calculateOpeningCashBalance(totalCapital, vehicles, allExpenses, month2);
    expect(openingSep).toBe(closingAug); // Invariant Check: Must match exactly!
  });

  it('should correctly handle partial payment and retain receivable debt on SOLD vehicle', () => {
    const car = createMockVehicle({
      id: 10,
      code: 'V10',
      name: 'Porsche Macan',
      status: VehicleStatus.SOLD,
      purchase_price: 2_000_000_000,
      sale_price: 2_500_000_000,
      received_amount: 1_800_000_000, // Customer still owes 700M
      sale_payment_history: [
        { amount: 300_000_000, date: '2026-08-01', note: 'Đặt cọc', receiver: 'NV01', staff_id: '', staff_expense_id: '' },
        { amount: 1_500_000_000, date: '2026-08-10', note: 'Thanh toán đợt 1', receiver: 'NV01', staff_id: '', staff_expense_id: '' }
      ]
    });

    const fin = calculateVehicleFinancials(car);
    const saleDebt = (fin.salePrice || 0) - (car.received_amount || 0);

    expect(fin.salePrice).toBe(2_500_000_000);
    expect(car.received_amount).toBe(1_800_000_000);
    expect(saleDebt).toBe(700_000_000); // 700M receivable debt must NOT be 0!
  });

  it('should accurately calculate total cash balance when other inflows and direct costs exist', () => {
    const totalCapital = 5_000_000_000;
    const vehicles = [
      createMockVehicle({
        id: 1,
        code: 'V01',
        name: 'Camry',
        status: VehicleStatus.IN_STOCK,
        purchase_paid_amount: 800_000_000,
        purchase_payment_history: [{ amount: 800_000_000, date: '2026-08-01', receiver: 'Seller', note: 'Mua xe', staff_id: '', staff_expense_id: '' }],
        cost_history: [
          { amount: 10_000_000, note: 'Direct Spa', date: '2026-08-02', staff_id: '', staff_expense_id: '' },
          { amount: 5_000_000, note: 'Staff advanced', date: '2026-08-03', staff_id: '1', staff_expense_id: 'exp-1' }
        ]
      })
    ];

    const allExpenses: Expense[] = [
      { id: 1, name: '[Thu] Tiền gửi ngân hàng', amount: 5_000_000, category: 'Thu nhập khác', date: '2026-08-05', created_at: '2026-08-05' },
      { id: 2, name: 'Tiền mạng internet', amount: 1_000_000, category: 'Vận hành', date: '2026-08-06', created_at: '2026-08-06' }
    ];

    const balance = FinanceService.calculateTotalCashBalance(totalCapital, vehicles, allExpenses);
    // 5.000.000.000 + 5.000.000 (inflow) - 800.000.000 (car) - 10.000.000 (direct spa) - 1.000.000 (internet) = 4.194.000.000
    expect(balance).toBe(4_194_000_000);
  });
});
