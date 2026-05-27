import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { UpdateVehicleStatus, UpdateStatusRequest } from '../application/UpdateVehicleStatus';
import { DeleteVehicle } from '../application/DeleteVehicle';
import { UpdateVehicle } from '../application/UpdateVehicle';
import { GetNextVehicleCode } from '../application/GetNextVehicleCode';
import { Vehicle } from '../../../shared/domain/types';
import { PermissionService } from '../../auth/domain/PermissionService';

export interface VehicleActionView extends BaseView {
  onStatusUpdated(): void;
  onVehicleUpdated(vehicle: Vehicle): void;
}

export class VehicleActionPresenter extends BasePresenter<VehicleActionView> {
  constructor(
    private readonly updateStatusUseCase: UpdateVehicleStatus,
    private readonly deleteVehicleUseCase: DeleteVehicle,
    private readonly updateVehicleUseCase: UpdateVehicle,
    private readonly getNextVehicleCodeUseCase: GetNextVehicleCode
  ) {
    super();
  }

  async updateVehicleStatus(req: UpdateStatusRequest, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền cập nhật trạng thái xe.');
    }
    await this.perform(
      () => this.updateStatusUseCase.execute(req), 
      () => this.view?.onStatusUpdated()
    );
  }

  async deleteVehicle(id: number, role?: string): Promise<void> {
    if (role && !PermissionService.canDeleteVehicle(role)) {
      throw new Error('Bạn không có quyền xóa xe.');
    }
    await this.perform(
      () => this.deleteVehicleUseCase.execute(id), 
      () => this.view?.onStatusUpdated()
    );
  }

  async updateVehicle(id: number, data: Partial<Vehicle>, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền cập nhật thông tin xe.');
    }
    await this.perform(
      () => this.updateVehicleUseCase.execute({ id, data }), 
      (res) => this.view?.onVehicleUpdated(res)
    );
  }

  async togglePin(id: number, isPinned: boolean): Promise<void> {
    await this.perform(
      () => this.updateVehicleUseCase.execute({ id, data: { is_pinned: isPinned } }), 
      (res) => this.view?.onVehicleUpdated(res)
    );
  }

  async getNextVehicleCode(): Promise<string> {
    try { return await this.getNextVehicleCodeUseCase.execute(); }
    catch { return ''; }
  }
}
