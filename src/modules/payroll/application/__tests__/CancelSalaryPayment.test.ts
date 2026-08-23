import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelSalaryPayment } from '../CancelSalaryPayment';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { ExpenseRepository } from '@/src/modules/finance/domain/ExpenseRepository';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';

describe('CancelSalaryPayment UseCase', () => {
  let mockStaffRepo: Partial<StaffRepository>;
  let mockExpenseRepo: Partial<ExpenseRepository>;
  let mockVehicleRepo: Partial<VehicleRepository>;
  let useCase: CancelSalaryPayment;

  beforeEach(() => {
    mockStaffRepo = {
      deleteSalaryPayout: vi.fn().mockResolvedValue(undefined),
    };
    mockExpenseRepo = {
      deleteByNameAndCategory: vi.fn().mockResolvedValue(undefined),
    };
    mockVehicleRepo = {
      update: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new CancelSalaryPayment(
      mockStaffRepo as StaffRepository,
      mockExpenseRepo as ExpenseRepository,
      mockVehicleRepo as VehicleRepository
    );
  });

  it('hủy thanh toán lương thành công, hoàn tác chi phí, payout và trạng thái xe', async () => {
    await useCase.execute(
      1,
      'NV01',
      'Nguyễn Văn A',
      '2026-05',
      [101, 102],
      [201]
    );

    // 1. Kiểm tra xóa expense
    expect(mockExpenseRepo.deleteByNameAndCategory).toHaveBeenCalledWith(
      'Chi lương tháng 2026-05 - Nguyễn Văn A (NV01)',
      'Lương nhân sự'
    );

    // 2. Kiểm tra xóa payout
    expect(mockStaffRepo.deleteSalaryPayout).toHaveBeenCalledWith(1, '2026-05');

    // 3. Kiểm tra revert buying bonuses/commissions trên xe
    expect(mockVehicleRepo.update).toHaveBeenCalledWith('101', {
      buying_bonus_paid: false,
      buying_commission_paid: false,
    });
    expect(mockVehicleRepo.update).toHaveBeenCalledWith('102', {
      buying_bonus_paid: false,
      buying_commission_paid: false,
    });

    // 4. Kiểm tra revert partner profit share
    expect(mockVehicleRepo.update).toHaveBeenCalledWith('201', {
      partner_profit_shared: false,
    });
  });

  it('chạy bình thường khi không có xe target hoặc xe góp vốn', async () => {
    await useCase.execute(2, 'NV02', 'Trần Thị B', '2026-05', [], []);

    expect(mockExpenseRepo.deleteByNameAndCategory).toHaveBeenCalledWith(
      'Chi lương tháng 2026-05 - Trần Thị B (NV02)',
      'Lương nhân sự'
    );
    expect(mockStaffRepo.deleteSalaryPayout).toHaveBeenCalledWith(2, '2026-05');
    expect(mockVehicleRepo.update).not.toHaveBeenCalled();
  });
});
