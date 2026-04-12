import { GetStaffList, StaffWithSalary } from '../application/GetStaffList';
import { AddStaff } from '../application/AddStaff';
import { UpdateStaff } from '../application/UpdateStaff';
import { DeleteStaff } from '../application/DeleteStaff';
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
}

export class StaffPresenter {
  private view?: StaffView;
  private staffList: StaffWithSalary[] = [];
  private subscription: any = null;

  constructor(
    private readonly getStaffListUseCase: GetStaffList,
    private readonly addStaffUseCase?: AddStaff,
    private readonly updateStaffUseCase?: UpdateStaff,
    private readonly deleteStaffUseCase?: DeleteStaff
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
