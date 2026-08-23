import { StaffRepository } from '../../staff/domain/StaffRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { PayrollService } from '../domain/PayrollService';

export interface PaymentRequest {
  staffId: string;
  numericStaffId: number; 
  staffCode: string;
  staffName: string;
  month: string;
  amount: number;
  targetExpenseIds: string[];
  targetVehicleIds: number[];
  targetCoinvestVehicleIds: number[];
  paymentDate?: string; // ISO format YYYY-MM-DD
  snapshot?: Record<string, unknown>;
}

export class ProcessSalaryPayment {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly expenseRepository: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  async execute(request: PaymentRequest): Promise<void> {
    const { numericStaffId, staffCode, staffName, month, amount, targetVehicleIds, targetCoinvestVehicleIds } = request;
    const { name, category } = PayrollService.getSalaryExpenseDetails(staffCode, staffName, month);
    const paymentDate = request.paymentDate || new Date().toISOString().split('T')[0];

    // Tạo note chứa Snapshot đóng băng dữ liệu (Immutable Payslip Archive)
    const noteContent = request.snapshot 
      ? JSON.stringify({ 
          description: `Thanh toán lương tháng ${month} cho ${staffName} (${staffCode})`,
          month,
          paidAt: new Date().toISOString(),
          snapshot: request.snapshot 
        })
      : `Thanh toán lương ${month}`;

    let expenseCreated = false;
    let payoutCreated = false;

    try {
      // 1. Ghi nhận phiếu chi vào Dòng tiền (Finance)
      await this.expenseRepository.add({
        name,
        amount,
        category,
        date: paymentDate
      });
      expenseCreated = true;

      // 2. Ghi nhận vào bảng Payouts -> TRIGGER tự động cập nhật paid_months và hoàn ứng expenses
      await this.staffRepository.addSalaryPayout({
        employee_id: numericStaffId,
        month,
        amount,
        target_expense_ids: request.targetExpenseIds,
        note: noteContent
      });
      payoutCreated = true;

      // 3. Cập nhật trạng thái thưởng mua xe và hoa hồng mua xe trên từng xe (Vehicle)
      if (targetVehicleIds.length > 0) {
        await Promise.all(targetVehicleIds.map(id => 
          this.vehicleRepository.update(id.toString(), { 
            buying_bonus_paid: true,
            buying_commission_paid: true 
          })
        ));
      }

      // 4. Cập nhật trạng thái chia lợi nhuận đối tác (Vehicle)
      if (targetCoinvestVehicleIds && targetCoinvestVehicleIds.length > 0) {
        await Promise.all(targetCoinvestVehicleIds.map(id => 
          this.vehicleRepository.update(id.toString(), { partner_profit_shared: true })
        ));
      }
    } catch (err) {
      // Compensating rollback nếu xảy ra lỗi giao dịch giữa chừng
      if (payoutCreated) {
        try {
          await this.staffRepository.deleteSalaryPayout(numericStaffId, month);
        } catch {
          // ignore rollback cleanup errors
        }
      }
      if (expenseCreated) {
        try {
          await this.expenseRepository.deleteByNameAndCategory(name, category);
        } catch {
          // ignore rollback cleanup errors
        }
      }
      throw new Error(`Xử lý chi lương thất bại, hệ thống đã hoàn tác giao dịch: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

// Re-export CancelSalaryPayment for clean single-responsibility use cases
export { CancelSalaryPayment } from './CancelSalaryPayment';
