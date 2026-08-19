import { describe, it, expect } from 'vitest';
import { StaffSalaryService } from '../StaffSalaryService';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { createMockStaff, createMockVehicle } from '../../../../shared/utils/__tests__/mock_data';

describe('StaffSalaryService — Industrial Standards Compliance', () => {
  it('should correctly distinguish between Reimbursements (added) and Advances (deducted)', () => {
    const staffWithMixedExpenses = createMockStaff({
      code: 'NV01',
      base_salary: 10000000,
      target: 2,
      expenses: [
        // Hoàn ứng chi hộ 1: tiền spa xe
        { id: 'e1', amount: 1000000, note: 'Rửa và dọn xe #VF8', date: '2026-05-10', is_reimbursed: false, type: 'vehicle' },
        // Hoàn ứng chi hộ 2: tiếp khách
        { id: 'e2', amount: 500000, note: 'Tiếp khách mua xe', date: '2026-05-12', is_reimbursed: false, type: 'operating' },
        // Tạm ứng lương cá nhân: Khấu trừ
        { id: 'e3', amount: 3000000, note: 'Tạm ứng lương cá nhân', date: '2026-05-15', is_reimbursed: false, type: 'advance' },
        // Tạm ứng lương bằng category: Khấu trừ
        { id: 'e4', amount: 2000000, note: 'Mượn lương đợt 2', date: '2026-05-20', is_reimbursed: false, type: 'operating', category: 'Tạm ứng lương' }
      ]
    });

    const soldCars = [
      createMockVehicle({
        id: 101,
        code: 'CAR-101',
        seller: 'NV01',
        status: VehicleStatus.SOLD,
        sale_date: '2026-05-18',
        commission: 5000000
      }),
      createMockVehicle({
        id: 102,
        code: 'CAR-102',
        seller: 'NV01',
        status: VehicleStatus.SOLD,
        sale_date: '2026-05-22',
        commission: 5000000
      })
    ];

    const salary = StaffSalaryService.calculateMonthlySalary(staffWithMixedExpenses, soldCars, '2026-05');

    // Base: 10M, Sold: 2/2 (100% KPI -> multiplier 1.0x), Sales Commission: 10M
    expect(salary.totalSalary).toBe(20000000);

    // Total Reimbursements (Chi hộ): 1M + 0.5M = 1.5M
    expect(salary.totalReimbursements).toBe(1500000);

    // Total Advances (Tạm ứng): 3M + 2M = 5M
    expect(salary.totalAdvances).toBe(5000000);

    // Net Salary = 20M + 1.5M - 5M = 16.5M
    expect(salary.netSalary).toBe(16500000);
  });

  it('should handle carry-over advances and reimbursements across months', () => {
    const staff = createMockStaff({
      code: 'NV02',
      base_salary: 8000000,
      target: 0,
      expenses: [
        // Carry over reimbursement from April
        { id: 'e1', amount: 400000, note: 'Xăng xe tháng 4', date: '2026-04-28', is_reimbursed: false, type: 'operating' },
        // Carry over advance from April
        { id: 'e2', amount: 1000000, note: 'Tạm ứng mua phụ tùng cá nhân', date: '2026-04-29', is_reimbursed: false, type: 'advance' }
      ]
    });

    const salary = StaffSalaryService.calculateMonthlySalary(staff, [], '2026-05');

    expect(salary.totalSalary).toBe(8000000);
    expect(salary.totalReimbursements).toBe(400000);
    expect(salary.totalAdvances).toBe(1000000);
    // Net: 8M + 400k - 1M = 7.4M
    expect(salary.netSalary).toBe(7400000);
  });
});
