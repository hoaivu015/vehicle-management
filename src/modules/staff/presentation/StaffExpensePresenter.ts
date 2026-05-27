import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { RecordExpense } from '../../finance/application/RecordExpense';
import { ToggleStaffExpenseReimbursement } from '../application/ToggleStaffExpenseReimbursement';
import { DeleteStaffExpense } from '../application/DeleteStaffExpense';
import { UpdateStaffExpense } from '../application/UpdateStaffExpense';
import { ReimburseStaffExpenses } from '../application/ReimburseStaffExpenses';
import { AddStaffExpenseInput, UpdateStaffExpenseInput } from '../domain/StaffValidation';

export interface StaffExpenseView extends BaseView {
  onStaffUpdated(): void;
  onExpenseAdded?(): void;
}

export class StaffExpensePresenter extends BasePresenter<StaffExpenseView> {
  constructor(
    private readonly recordExpenseUseCase: RecordExpense,
    private readonly toggleReimbursementUseCase: ToggleStaffExpenseReimbursement,
    private readonly deleteStaffExpenseUseCase: DeleteStaffExpense,
    private readonly updateStaffExpenseUseCase: UpdateStaffExpense,
    private readonly reimburseExpensesUseCase: ReimburseStaffExpenses
  ) {
    super();
  }

  async addStaffExpense(staffId: string | number, expenseData: AddStaffExpenseInput): Promise<void> {
    await this.perform(
      () => this.recordExpenseUseCase.execute({ 
        staffId,
        name: expenseData.note, // Translation: note -> name
        amount: expenseData.amount,
        date: expenseData.date,
        type: expenseData.type,
        vehicleId: expenseData.vehicleId,
        category: expenseData.category,
        note: expenseData.note
      }),
      () => {
        if (this.view?.onExpenseAdded) this.view.onExpenseAdded();
        else this.view?.onStaffUpdated();
      },
      'Lỗi khi thêm chi phí'
    );
  }

  async toggleReimbursement(staffId: string | number, expenseId: string): Promise<void> {
    await this.perform(
      () => this.toggleReimbursementUseCase.execute(staffId, expenseId),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi cập nhật trạng thái'
    );
  }

  async deleteExpense(staffId: string | number, expenseId: string): Promise<void> {
    await this.perform(
      () => this.deleteStaffExpenseUseCase.execute(staffId, expenseId),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi xóa khoản chi'
    );
  }

  async updateExpense(staffId: string | number, expenseId: string, data: UpdateStaffExpenseInput): Promise<void> {
    await this.perform(
      () => this.updateStaffExpenseUseCase.execute(staffId, expenseId, data),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi cập nhật khoản chi'
    );
  }

  async reimburseMultiple(staffId: string | number, expenseIds: string[]): Promise<void> {
    await this.perform(
      () => this.reimburseExpensesUseCase.execute(staffId, expenseIds),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi thực hiện thanh toán hàng loạt'
    );
  }
}
