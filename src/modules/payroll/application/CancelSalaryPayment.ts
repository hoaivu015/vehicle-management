import { StaffRepository } from '../../staff/domain/StaffRepository';
import { ExpenseRepository } from '../../finance/domain/ExpenseRepository';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { PayrollService } from '../domain/PayrollService';

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

    // 3. Revert trạng thái thưởng mua xe và hoa hồng mua xe trên từng xe (Vehicle)
    if (targetVehicleIds.length > 0) {
      await Promise.all(targetVehicleIds.map(id => 
        this.vehicleRepository.update(id.toString(), { 
          buying_bonus_paid: false,
          buying_commission_paid: false 
        })
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
