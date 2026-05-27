import { BasePresenter, BaseView } from '@/src/shared/presentation/BasePresenter';
import { Vehicle } from '@/src/shared/domain/types';
import { GetMonthlyFinance, MonthlyFinanceData } from '@/src/modules/finance/application/GetMonthlyFinance';
import { GetFinancialOverview, FinancialOverviewData } from '@/src/modules/finance/application/GetFinancialOverview';
import { ExpenseRepository, Expense } from '@/src/modules/finance/domain/ExpenseRepository';
import { NotificationService } from '@/src/shared/domain/NotificationService';
import { VehicleRepository } from '@/src/modules/inventory/domain/VehicleRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { RecordExpense } from '@/src/modules/finance/application/RecordExpense';
import { UnifiedExpenseCommand } from '@/src/shared/domain/schemas';
import { IUnifiedExpensePresenter } from '@/src/shared/presentation/interfaces/IUnifiedExpensePresenter';

export interface FinanceView extends BaseView {
  setMonthlyFinance(data: MonthlyFinanceData): void;
  setFinancialOverview(data: FinancialOverviewData): void;
  setTotalCapital(capital: number): void;
  setVehicles(vehicles: Vehicle[]): void;
  setStaff(staff: import('../../../shared/domain/types').Staff[]): void;
}

export class FinancePresenter extends BasePresenter<FinanceView> implements IUnifiedExpensePresenter {
  private currentMonth: string = new Date().toISOString().slice(0, 7);
  private subscription: { unsubscribe: () => void } | null = null;

  constructor(
    private readonly getMonthlyFinance: GetMonthlyFinance,
    private readonly getFinancialOverview: GetFinancialOverview,
    private readonly expenseRepo: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository,
    private readonly recordExpenseUseCase: RecordExpense,
    private readonly notification: NotificationService
  ) {
    super();
  }

  detachView(): void {
    super.detachView();
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  async subscribeToChanges(): Promise<void> {
    if (this.subscription) return;
    const { supabase } = await import('../../../shared/infrastructure/supabase');

    this.subscription = supabase.channel('finance_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operating_expenses' }, () => this.loadFinanceData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_settings' }, () => this.loadFinanceData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => this.loadFinanceData())
      .subscribe() as unknown as { unsubscribe: () => void };
  }

  async loadFinanceData(): Promise<void> {
    await this.perform(async () => {
      const [monthlyData, overviewData, vehicles, staff] = await Promise.all([
        this.getMonthlyFinance.execute(this.currentMonth),
        this.getFinancialOverview.execute(this.currentMonth),
        this.vehicleRepository.getAll(),
        this.staffRepository.getAll()
      ]);
      
      if (this.view) {
        this.view.setMonthlyFinance(monthlyData);
        this.view.setFinancialOverview(overviewData);
        this.view.setTotalCapital(overviewData.totalCapital);
        this.view.setVehicles(vehicles);
        
        const filteredStaff = staff.filter(s => !PermissionService.isAdmin(s.role));
        this.view.setStaff(filteredStaff);
      }
    }, undefined, 'Lỗi tải dữ liệu tài chính');
  }

  setMonth(month: string): void {
    this.currentMonth = month;
    this.loadFinanceData();
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    await this.perform(
      () => this.expenseRepo.add(expense),
      () => {
        this.notification.success('Đã thêm chi phí vận hành');
        this.loadFinanceData();
      },
      'Lỗi khi thêm chi phí'
    );
  }

  async updateExpense(id: string | number, expense: Partial<Expense>): Promise<void> {
    await this.perform(
      () => this.expenseRepo.update(id, expense),
      () => {
        this.notification.success('Đã cập nhật chi phí');
        this.loadFinanceData();
      },
      'Lỗi khi cập nhật chi phí'
    );
  }

  async deleteExpense(id: string | number): Promise<void> {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;
    await this.perform(
      () => this.expenseRepo.delete(id),
      () => {
        this.notification.success('Đã xóa chi phí');
        this.loadFinanceData();
      },
      'Lỗi khi xóa chi phí'
    );
  }

  /**
   * recordShowroomExpense - Orchestrated entry point for any expense.
   */
  async recordShowroomExpense(data: UnifiedExpenseCommand): Promise<void> {
    await this.perform(
      () => this.recordExpenseUseCase.execute(data),
      () => {
        this.notification.success('Ghi nhận chi thành công');
        this.loadFinanceData();
      },
      'Lỗi ghi nhận chi'
    );
  }

  async recordExpense(command: UnifiedExpenseCommand): Promise<void> {
    await this.recordShowroomExpense(command);
  }

  async updateCapital(amount: number): Promise<void> {
    await this.perform(
      () => this.expenseRepo.updateCapital(amount),
      () => {
        this.notification.success('Đã cập nhật nguồn vốn');
        this.loadFinanceData();
      },
      'Lỗi khi cập nhật vốn'
    );
  }
}
