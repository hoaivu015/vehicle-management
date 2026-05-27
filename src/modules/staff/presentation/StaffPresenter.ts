import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { StaffListPresenter } from './StaffListPresenter';
import { StaffActionPresenter } from './StaffActionPresenter';
import { StaffExpensePresenter } from './StaffExpensePresenter';
import { PayrollPresenter } from './PayrollPresenter';
import { StaffWithSalary } from '../application/GetStaffList';
import { Vehicle } from '../../../shared/domain/types';
import { UpdateVehicle } from '../../inventory/application/UpdateVehicle';
import { PaymentRequest } from '../../payroll/application/ProcessSalaryPayment';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AddStaffInput, UpdateStaffInput, AddStaffExpenseInput, UpdateStaffExpenseInput } from '../domain/StaffValidation';
import { IUnifiedExpensePresenter } from '@/src/shared/presentation/interfaces/IUnifiedExpensePresenter';
import { UnifiedExpenseCommand } from '@/src/shared/domain/schemas';

import { StaffListView } from './StaffListPresenter';

export interface StaffView extends BaseView, StaffListView {
  onStaffAdded(): void;
  onStaffUpdated(): void;
  onStaffDeleted(): void;
  onExpenseAdded?(): void;
}

export class StaffPresenter extends BasePresenter<StaffView> implements IUnifiedExpensePresenter {
  private subscription: RealtimeChannel | null = null;
  private currentMonth: string = new Date().toISOString().slice(0, 7);

  constructor(
    private readonly listPresenter: StaffListPresenter,
    private readonly actionPresenter: StaffActionPresenter,
    private readonly expensePresenter: StaffExpensePresenter,
    private readonly payrollPresenter: PayrollPresenter,
    private readonly updateVehicleUseCase: UpdateVehicle
  ) {
    super();
  }

  attachView(view: StaffView): void {
    super.attachView(view);
    this.listPresenter.attachView(view);
    this.actionPresenter.attachView(view);
    this.expensePresenter.attachView(view);
    this.payrollPresenter.attachView(view);
  }

  detachView(): void {
    super.detachView();
    this.listPresenter.detachView();
    this.actionPresenter.detachView();
    this.expensePresenter.detachView();
    this.payrollPresenter.detachView();
    if (this.subscription) {
      import('../../../shared/infrastructure/supabase').then(({ supabase }) => {
        if (this.subscription) {
          supabase.removeChannel(this.subscription);
          this.subscription = null;
        }
      });
    }
  }

  async subscribeToChanges(monthStr: string): Promise<void> {
    const { supabase } = await import('../../../shared/infrastructure/supabase');
    if (this.subscription) return;
    this.currentMonth = monthStr;
    this.subscription = supabase.channel('staff_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        this.loadStaff(this.currentMonth);
      })
      .subscribe();
  }

  // Delegation
  async loadStaff(monthStr: string): Promise<void> { 
    this.currentMonth = monthStr;
    await this.listPresenter.loadStaff(monthStr); 
  }
  
  async loadVehicles(): Promise<void> {
    await this.listPresenter.loadVehicles();
  }

  filterStaff(query: string): void { this.listPresenter.filterStaff(query); }

  async addStaff(data: AddStaffInput): Promise<void> { await this.actionPresenter.addStaff(data); }
  async updateStaff(data: UpdateStaffInput): Promise<void> { await this.actionPresenter.updateStaff(data); }
  async deleteStaff(id: string | number): Promise<void> { await this.actionPresenter.deleteStaff(id); }

  async addStaffExpense(id: string | number, data: AddStaffExpenseInput, role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền thêm chi phí tạm ứng nhân sự.');
    }
    await this.expensePresenter.addStaffExpense(id, data);
  }

  async toggleReimbursement(id: string | number, exId: string, role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền hoàn tiền tạm ứng nhân sự.');
    }
    await this.expensePresenter.toggleReimbursement(id, exId);
  }

  async deleteExpense(id: string | number, exId: string, role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền xóa chi phí tạm ứng nhân sự.');
    }
    await this.expensePresenter.deleteExpense(id, exId);
  }

  async updateExpense(id: string | number, exId: string, data: UpdateStaffExpenseInput, role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền chỉnh sửa chi phí tạm ứng nhân sự.');
    }
    await this.expensePresenter.updateExpense(id, exId, data);
  }

  async reimburseMultiple(id: string | number, ids: string[], role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền hoàn tiền hàng loạt.');
    }
    await this.expensePresenter.reimburseMultiple(id, ids);
  }

  async paySalary(req: PaymentRequest, role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền lập phiếu lương.');
    }
    await this.payrollPresenter.paySalary(req);
  }

  async cancelSalary(id: string | number, code: string, name: string, month: string, vIds: number[], cIds: number[], role?: string): Promise<void> { 
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền hủy phiếu lương.');
    }
    await this.payrollPresenter.cancelSalary(id, code, name, month, vIds, cIds); 
  }

  async toggleSalaryPayment(staff: StaffWithSalary, month: string, date?: string, role?: string): Promise<void> { 
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền chuyển đổi trạng thái thanh toán lương.');
    }
    await this.payrollPresenter.toggleSalaryPayment(staff, month, date); 
  }

  // Vehicle Integration (Direct delegation as it's a small bridging logic)
  async updateVehicle(id: number, data: Partial<Vehicle>, role?: string): Promise<void> {
    if (role && role !== 'ADMIN' && role !== 'ACCOUNTANT') {
      throw new Error('Bạn không có quyền chi thưởng/chi hoa hồng cho xe này.');
    }
    await this.perform(
      () => this.updateVehicleUseCase.execute({ id, data }),
      () => { if (this.view?.onStaffUpdated) this.view.onStaffUpdated(); },
      'Lỗi khi cập nhật xe'
    );
  }

  async recordExpense(command: UnifiedExpenseCommand): Promise<void> {
    if (!command.staffId) {
      throw new Error('Mã nhân viên là bắt buộc đối với chi phí nhân sự');
    }
    await this.addStaffExpense(command.staffId, {
      amount: command.amount,
      date: command.date,
      type: command.type,
      category: command.category,
      note: command.name,
      vehicleId: command.vehicleId ? Number(command.vehicleId) : undefined
    });
  }
}
