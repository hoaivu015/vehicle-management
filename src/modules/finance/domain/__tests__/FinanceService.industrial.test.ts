import { describe, it, expect } from 'vitest';
import { FinanceService } from '../FinanceService';
import { Expense } from '../ExpenseRepository';
import { createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('FinanceService — Industrial Standards Tests', () => {
  it('should NOT deduct staff-advanced car costs from cash balance before reimbursement', () => {
    const vehicles = [
      createMockVehicle({
        id: 1,
        code: 'CAR-01',
        purchase_price: 100000000,
        purchase_payment_history: [{ amount: 100000000, date: '2026-05-01', receiver: '', staff_id: '', staff_expense_id: '', note: '' }],
        sale_payment_history: [{ amount: 150000000, date: '2026-05-10', receiver: '', staff_id: '', staff_expense_id: '', note: '' }],
        cost_history: [
          // Chi phí do Showroom trực tiếp chi (trừ ngay vào két)
          { amount: 5000000, date: '2026-05-02', note: 'Sơn xe tại xưởng', staff_id: '', staff_expense_id: '' },
          // Chi phí do Nhân viên ứng tiền túi (Showroom chưa chi tiền mặt, chưa trừ vào két)
          { amount: 2000000, date: '2026-05-03', note: 'NV mua phụ tùng', staff_id: '1', staff_expense_id: 'exp-1' }
        ]
      })
    ];

    const allExpenses: Expense[] = [
      { id: 1, name: 'Tiền điện', amount: 3000000, date: '2026-05-05', category: 'Vận hành', created_at: null }
    ];

    // Vốn ban đầu 500M + Thu 150M - Mua 100M - Chi phí trực tiếp 5M - Vận hành 3M = 542.000.000đ
    // (Khoản 2tr NV ứng chưa được trừ khỏi quỹ tiền mặt cho đến khi hoàn ứng)
    const cashBalance = FinanceService.calculateTotalCashBalance(500000000, vehicles, allExpenses);
    expect(cashBalance).toBe(542000000);
  });

  it('should respect locked fiscal period anchor balance in calculateOpeningCashBalance', () => {
    const lockedPeriods = {
      '2026-04': 750000000 // Tháng 4/2026 đã khóa sổ với số dư chốt là 750M
    };

    // Khi tính số dư đầu kỳ tháng 5/2026, hệ thống lấy thẳng số dư chốt 750M
    const openingBalanceMay = FinanceService.calculateOpeningCashBalance(
      1000000000,
      [],
      [],
      '2026-05',
      lockedPeriods
    );

    expect(openingBalanceMay).toBe(750000000);
  });
});
