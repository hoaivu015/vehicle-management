import { GetStaffList, StaffWithSalary } from '../application/GetStaffList';
import { AddStaff } from '../application/AddStaff';
import { UpdateStaff } from '../application/UpdateStaff';
import { DeleteStaff } from '../application/DeleteStaff';
import { AddStaffExpense } from '../application/AddStaffExpense';
import { ToggleStaffExpenseReimbursement } from '../application/ToggleStaffExpenseReimbursement';
import { DeleteStaffExpense } from '../application/DeleteStaffExpense';
import { UpdateStaffExpense } from '../application/UpdateStaffExpense';
import { ReimburseStaffExpenses } from '../application/ReimburseStaffExpenses';
import { Vehicle } from '../../../shared/domain/types';
import { UserRole } from '../../../shared/domain/constants';

export interface StaffView {
  showStaffList(staff: StaffWithSalary[]): void;
  showLoading(): void;
  hideLoading(): void;
  showError(message: string): void;
  onStaffAdded(): void;
  onStaffUpdated(): void;
  onStaffDeleted(): void;
  onExpenseAdded?(): void;
}

export class StaffPresenter {
  private view?: StaffView;
  private staffList: StaffWithSalary[] = [];
  private subscription: any = null;

  constructor(
    private readonly getStaffListUseCase: GetStaffList,
    private readonly addStaffUseCase?: AddStaff,
    private readonly updateStaffUseCase?: UpdateStaff,
    private readonly deleteStaffUseCase?: DeleteStaff,
    private readonly addStaffExpenseUseCase?: AddStaffExpense,
    private readonly toggleReimbursementUseCase?: ToggleStaffExpenseReimbursement,
    private readonly deleteStaffExpenseUseCase?: DeleteStaffExpense,
    private readonly updateStaffExpenseUseCase?: UpdateStaffExpense,
    private readonly reimburseExpensesUseCase?: ReimburseStaffExpenses
  ) {}

  attachView(view: StaffView): void {
    this.view = view;
  }

  detachView(): void {
    this.view = undefined;
    if (this.subscription) {
      import('../../../shared/infrastructure/supabase').then(({ supabase }) => {
        supabase.removeChannel(this.subscription);
      });
    }
  }

  async subscribeToChanges(monthStr: string): Promise<void> {
     const { supabase } = await import('../../../shared/infrastructure/supabase');
     if (this.subscription) return;
     
     this.subscription = supabase.channel('staff_changes')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
         this.loadStaff(monthStr);
       })
       .subscribe();
  }

  async loadStaff(monthStr: string): Promise<void> {
    if (!this.view) return;
    this.view.showLoading();
    try {
      this.staffList = await this.getStaffListUseCase.execute(monthStr);
      // Filter out ADMINs
      const displayList = this.staffList.filter(s => s.role !== UserRole.ADMIN);
      this.view.showStaffList(displayList);
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi tải danh sách nhân viên');
    } finally {
      this.view.hideLoading();
    }
  }

  async addStaff(staffData: any): Promise<void> {
    if (!this.view || !this.addStaffUseCase) return;
    this.view.showLoading();
    try {
      await this.addStaffUseCase.execute(staffData);
      this.view.onStaffAdded();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi thêm nhân viên');
    } finally {
      this.view.hideLoading();
    }
  }

  async updateStaff(id: string, staffData: any): Promise<void> {
    if (!this.view || !this.updateStaffUseCase) return;
    this.view.showLoading();
    try {
      await this.updateStaffUseCase.execute(id, staffData);
      this.view.onStaffUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi cập nhật nhân viên');
    } finally {
      this.view.hideLoading();
    }
  }

  async deleteStaff(id: string): Promise<void> {
    if (!this.view || !this.deleteStaffUseCase) return;
    this.view.showLoading();
    try {
      await this.deleteStaffUseCase.execute(id);
      this.view.onStaffDeleted();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi xóa nhân viên');
    } finally {
      this.view.hideLoading();
    }
  }

  async addStaffExpense(staffId: string, expenseData: any): Promise<void> {
    if (!this.view || !this.addStaffExpenseUseCase) return;
    this.view.showLoading();
    try {
      await this.addStaffExpenseUseCase.execute({
        staffId,
        ...expenseData
      });
      if (this.view.onExpenseAdded) this.view.onExpenseAdded();
      else this.view.onStaffUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi thêm chi phí');
    } finally {
      this.view.hideLoading();
    }
  }

  async toggleReimbursement(staffId: string, expenseId: string): Promise<void> {
    if (!this.view || !this.toggleReimbursementUseCase) return;
    this.view.showLoading();
    try {
      await this.toggleReimbursementUseCase.execute(staffId, expenseId);
      this.view.onStaffUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      this.view.hideLoading();
    }
  }

  async deleteExpense(staffId: string, expenseId: string): Promise<void> {
    if (!this.view || !this.deleteStaffExpenseUseCase) return;
    this.view.showLoading();
    try {
      await this.deleteStaffExpenseUseCase.execute(staffId, expenseId);
      this.view.onStaffUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi xóa khoản chi');
    } finally {
      this.view.hideLoading();
    }
  }

  async updateExpense(staffId: string, expenseId: string, data: any): Promise<void> {
    if (!this.view || !this.updateStaffExpenseUseCase) return;
    this.view.showLoading();
    try {
      await this.updateStaffExpenseUseCase.execute(staffId, expenseId, data);
      this.view.onStaffUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi cập nhật khoản chi');
    } finally {
      this.view.hideLoading();
    }
  }

  async reimburseMultiple(staffId: string, expenseIds: string[]): Promise<void> {
    if (!this.view || !this.reimburseExpensesUseCase) return;
    this.view.showLoading();
    try {
      await this.reimburseExpensesUseCase.execute(staffId, expenseIds);
      this.view.onStaffUpdated();
    } catch (error: any) {
      this.view.showError(error.message || 'Lỗi khi thực hiện thanh toán hàng loạt');
    } finally {
      this.view.hideLoading();
    }
  }

  filterStaff(query: string): void {
    if (!this.view) return;
    const filtered = this.staffList.filter(s => 
      s.role !== UserRole.ADMIN && (
        s.name.toLowerCase().includes(query.toLowerCase()) || 
        s.code.toLowerCase().includes(query.toLowerCase())
      )
    );
    this.view.showStaffList(filtered);
  }
}
