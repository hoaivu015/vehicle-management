import { describe, it, expect, vi } from 'vitest';
import { GetFinancialOverview } from '../GetFinancialOverview';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { createMockStaff, createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';
import { ExpenseRepository, Expense } from '../../domain/ExpenseRepository';
import { VehicleRepository } from '../../../inventory/domain/VehicleRepository';
import { StaffRepository } from '../../../staff/domain/StaffRepository';

describe('GetFinancialOverview — Industrial Double-Deduction Prevention', () => {
  it('should NOT double-deduct salary expenses from monthly net profit', async () => {
    const mockExpenseRepo = {
      getAll: vi.fn(),
      getCompanySettings: vi.fn().mockResolvedValue({ total_capital: 1000000000 }),
      add: vi.fn(),
      deleteByNameAndCategory: vi.fn()
    };
    const mockVehicleRepo = {
      getAll: vi.fn(),
      update: vi.fn()
    };
    const mockStaffRepo = {
      getAll: vi.fn()
    };

    const useCase = new GetFinancialOverview(
      mockExpenseRepo as unknown as ExpenseRepository,
      mockVehicleRepo as unknown as VehicleRepository,
      mockStaffRepo as unknown as StaffRepository
    );

    // 1 xe bán lãi 50.000.000đ
    const vehicles = [
      createMockVehicle({
        id: 1,
        code: 'CAR-01',
        seller: 'NV01',
        status: VehicleStatus.SOLD,
        sale_date: '2026-05-15',
        sale_price: 500000000,
        purchase_price: 440000000,
        total_cost: 10000000,
        commission: 5000000 // hoa hồng 5tr
      })
    ];

    // 1 nhân viên lương cứng 10.000.000đ, hoa hồng 5.000.000đ (tổng lương = 15.000.000đ)
    const staff = [
      createMockStaff({
        code: 'NV01',
        name: 'Nguyen Van A',
        base_salary: 10000000,
        target: 1
      })
    ];

    // Chi phí vận hành gồm: Tiền điện (5.000.000đ) và Phiếu chi lương đã xuất (15.000.000đ)
    const allExpenses: Expense[] = [
      { id: 1, name: 'Tiền điện showroom', amount: 5000000, category: 'Vận hành', date: '2026-05-10', created_at: null },
      { id: 2, name: 'Chi lương tháng 2026-05 - Nguyen Van A (NV01)', amount: 15000000, category: 'Lương nhân sự', date: '2026-05-30', created_at: null }
    ];

    const overview = await useCase.execute('2026-05', {
      settings: { total_capital: 1000000000 },
      vehicles,
      staff,
      allOpExpenses: allExpenses
    });

    // Doanh thu bán xe lãi gộp = 500M - (440M + 10M) = 50.000.000đ
    expect(overview.grossProfit).toBe(50000000);

    // Chi phí vận hành thuần (không cộng đúp phiếu chi lương 15tr) = 5.000.000đ
    // Tổng lương nhân sự = 10tr cứng + 5tr hoa hồng = 15.000.000đ
    // Lợi nhuận ròng cuối cùng = 50M - 5M (vận hành) - 15M (quỹ lương) = 30.000.000đ
    expect(overview.finalNetProfit).toBe(30000000);
  });
});
