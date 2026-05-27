import { BasePresenter, BaseView } from '../../../shared/presentation/BasePresenter';
import { RecordExpense } from '../../finance/application/RecordExpense';
import { AddPurchasePayment } from '../application/AddPurchasePayment';
import { AddSalePayment } from '../application/AddSalePayment';
import { CancelSale } from '../application/CancelSale';
import { DeleteVehicleCost } from '../application/DeleteVehicleCost';
import { Vehicle } from '../../../shared/domain/types';
import { VehicleStatus } from '../../../shared/domain/constants';
import { PermissionService } from '../../auth/domain/PermissionService';

export interface VehicleTransactionView extends BaseView {
  onStatusUpdated(): void;
  onVehicleUpdated(vehicle: Vehicle): void;
}

export class VehicleTransactionPresenter extends BasePresenter<VehicleTransactionView> {
  constructor(
    private readonly recordExpenseUseCase: RecordExpense,
    private readonly addPurchasePaymentUseCase: AddPurchasePayment,
    private readonly addSalePaymentUseCase: AddSalePayment,
    private readonly cancelSaleUseCase: CancelSale,
    private readonly deleteVehicleCostUseCase: DeleteVehicleCost
  ) {
    super();
  }

  async addVehicleCost(vehicleId: number, costName: string, amount: number, staffId?: string | number, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền ghi nhận chi phí cho xe này.');
    }
    await this.perform(
      () => this.recordExpenseUseCase.execute({ 
        vehicleId, 
        name: costName, 
        amount, 
        type: 'vehicle',
        category: 'Vận hành',
        date: new Date().toISOString().split('T')[0],
        staffId 
      }), 
      () => this.view?.onStatusUpdated()
    );
  }

  async deleteVehicleCost(vehicleId: number, costIndex: number, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền xóa chi phí của xe này.');
    }
    await this.perform(
      () => this.deleteVehicleCostUseCase.execute({ vehicleId, costIndex }), 
      (res) => this.view?.onVehicleUpdated(res)
    );
  }

  async addPurchasePayment(id: number, amount: number, note: string, receiver: string, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền xác nhận chi tiền nhập xe.');
    }
    await this.perform(
      () => this.addPurchasePaymentUseCase.execute({ vehicleId: id, amount, note, receiver }), 
      () => this.view?.onStatusUpdated()
    );
  }

  async addSalePayment(id: number, amount: number, note: string, receiver: string, nextStatus: VehicleStatus, seller: string, buyerName?: string, salePrice?: number, commission?: number, buyingBonus?: number, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền xác nhận thu tiền giao dịch xe.');
    }
    await this.perform(
      () => this.addSalePaymentUseCase.execute({ vehicleId: id, amount, note, receiver, nextStatus, seller, buyerName, salePrice, commission, buyingBonus }), 
      () => this.view?.onStatusUpdated()
    );
  }

  async cancelSale(id: number, userCode: string, role?: string): Promise<void> {
    if (role && !PermissionService.canManageVehicle(role)) {
      throw new Error('Bạn không có quyền hủy giao dịch bán xe.');
    }
    await this.perform(
      () => this.cancelSaleUseCase.execute({ vehicleId: id, userCode }), 
      () => this.view?.onStatusUpdated()
    );
  }
}
