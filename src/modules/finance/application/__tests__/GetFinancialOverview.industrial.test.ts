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

  it('should NOT double-deduct partner profit share from finalNetProfit when staff is coinvestor', async () => {
    const mockExpenseRepo = {
      getAll: vi.fn(),
      getCompanySettings: vi.fn().mockResolvedValue({ total_capital: 1000000000 })
    };
    const mockVehicleRepo = { getAll: vi.fn() };
    const mockStaffRepo = { getAll: vi.fn() };

    const useCase = new GetFinancialOverview(
      mockExpenseRepo as unknown as ExpenseRepository,
      mockVehicleRepo as unknown as VehicleRepository,
      mockStaffRepo as unknown as StaffRepository
    );

    // Xe 400M bán 500M, lãi gộp 100M. NV01 góp 200M (50% vốn) -> Lãi đối tác 50M
    const vehicles = [
      createMockVehicle({
        id: 1,
        code: 'CAR-COINVEST-01',
        seller: 'NV01',
        status: VehicleStatus.SOLD,
        sale_date: '2026-05-15',
        sale_price: 500000000,
        purchase_price: 400000000,
        total_cost: 0,
        commission: 0,
        is_coinvested: true,
        coinvest_amount: 200000000,
        coinvestor_code: 'NV01'
      })
    ];

    const staff = [
      createMockStaff({
        code: 'NV01',
        name: 'Nguyen Van A',
        base_salary: 10000000,
        target: 1
      })
    ];

    const allExpenses: Expense[] = [
      { id: 1, name: 'Chi phí showroom', amount: 5000000, category: 'Vận hành', date: '2026-05-10', created_at: null }
    ];

    const overview = await useCase.execute('2026-05', {
      settings: { total_capital: 1000000000 },
      vehicles,
      staff,
      allOpExpenses: allExpenses
    });

    // Lợi nhuận gộp của Showroom (đã trừ 50M chia đối tác) = 50.000.000đ
    expect(overview.grossProfit).toBe(50000000);

    // Lợi nhuận ròng cuối cùng = 50M (lãi showroom) - 5M (vận hành) - 10M (lương cứng NV01) = 35.000.000đ
    // Đảm bảo không bị trừ đúp 50M lãi góp vốn của NV01
    expect(overview.finalNetProfit).toBe(35000000);
  });

  it('should calculate inventory value according to VAS 02 without deducting partner capital', async () => {
    const mockExpenseRepo = {
      getAll: vi.fn(),
      getCompanySettings: vi.fn().mockResolvedValue({ total_capital: 1000000000 })
    };
    const mockVehicleRepo = { getAll: vi.fn() };
    const mockStaffRepo = { getAll: vi.fn() };

    const useCase = new GetFinancialOverview(
      mockExpenseRepo as unknown as ExpenseRepository,
      mockVehicleRepo as unknown as VehicleRepository,
      mockStaffRepo as unknown as StaffRepository
    );

    // Car 1: 1 Billion purchase + 50M cost. Partner coinvested 500M. Status: IN_STOCK
    // Car 2: 500M purchase + 20M cost. Status: SPA
    // Car 3: 800M purchase. Status: SOLD (should not be in inventory)
    const vehicles = [
      createMockVehicle({
        id: 1,
        code: 'CAR-01',
        status: VehicleStatus.IN_STOCK,
        purchase_price: 1000000000,
        total_cost: 50000000,
        is_coinvested: true,
        coinvest_amount: 500000000
      }),
      createMockVehicle({
        id: 2,
        code: 'CAR-02',
        status: VehicleStatus.SPA,
        purchase_price: 500000000,
        total_cost: 20000000
      }),
      createMockVehicle({
        id: 3,
        code: 'CAR-03',
        status: VehicleStatus.SOLD,
        purchase_price: 800000000,
        sale_price: 900000000,
        sale_date: '2026-05-20'
      })
    ];

    const overview = await useCase.execute('2026-05', {
      settings: { total_capital: 1000000000 },
      vehicles,
      staff: [],
      allOpExpenses: []
    });

    // VAS 02 Inventory Value = (1,000M + 50M) + (500M + 20M) = 1,570,000,000đ (Not deducted by 500M coinvest)
    expect(overview.inventoryValue).toBe(1570000000);
    expect(overview.inventoryCount).toBe(2);
  });

  it('should NOT double-deduct reimbursed vehicle costs (Chi phí xe) from finalNetProfit', async () => {
    const mockExpenseRepo = {
      getAll: vi.fn(),
      getCompanySettings: vi.fn().mockResolvedValue({ total_capital: 1000000000 })
    };
    const mockVehicleRepo = { getAll: vi.fn() };
    const mockStaffRepo = { getAll: vi.fn() };

    const useCase = new GetFinancialOverview(
      mockExpenseRepo as unknown as ExpenseRepository,
      mockVehicleRepo as unknown as VehicleRepository,
      mockStaffRepo as unknown as StaffRepository
    );

    // Xe 500M mua, chi phí spa 10M (do NV01 ứng tiền, đã có trong cost_history), bán 600M -> Lãi gộp = 600M - 510M = 90M
    const vehicles = [
      createMockVehicle({
        id: 1,
        code: 'CAR-SPA-01',
        seller: 'NV01',
        status: VehicleStatus.SOLD,
        sale_date: '2026-05-15',
        sale_price: 600000000,
        purchase_price: 500000000,
        total_cost: 10000000,
        cost_history: [
          { amount: 10000000, date: '2026-05-02', note: 'Spa xe', staff_id: 'NV01', staff_expense_id: 'exp-01' }
        ],
        commission: 0
      })
    ];

    const staff = [
      createMockStaff({
        code: 'NV01',
        name: 'Nguyen Van A',
        base_salary: 10000000,
        target: 1
      })
    ];

    // Chi phí vận hành gồm: Tiền thuê mặt bằng (20M) và Khoản Showroom hoàn ứng tiền spa xe cho NV01 (10M)
    const allExpenses: Expense[] = [
      { id: 1, name: 'Mặt bằng showroom', amount: 20000000, category: 'Vận hành', date: '2026-05-05', created_at: null },
      { id: 2, name: 'Hoàn ứng: Spa xe (Nguyen Van A - NV01)', amount: 10000000, category: 'Chi phí xe', date: '2026-05-12', created_at: null }
    ];

    const overview = await useCase.execute('2026-05', {
      settings: { total_capital: 1000000000 },
      vehicles,
      staff,
      allOpExpenses: allExpenses
    });

    // Lãi gộp = 600M - (500M + 10M) = 90.000.000đ
    expect(overview.grossProfit).toBe(90000000);

    // Lợi nhuận ròng cuối cùng = 90M (lãi bán xe) - 20M (vận hành) - 10M (lương NV) = 60.000.000đ
    // Khoản hoàn ứng 10M chi phí xe KHÔNG bị trừ thêm lần 2
    expect(overview.finalNetProfit).toBe(60000000);
  });
});
