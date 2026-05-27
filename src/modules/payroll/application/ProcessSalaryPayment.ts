import { StaffRepository } from '../../staff/domain/StaffRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { PayrollService } from '../domain/PayrollService';

export interface PaymentRequest {
  staffId: string; // string UID or bigint ID? Base repo says string for generic id.
  // In our DB employees.id is bigint. Let's assume the passed ID is the bigint ID as number/string.
  numericStaffId: number; 
  staffCode: string;
  staffName: string;
  month: string;
  amount: number;
  targetExpenseIds: string[];
  targetVehicleIds: number[];
  targetCoinvestVehicleIds: number[];
  paymentDate?: string; // ISO format YYYY-MM-DD
}

export class ProcessSalaryPayment {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  async execute(request: PaymentRequest): Promise<void> {
    const { numericStaffId, staffCode, staffName, month, amount, targetVehicleIds } = request;

    // 1. Ghi nhận phiếu chi vào Dòng tiền (Finance)
    const { name, category } = PayrollService.getSalaryExpenseDetails(staffCode, staffName, month);
    await this.expenseRepository.add({
      name,
      amount,
      category,
      date: request.paymentDate || new Date().toISOString().split('T')[0]
    } as any);

    // 2. Ghi nhận vào bảng Payouts -> TRIGGER tự động cập nhật paid_months và hoàn ứng expenses
    await this.staffRepository.addSalaryPayout({
      employee_id: numericStaffId,
      month,
      amount,
      target_expense_ids: request.targetExpenseIds,
      note: `Thanh toán lương ${month}`
    });

    // 3. Cập nhật trạng thái thưởng mua xe trên từng xe (Vehicle)
    if (targetVehicleIds.length > 0) {
      await Promise.all(targetVehicleIds.map(id => 
        this.vehicleRepository.update(id.toString(), { buying_bonus_paid: true })
      ));
    }

    // 4. Cập nhật trạng thái chia lợi nhuận đối tác (Vehicle)
    if (request.targetCoinvestVehicleIds && request.targetCoinvestVehicleIds.length > 0) {
      await Promise.all(request.targetCoinvestVehicleIds.map(id => 
        this.vehicleRepository.update(id.toString(), { partner_profit_shared: true })
      ));
    }
  }
}

export class CancelSalaryPayment {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  async execute(
    staffId: string | number, 
    staffCode: string, 
    staffName: string, 
    month: string, 
    targetVehicleIds: number[],
    targetCoinvestVehicleIds?: number[]
  ): Promise<void> {
    // 1. Xóa phiếu chi trong Dòng tiền (Finance)
    const { name, category } = PayrollService.getSalaryExpenseDetails(staffCode, staffName, month);
    await this.expenseRepository.deleteByNameAndCategory(name, category);

    // 2. Xóa record trong Payouts -> TRIGGER tự động revert paid_months và is_reimbursed cho expenses
    await this.staffRepository.deleteSalaryPayout(Number(staffId), month);

    // 3. Revert trạng thái thưởng mua xe trên từng xe (Vehicle)
    if (targetVehicleIds.length > 0) {
      await Promise.all(targetVehicleIds.map(id => 
        this.vehicleRepository.update(id.toString(), { buying_bonus_paid: false })
      ));
    }

    // 4. Revert trạng thái chia lợi nhuận đối tác (Vehicle)
    if (targetCoinvestVehicleIds && targetCoinvestVehicleIds.length > 0) {
      await Promise.all(targetCoinvestVehicleIds.map(id => 
        this.vehicleRepository.update(id.toString(), { partner_profit_shared: false })
      ));
    }
  }
}
