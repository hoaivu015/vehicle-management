import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceService } from '../../domain/FinanceService';
import { ReimburseStaffExpenses } from '../../../staff/application/ReimburseStaffExpenses';
import { ToggleStaffExpenseReimbursement } from '../../../staff/application/ToggleStaffExpenseReimbursement';
import { RecordExpense } from '../RecordExpense';
import { StaffSalaryService } from '../../../staff/domain/StaffSalaryService';
import { CancelSale } from '../../../inventory/application/CancelSale';
import { VehicleStatus } from '../../../../shared/domain/constants';
import { Staff, Vehicle } from '../../../../shared/domain/types';
import { Expense } from '../../domain/ExpenseRepository';
import { StaffRepository } from '../../../staff/domain/StaffRepository';
import { ExpenseRepository } from '../../domain/ExpenseRepository';
import { VehicleRepository } from '../../../inventory/domain/VehicleRepository';

describe('Finance & Cashflow Upgrades Verification', () => {
  describe('Bug 4: Weekly Cashflow Inflow Separation', () => {
    it('should correctly classify inflow expenses as thu and outflow expenses as chi in weekly cashflow', () => {
      const expenses: Expense[] = [
        {
          id: 1,
          name: '[Thu] Tịch thu cọc xe Kia K3',
          amount: 20_000_000,
          category: 'Thu nhập khác',
          date: '2026-08-05',
          created_at: '2026-08-05T00:00:00Z'
        },
        {
          id: 2,
          name: 'Tiền điện nước',
          amount: 5_000_000,
          category: 'Vận hành',
          date: '2026-08-06',
          created_at: '2026-08-06T00:00:00Z'
        }
      ];

      const weekly = FinanceService.calculateWeeklyCashflow([], '2026-08', expenses);
      const week1 = weekly[0]; // Day 1-7
      expect(week1.thu).toBe(20_000_000);
      expect(week1.chi).toBe(5_000_000);
    });
  });

  describe('Bug 2: Direct Staff Expense Reimbursement Outflow', () => {
    let mockStaffRepo: Partial<StaffRepository>;
    let mockExpenseRepo: Partial<ExpenseRepository>;

    beforeEach(() => {
      mockStaffRepo = {
        getById: vi.fn(),
        update: vi.fn(),
        getByCode: vi.fn()
      };
      mockExpenseRepo = {
        add: vi.fn(),
        deleteByNameAndCategory: vi.fn()
      };
    });

    it('should record cash outflow in operating_expenses when ReimburseStaffExpenses is executed', async () => {
      const staff = {
        id: 'staff-1',
        name: 'Nguyễn Văn A',
        code: 'SALE01',
        expenses: [
          {
            id: 'exp-101',
            amount: 2_000_000,
            note: 'Thay dầu xe',
            date: '2026-08-10',
            type: 'vehicle' as const,
            is_reimbursed: false
          }
        ]
      };
      (mockStaffRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(staff);
      (mockStaffRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue({ ...staff, expenses: [{ ...staff.expenses[0], is_reimbursed: true }] });

      const useCase = new ReimburseStaffExpenses(mockStaffRepo as StaffRepository, mockExpenseRepo as ExpenseRepository);
      await useCase.execute('staff-1', ['exp-101']);

      expect(mockStaffRepo.update).toHaveBeenCalled();
      expect(mockExpenseRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Hoàn ứng: Thay dầu xe (Nguyễn Văn A - SALE01)',
          amount: 2_000_000,
          category: 'Chi phí xe'
        })
      );
    });

    it('should record/delete operating_expenses on ToggleStaffExpenseReimbursement', async () => {
      const staff = {
        id: 'staff-1',
        name: 'Nguyễn Văn A',
        code: 'SALE01',
        expenses: [
          {
            id: 'exp-102',
            amount: 500_000,
            note: 'Rửa xe',
            date: '2026-08-10',
            type: 'vehicle' as const,
            is_reimbursed: false
          }
        ]
      };
      (mockStaffRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(staff);
      (mockStaffRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue({ ...staff, expenses: [{ ...staff.expenses[0], is_reimbursed: true }] });

      const useCase = new ToggleStaffExpenseReimbursement(mockStaffRepo as StaffRepository, mockExpenseRepo as ExpenseRepository);
      // Toggle to reimbursed (true)
      await useCase.execute('staff-1', 'exp-102');
      expect(mockExpenseRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Hoàn ứng: Rửa xe (Nguyễn Văn A - SALE01)',
          amount: 500_000
        })
      );
    });
  });

  describe('Bug 3: Salary Advances Outflow & Negative Salary Carry-Over', () => {
    let mockStaffRepo: Partial<StaffRepository>;
    let mockVehicleRepo: Partial<VehicleRepository>;
    let mockExpenseRepo: Partial<ExpenseRepository>;

    beforeEach(() => {
      mockStaffRepo = {
        getById: vi.fn(),
        update: vi.fn()
      };
      mockVehicleRepo = {
        getById: vi.fn()
      };
      mockExpenseRepo = {
        add: vi.fn()
      };
    });

    it('should create operating_expenses on salary advance disbursement via RecordExpense', async () => {
      const staff = {
        id: 'staff-2',
        name: 'Trần Thị B',
        code: 'SALE02',
        expenses: []
      };
      (mockStaffRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(staff);

      const useCase = new RecordExpense(
        mockStaffRepo as StaffRepository,
        mockVehicleRepo as VehicleRepository,
        mockExpenseRepo as ExpenseRepository
      );
      await useCase.execute({
        staffId: 'staff-2',
        amount: 5_000_000,
        name: 'Tạm ứng giữa tháng',
        category: 'Tạm ứng lương',
        type: 'operating',
        date: '2026-08-15'
      });

      expect(mockStaffRepo.update).toHaveBeenCalled();
      expect(mockExpenseRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tạm ứng lương: Tạm ứng giữa tháng (Trần Thị B - SALE02)',
          amount: 5_000_000,
          category: 'Tạm ứng lương'
        })
      );
    });

    it('should not allow netSalary < 0 when advance exceeds total salary and carry over remaining advance', () => {
      const member = {
        id: 'staff-3',
        name: 'Lê Văn C',
        code: 'SALE03',
        base_salary: 5_000_000,
        kpi_target: 3,
        kpi_bonus_multiplier: 1.0,
        paid_months: [],
        expenses: [
          {
            id: 'adv-1',
            amount: 8_000_000,
            note: 'Tạm ứng việc gia đình',
            date: '2026-08-10',
            type: 'operating' as const,
            category: 'Tạm ứng lương',
            is_reimbursed: false
          }
        ]
      };

      const salaryDetails = StaffSalaryService.calculateMonthlySalary(member as unknown as Staff, [], '2026-08');
      expect(salaryDetails.totalSalary).toBe(5_000_000);
      expect(salaryDetails.totalAdvances).toBe(8_000_000);
      expect(salaryDetails.netSalary).toBe(0); // Bounded >= 0
      expect(salaryDetails.carryOverAdvances).toBe(3_000_000); // 8M - 5M = 3M carried over
      expect(salaryDetails.targetExpenseIds).not.toContain('adv-1'); // Not settled yet
    });
  });

  describe('Bug 8: Cancel Sale Forfeit vs Refund', () => {
    it('should record other income on forfeit and reset vehicle received_amount', async () => {
      const mockVehicleRepo: Partial<VehicleRepository> = {
        getById: vi.fn().mockResolvedValue({
          id: 10,
          name: 'Mazda CX-5',
          code: 'A28-010',
          sale_payment_history: [{ amount: 50_000_000, date: '2026-08-01' }]
        } as unknown as Vehicle),
        cancelSale: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined)
      };
      const mockExpenseRepo: Partial<ExpenseRepository> = {
        add: vi.fn(),
        deleteByNameAndCategory: vi.fn()
      };

      const useCase = new CancelSale(
        mockVehicleRepo as VehicleRepository,
        mockExpenseRepo as ExpenseRepository
      );
      await useCase.execute({
        vehicleId: 10,
        userCode: 'ADMIN01',
        cancelType: 'FORFEIT'
      });

      expect(mockExpenseRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '[Thu] Tịch thu cọc xe Mazda CX-5 (A28-010)',
          amount: 50_000_000,
          category: 'Thu nhập khác'
        })
      );
      expect(mockVehicleRepo.cancelSale).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          status: VehicleStatus.IN_STOCK,
          note: expect.stringContaining('Tịch thu cọc')
        }),
        'FORFEIT'
      );
    });
  });

  describe('Bug: Partial Advance Deduction Calculation', () => {
    it('should correctly calculate partial advance deduction when budget is less than advance amount', () => {
      const member = {
        id: 'staff-4',
        name: 'Phạm Thị D',
        code: 'SALE04',
        base_salary: 8_000_000,
        target: 2,
        paid_months: [],
        expenses: [
          {
            id: 'adv-10m',
            amount: 10_000_000,
            note: 'Tạm ứng 10M',
            date: '2026-08-05',
            type: 'operating' as const,
            category: 'Tạm ứng lương',
            is_reimbursed: false
          }
        ]
      };

      const salaryDetails = StaffSalaryService.calculateMonthlySalary(member as unknown as Staff, [], '2026-08');
      expect(salaryDetails.totalSalary).toBe(8_000_000);
      expect(salaryDetails.netSalary).toBe(0);
      expect(salaryDetails.carryOverAdvances).toBe(2_000_000);
      expect(salaryDetails.partialAdvance).toEqual({
        id: 'adv-10m',
        deductedAmount: 8_000_000,
        remainingAmount: 2_000_000
      });
      expect(salaryDetails.targetExpenseIds).not.toContain('adv-10m');
    });
  });

  describe('Bug: Preserve Buying Commission for unpaid previous months', () => {
    it('should include buying commission from previous month if buying_commission_paid is false', () => {
      const member = {
        id: 'staff-5',
        name: 'Hoàng Văn E',
        code: 'SALE05',
        base_salary: 6_000_000,
        target: 1,
        paid_months: [],
        expenses: []
      };

      const cars = [
        {
          id: 101,
          name: 'Honda CR-V',
          code: 'CRV-01',
          buyer: 'SALE05',
          purchase_date: '2026-07-20', // Month before
          buying_commission: 3_000_000,
          buying_bonus: 1_000_000,
          buying_bonus_paid: false,
          buying_commission_paid: false
        }
      ];

      const salaryDetails = StaffSalaryService.calculateMonthlySalary(
        member as unknown as Staff,
        cars as unknown as Vehicle[],
        '2026-08'
      );
      expect(salaryDetails.buyingCommission).toBe(3_000_000);
      expect(salaryDetails.buyingBonus).toBe(1_000_000);
      expect(salaryDetails.totalSalary).toBe(10_000_000); // 6M base + 3M comm + 1M bonus
    });
  });
});
