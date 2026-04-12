import { Vehicle } from '../../../shared/domain/types';
import { GetMonthlyFinance, MonthlyFinanceData } from '../application/GetMonthlyFinance';
import { GetFinancialOverview, FinancialOverviewData } from '../application/GetFinancialOverview';
import { ExpenseRepository } from '../infrastructure/ExpenseRepository';
import { Expense } from '../domain/FinanceService';
import { toast } from 'sonner';
import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';

export interface FinanceView {
  setLoading(loading: boolean): void;
  setMonthlyFinance(data: MonthlyFinanceData): void;
  setFinancialOverview(data: FinancialOverviewData): void;
  setTotalCapital(capital: number): void;
  setVehicles(vehicles: Vehicle[]): void;
  setStaff(staff: any[]): void;
  showError(message: string): void;
}

export class FinancePresenter {
  private view?: FinanceView;
  private currentMonth: string = new Date().toISOString().slice(0, 7);

  constructor(
    private readonly getMonthlyFinance: GetMonthlyFinance,
    private readonly getFinancialOverview: GetFinancialOverview,
    private readonly expenseRepo: ExpenseRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  private subscription: any = null;

  attachView(view: FinanceView): void {
    this.view = view;
  }

  detachView(): void {
    this.view = undefined;
    if (this.subscription) {
      import('../../../shared/infrastructure/supabase').then(({ supabase }) => {
        supabase.removeChannel(this.subscription);
      });
      this.subscription = null;
    }
  }

  async subscribeToChanges(): Promise<void> {
    if (this.subscription) return;
    
    const { supabase } = await import('../../../shared/infrastructure/supabase');

    this.subscription = supabase.channel('finance_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operating_expenses' }, () => {
        this.loadFinanceData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_settings' }, () => {
        this.loadFinanceData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        this.loadFinanceData();
      })
      .subscribe();
  }

  async loadFinanceData(): Promise<void> {
    if (!this.view) return;
    this.view.setLoading(true);

    try {
      const [monthlyData, overviewData, vehicles, staff] = await Promise.all([
        this.getMonthlyFinance.execute(this.currentMonth),
        this.getFinancialOverview.execute(this.currentMonth),
        this.vehicleRepository.getAll(),
        this.staffRepository.getAll()
      ]);
      
      this.view.setMonthlyFinance(monthlyData);
      this.view.setFinancialOverview(overviewData);
      this.view.setTotalCapital(overviewData.totalCapital);
      this.view.setVehicles(vehicles);
      
      // Filter out ADMINs from staff list
      const filteredStaff = staff.filter(s => s.role !== 'ADMIN');
      this.view.setStaff(filteredStaff);
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi tải dữ liệu tài chính');
    } finally {
      this.view.setLoading(false);
    }
  }

  setMonth(month: string): void {
    this.currentMonth = month;
    this.loadFinanceData();
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    try {
      await this.expenseRepo.add(expense);
      toast.success('Đã thêm chi phí vận hành');
      this.loadFinanceData();
    } catch (error: any) {
      toast.error('Lỗi khi thêm chi phí: ' + error.message);
    }
  }

  async updateExpense(id: string | number, expense: Partial<Expense>): Promise<void> {
    try {
      await this.expenseRepo.update(id, expense);
      toast.success('Đã cập nhật chi phí');
      this.loadFinanceData();
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật chi phí: ' + error.message);
    }
  }

  async deleteExpense(id: string | number): Promise<void> {
    try {
      if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;
      await this.expenseRepo.delete(id);
      toast.success('Đã xóa chi phí');
      this.loadFinanceData();
    } catch (error: any) {
      toast.error('Lỗi khi xóa chi phí: ' + error.message);
    }
  }

  async updateCapital(amount: number): Promise<void> {
    try {
      await (this.expenseRepo as any).updateCapital(amount);
      toast.success('Đã cập nhật nguồn vốn');
      this.loadFinanceData();
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật vốn: ' + error.message);
    }
  }
}
