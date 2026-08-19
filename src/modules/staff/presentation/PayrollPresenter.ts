import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { ProcessSalaryPayment, PaymentRequest, CancelSalaryPayment } from '../../payroll/application/ProcessSalaryPayment';
import { StaffWithSalary } from '../application/GetStaffList';

export interface PayrollView extends BaseView {
  onStaffUpdated(): void;
}

export class PayrollPresenter extends BasePresenter<PayrollView> {
  constructor(
    private readonly processSalaryUseCase: ProcessSalaryPayment,
    private readonly cancelSalaryUseCase: CancelSalaryPayment
  ) {
    super();
  }

  async paySalary(request: PaymentRequest): Promise<void> {
    await this.perform(
      () => this.processSalaryUseCase.execute(request),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi thanh toán lương'
    );
  }

  async cancelSalary(
    staffId: string | number, 
    staffCode: string, 
    staffName: string, 
    month: string, 
    targetVehicleIds: number[],
    targetCoinvestVehicleIds: number[]
  ): Promise<void> {
    await this.perform(
      () => this.cancelSalaryUseCase.execute(staffId, staffCode, staffName, month, targetVehicleIds, targetCoinvestVehicleIds),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi hủy thanh toán'
    );
  }

  async toggleSalaryPayment(staff: StaffWithSalary, month: string, paymentDate?: string): Promise<void> {
    const isPaid = staff.salaryDetails.isPaid;
    const { targetExpenseIds, targetVehicleIds, targetCoinvestVehicleIds, netSalary } = staff.salaryDetails;

    if (isPaid) {
      await this.cancelSalary(staff.id, staff.code, staff.name, month, targetVehicleIds, targetCoinvestVehicleIds);
    } else {
      await this.paySalary({
        staffId: String(staff.id),
        numericStaffId: Number(staff.id),
        staffCode: staff.code,
        staffName: staff.name,
        month,
        amount: netSalary,
        targetExpenseIds: targetExpenseIds,
        targetVehicleIds: targetVehicleIds,
        targetCoinvestVehicleIds: targetCoinvestVehicleIds,
        paymentDate,
        snapshot: {
          baseSalary: staff.salaryDetails.base,
          salesCommission: staff.salaryDetails.salesCommission,
          buyingCommission: staff.salaryDetails.buyingCommission,
          buyingBonus: staff.salaryDetails.buyingBonus,
          coinvestProfitShare: staff.salaryDetails.coinvestProfitShare,
          kpiBonusMultiplier: staff.salaryDetails.kpiBonusMultiplier,
          totalSalary: staff.salaryDetails.totalSalary,
          totalReimbursements: staff.salaryDetails.totalReimbursements,
          totalAdvances: staff.salaryDetails.totalAdvances,
          netSalary: staff.salaryDetails.netSalary,
          soldCount: staff.salaryDetails.soldCount,
          boughtCount: staff.salaryDetails.boughtCount,
          soldCars: staff.salaryDetails.soldCars.map(c => ({ id: c.id, code: c.code, name: c.name, commission: c.commission })),
          boughtCars: staff.salaryDetails.boughtCars.map(c => ({ id: c.id, code: c.code, name: c.name, buying_commission: c.buying_commission, buying_bonus: c.buying_bonus })),
          coinvestedCars: staff.salaryDetails.coinvestedCars.map(c => ({ id: c.id, code: c.code, name: c.name }))
        }
      });
    }
  }
}
