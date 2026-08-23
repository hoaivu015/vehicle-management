import { describe, it, expect, vi, beforeEach } from 'vitest';
import { staffMapper } from '../../infrastructure/mappers/StaffMapper';
import { ReimburseStaffExpenses } from '../ReimburseStaffExpenses';
import { ToggleStaffExpenseReimbursement } from '../ToggleStaffExpenseReimbursement';
import { DeleteStaffExpense } from '../DeleteStaffExpense';
import { UpdateStaffExpense } from '../UpdateStaffExpense';
import { Staff } from '../../../../shared/domain/types';
import { StaffDTO } from '../../domain/StaffSchema';
import { StaffRepository } from '../../domain/StaffRepository';
import { ExpenseRepository } from '../../../finance/domain/ExpenseRepository';
import { VehicleRepository } from '../../../inventory/domain/VehicleRepository';

describe('Staff Expense & Salary Advance Financial Flow', () => {
  describe('StaffMapper', () => {
    it('preserves type: "advance" in toDTO and toDomain', () => {
      const staffDomain: Partial<Staff> = {
        id: 1,
        code: 'NV01',
        name: 'Nguyễn Văn A',
        expenses: [
          {
            id: 'exp-1',
            amount: 5000000,
            note: 'Tạm ứng lương tháng 8',
            date: '2026-08-01',
            type: 'advance',
            category: 'Tạm ứng lương',
            is_reimbursed: false
          },
          {
            id: 'exp-2',
            amount: 200000,
            note: 'Mua cà phê tiếp khách',
            date: '2026-08-02',
            type: 'operating',
            category: 'Vận hành',
            is_reimbursed: false
          }
        ]
      };

      const dto = staffMapper.toDTO(staffDomain);
      expect(dto.expenses?.[0].type).toBe('advance');
      expect(dto.expenses?.[1].type).toBe('operating');

      const backToDomain = staffMapper.toDomain(dto as unknown as StaffDTO);
      expect(backToDomain.expenses?.[0].type).toBe('advance');
      expect(backToDomain.expenses?.[1].type).toBe('operating');
    });
  });

  describe('ReimburseStaffExpenses', () => {
    const mockStaffRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };
    const mockExpenseRepo = {
      add: vi.fn()
    };
    let useCase: ReimburseStaffExpenses;

    beforeEach(() => {
      vi.clearAllMocks();
      useCase = new ReimburseStaffExpenses(
        mockStaffRepo as unknown as StaffRepository,
        mockExpenseRepo as unknown as ExpenseRepository
      );
    });

    it('creates operating expense for out-of-pocket reimbursements but NOT for salary advances', async () => {
      const staff: Staff = {
        id: 1,
        code: 'NV01',
        name: 'Nguyễn Văn A',
        role: 'STAFF',
        email: 'a@auto28.vn',
        status: 'ACTIVE',
        department: 'Kinh doanh',
        base_salary: 10000000,
        commission_per_car: 2000000,
        target: 5,
        paid_months: [],
        expenses: [
          {
            id: 'adv-1',
            amount: 5000000,
            note: 'Tạm ứng sinh hoạt',
            date: '2026-08-01',
            type: 'advance',
            category: 'Tạm ứng lương',
            is_reimbursed: false
          },
          {
            id: 'oop-1',
            amount: 300000,
            note: 'Rửa xe tiếp khách',
            date: '2026-08-02',
            type: 'operating',
            category: 'Vận hành',
            is_reimbursed: false
          }
        ]
      };

      mockStaffRepo.getById.mockResolvedValue(staff);
      mockStaffRepo.update.mockResolvedValue(staff);

      await useCase.execute(1, ['adv-1', 'oop-1']);

      // Only 'oop-1' should generate an operating expense (Hoàn ứng), NOT the advance (adv-1)
      expect(mockExpenseRepo.add).toHaveBeenCalledTimes(1);
      expect(mockExpenseRepo.add).toHaveBeenCalledWith(expect.objectContaining({
        name: expect.stringContaining('Rửa xe tiếp khách'),
        amount: 300000
      }));
    });
  });

  describe('ToggleStaffExpenseReimbursement', () => {
    const mockStaffRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };
    const mockExpenseRepo = {
      add: vi.fn(),
      deleteByNameAndCategory: vi.fn()
    };
    let useCase: ToggleStaffExpenseReimbursement;

    beforeEach(() => {
      vi.clearAllMocks();
      useCase = new ToggleStaffExpenseReimbursement(
        mockStaffRepo as unknown as StaffRepository,
        mockExpenseRepo as unknown as ExpenseRepository
      );
    });

    it('does not add operating expense when toggling a salary advance', async () => {
      const staff: Staff = {
        id: 1,
        code: 'NV01',
        name: 'Nguyễn Văn A',
        role: 'STAFF',
        email: 'a@auto28.vn',
        status: 'ACTIVE',
        department: 'Kinh doanh',
        base_salary: 10000000,
        commission_per_car: 2000000,
        target: 5,
        paid_months: [],
        expenses: [
          {
            id: 'adv-1',
            amount: 5000000,
            note: 'Tạm ứng sinh hoạt',
            date: '2026-08-01',
            type: 'advance',
            category: 'Tạm ứng lương',
            is_reimbursed: false
          }
        ]
      };

      mockStaffRepo.getById.mockResolvedValue(staff);
      mockStaffRepo.update.mockResolvedValue(staff);

      await useCase.execute(1, 'adv-1');

      expect(mockExpenseRepo.add).not.toHaveBeenCalled();
      expect(mockExpenseRepo.deleteByNameAndCategory).not.toHaveBeenCalled();
    });
  });

  describe('DeleteStaffExpense', () => {
    const mockStaffRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };
    const mockVehicleRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };
    const mockExpenseRepo = {
      deleteByNameAndCategory: vi.fn()
    };
    let useCase: DeleteStaffExpense;

    beforeEach(() => {
      vi.clearAllMocks();
      useCase = new DeleteStaffExpense(
        mockStaffRepo as unknown as StaffRepository,
        mockVehicleRepo as unknown as VehicleRepository,
        mockExpenseRepo as unknown as ExpenseRepository
      );
    });

    it('deletes corresponding operating_expense when deleting a salary advance', async () => {
      const staff: Staff = {
        id: 1,
        code: 'NV01',
        name: 'Nguyễn Văn A',
        role: 'STAFF',
        email: 'a@auto28.vn',
        status: 'ACTIVE',
        department: 'Kinh doanh',
        base_salary: 10000000,
        commission_per_car: 2000000,
        target: 5,
        paid_months: [],
        expenses: [
          {
            id: 'adv-1',
            amount: 5000000,
            note: 'Tạm ứng cá nhân',
            date: '2026-08-01',
            type: 'advance',
            category: 'Tạm ứng lương',
            is_reimbursed: false
          }
        ]
      };

      mockStaffRepo.getById.mockResolvedValue(staff);
      mockStaffRepo.update.mockResolvedValue(staff);

      await useCase.execute(1, 'adv-1');

      expect(mockExpenseRepo.deleteByNameAndCategory).toHaveBeenCalledWith(
        'Tạm ứng lương: Tạm ứng cá nhân (Nguyễn Văn A - NV01)',
        'Tạm ứng lương'
      );
    });
  });

  describe('UpdateStaffExpense', () => {
    const mockStaffRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };
    const mockVehicleRepo = {
      getById: vi.fn(),
      update: vi.fn()
    };
    const mockExpenseRepo = {
      add: vi.fn(),
      deleteByNameAndCategory: vi.fn()
    };
    let useCase: UpdateStaffExpense;

    beforeEach(() => {
      vi.clearAllMocks();
      useCase = new UpdateStaffExpense(
        mockStaffRepo as unknown as StaffRepository,
        mockVehicleRepo as unknown as VehicleRepository,
        mockExpenseRepo as unknown as ExpenseRepository
      );
    });

    it('updates corresponding operating_expense when updating a salary advance amount/note', async () => {
      const staff: Staff = {
        id: 1,
        code: 'NV01',
        name: 'Nguyễn Văn A',
        role: 'STAFF',
        email: 'a@auto28.vn',
        status: 'ACTIVE',
        department: 'Kinh doanh',
        base_salary: 10000000,
        commission_per_car: 2000000,
        target: 5,
        paid_months: [],
        expenses: [
          {
            id: 'adv-1',
            amount: 5000000,
            note: 'Tạm ứng cá nhân cũ',
            date: '2026-08-01',
            type: 'advance',
            category: 'Tạm ứng lương',
            is_reimbursed: false
          }
        ]
      };

      mockStaffRepo.getById.mockResolvedValue(staff);
      mockStaffRepo.update.mockResolvedValue(staff);

      await useCase.execute(1, 'adv-1', {
        id: 'adv-1',
        amount: 7000000,
        note: 'Tạm ứng cá nhân mới',
        category: 'Tạm ứng lương',
        type: 'advance'
      });

      expect(mockExpenseRepo.deleteByNameAndCategory).toHaveBeenCalledWith(
        'Tạm ứng lương: Tạm ứng cá nhân cũ (Nguyễn Văn A - NV01)',
        'Tạm ứng lương'
      );

      expect(mockExpenseRepo.add).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Tạm ứng lương: Tạm ứng cá nhân mới (Nguyễn Văn A - NV01)',
        amount: 7000000,
        category: 'Tạm ứng lương'
      }));
    });
  });
});
