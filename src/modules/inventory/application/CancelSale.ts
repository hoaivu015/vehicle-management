import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleHistoryEntry } from '../../../shared/domain/types';

export interface CancelSaleRequest {
  vehicleId: number;
  userCode: string;
}

export class CancelSale {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(request: CancelSaleRequest): Promise<void> {
    const historyEntry: VehicleHistoryEntry = {
      date: new Date().toISOString().split('T')[0],
      status: VehicleStatus.IN_STOCK,
      user: request.userCode,
      note: 'Hủy giao dịch đặt cọc - Quay về trạng thái Trong kho'
    };

    await this.repository.cancelSale(request.vehicleId, historyEntry);
  }
}
