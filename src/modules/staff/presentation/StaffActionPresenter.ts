import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { AddStaff } from '../application/AddStaff';
import { UpdateStaff } from '../application/UpdateStaff';
import { DeleteStaff } from '../application/DeleteStaff';
import { AddStaffInput, UpdateStaffInput } from '../domain/StaffValidation';

export interface StaffActionView extends BaseView {
  onStaffAdded(): void;
  onStaffUpdated(): void;
  onStaffDeleted(): void;
}

export class StaffActionPresenter extends BasePresenter<StaffActionView> {
  constructor(
    private readonly addStaffUseCase: AddStaff,
    private readonly updateStaffUseCase: UpdateStaff,
    private readonly deleteStaffUseCase: DeleteStaff
  ) {
    super();
  }

  async addStaff(staffData: AddStaffInput): Promise<void> {
    await this.perform(
      () => this.addStaffUseCase.execute(staffData),
      () => {
        this.view?.onStaffAdded();
        this.view?.onStaffUpdated(); // Trigger refresh
      },
      'Lỗi khi thêm nhân viên'
    );
  }

  async updateStaff(staffData: UpdateStaffInput): Promise<void> {
    await this.perform(
      () => this.updateStaffUseCase.execute(staffData),
      () => this.view?.onStaffUpdated(),
      'Lỗi khi cập nhật nhân viên'
    );
  }

  async deleteStaff(id: string | number): Promise<void> {
    await this.perform(
      () => this.deleteStaffUseCase.execute(id),
      () => this.view?.onStaffDeleted(),
      'Lỗi khi xóa nhân viên'
    );
  }
}
