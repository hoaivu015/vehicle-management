import { describe, it, expect } from 'vitest';
import { FinanceService } from '../FinanceService';
import { Expense } from '../ExpenseRepository';
import { VehicleStatus } from '@/src/shared/domain/constants';
import { Vehicle } from '@/src/shared/domain/types';
import { createMockVehicle } from '@/src/shared/utils/__tests__/mock_data';
import { reconcileCashBalance } from '@/src/shared/utils/financial_formulas';

describe('FinanceService — Unified Virtual Ledger SSoT Tests', () => {
  it('should build a complete, balanced ledger with accurate inflow and outflow scopes', () => {
    const vehicles: Vehicle[] = [
      createMockVehicle({
        id: 101,
        code: 'VH-01',
        name: 'Toyota Camry 2.5Q',
        status: VehicleStatus.SOLD,
        purchase_price: 800_000_000,
        purchase_date: '2026-08-01',
        purchase_payment_history: [
          { amount: 800_000_000, date: '2026-08-01', receiver: 'Chủ cũ', staff_id: '', staff_expense_id: '', note: '' }
        ],
        sale_price: 920_000_000,
        sale_date: '2026-08-15',
        sale_payment_history: [
          { amount: 50_000_000, date: '2026-08-05', receiver: 'NV01', staff_id: '', staff_expense_id: '', note: 'Đặt cọc' },
          { amount: 870_000_000, date: '2026-08-15', receiver: 'NV01', staff_id: '', staff_expense_id: '', note: 'Thanh toán đủ' }
        ],
        cost_history: [
          { amount: 8_000_000, date: '2026-08-03', note: 'Sơn dặm & Spa', staff_id: '', staff_expense_id: '' },
          { amount: 3_000_000, date: '2026-08-04', note: 'NV mua bình ắc quy', staff_id: 'NV01', staff_expense_id: 'exp-01' } // Staff advanced: must NOT be in ledger before reimbursement
        ],
        is_coinvested: true,
        coinvest_amount: 300_000_000,
        coinvestor_code: 'DT01'
      })
    ];

    const expenses: Expense[] = [
      { id: 1, name: 'Tiền thuê mặt bằng showroom', amount: 40_000_000, date: '2026-08-02', category: 'Vận hành', created_at: null },
      { id: 2, name: '[Thu] Tiền thưởng hoa hồng ngân hàng', amount: 15_000_000, date: '2026-08-18', category: 'Thu khác', created_at: null },
      { id: 3, name: 'Chi lương tháng 08/2026', amount: 35_000_000, date: '2026-08-28', category: 'Lương nhân sự', created_at: null },
      { id: 4, name: 'Tạm ứng lương nhân viên', amount: 10_000_000, date: '2026-08-10', category: 'Tạm ứng lương', created_at: null },
      { id: 5, name: 'Chi trả lợi nhuận đối tác DT01', amount: 25_000_000, date: '2026-08-20', category: 'Đối tác', created_at: null }
    ];

    const ledger = FinanceService.buildUnifiedLedger(vehicles, expenses, '2026-08');

    // 1. Kiểm tra không đưa chi phí do NV ứng vào ledger trực tiếp
    const staffAdvancedItem = ledger.find(e => e.title.includes('NV mua bình ắc quy'));
    expect(staffAdvancedItem).toBeUndefined();

    // 2. Kiểm tra các dòng Inflow
    const inflows = ledger.filter(e => e.type === 'inflow');
    const totalInflow = inflows.reduce((sum, e) => sum + e.amount, 0);
    // Inflows: 50M (cọc) + 870M (bán) + 300M (góp vốn) + 15M (thu khác) = 1.235.000.000đ
    expect(totalInflow).toBe(1_235_000_000);

    // 3. Kiểm tra các dòng Outflow
    const outflows = ledger.filter(e => e.type === 'outflow');
    const totalOutflow = outflows.reduce((sum, e) => sum + e.amount, 0);
    // Outflows: 800M (mua xe) + 8M (direct spa) + 40M (mặt bằng) + 35M (lương) + 10M (ứng lương) + 25M (đối tác) = 918.000.000đ
    expect(totalOutflow).toBe(918_000_000);

    // 4. Net Cashflow
    const netCashflow = totalInflow - totalOutflow;
    expect(netCashflow).toBe(317_000_000);

    // 5. Kiểm tra tính đồng bộ số dư
    const totalCapital = 5_000_000_000;
    const totalCashBalance = FinanceService.calculateTotalCashBalance(totalCapital, vehicles, expenses);
    expect(totalCashBalance).toBe(totalCapital + netCashflow);

    // 6. Đối soát tính bất biến
    const openingBalance = FinanceService.calculateOpeningCashBalance(totalCapital, vehicles, expenses, '2026-08');
    const closingBalance = openingBalance + netCashflow;
    expect(reconcileCashBalance(openingBalance, netCashflow, closingBalance)).toBe(true);
  });

  it('should correctly handle deposit forfeiture and refund reversals in Unified Ledger', () => {
    const vehicles: Vehicle[] = [
      createMockVehicle({
        id: 202,
        code: 'VH-02',
        name: 'Mazda CX-5',
        status: VehicleStatus.IN_STOCK,
        purchase_price: 600_000_000,
        purchase_payment_history: [
          { amount: 600_000_000, date: '2026-08-01', receiver: 'Chủ cũ', staff_id: '', staff_expense_id: '', note: '' }
        ],
        sale_payment_history: [
          // Khách cọc 30M
          { amount: 30_000_000, date: '2026-08-05', receiver: 'NV02', staff_id: '', staff_expense_id: '', note: 'Khách cọc' },
          // Khách hủy cọc và bị tịch thu 30M (ghi giảm ở sale_payment_history)
          { amount: -30_000_000, date: '2026-08-10', receiver: 'NV02', staff_id: '', staff_expense_id: '', note: 'Điều chuyển Tịch thu cọc' }
        ]
      })
    ];

    // Thu nhập khác ghi nhận khoản tịch thu cọc
    const expenses: Expense[] = [
      { id: 10, name: '[Thu] Tịch thu cọc xe Mazda CX-5 (VH-02)', amount: 30_000_000, date: '2026-08-10', category: 'Thu khác', created_at: null }
    ];

    const ledger = FinanceService.buildUnifiedLedger(vehicles, expenses, '2026-08');

    const inflows = ledger.filter(e => e.type === 'inflow');
    const outflows = ledger.filter(e => e.type === 'outflow');

    // Inflows: 30M (cọc ban đầu) + 30M (tịch thu cọc thu khác) = 60M
    expect(inflows.reduce((sum, e) => sum + e.amount, 0)).toBe(60_000_000);

    // Outflows: 600M (mua xe) + 30M (điều chuyển giảm cọc bán xe) = 630M
    expect(outflows.reduce((sum, e) => sum + e.amount, 0)).toBe(630_000_000);

    // Net Cashflow: 60M - 630M = -570M (mua xe 600M, nhận cọc 30M không trả lại)
    const netCashflow = inflows.reduce((sum, e) => sum + e.amount, 0) - outflows.reduce((sum, e) => sum + e.amount, 0);
    expect(netCashflow).toBe(-570_000_000);
  });
});
