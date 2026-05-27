import { VehicleStatus } from '../../../shared/domain/constants';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStateMachine } from '../domain/VehicleStateMachine';
import { VehicleEntity } from '../domain/VehicleEntity';

export interface UpdateStatusRequest {
  id: number;
  nextStatus: VehicleStatus;
  user: string;
  note?: string;
  updates?: Partial<import('../../../shared/domain/types').Vehicle>;
  extra?: Record<string, any>;
}

export class UpdateVehicleStatus {
  constructor(private readonly repository: VehicleRepository) {}

  /**
   * Cập nhật trạng thái xe và ghi lại lịch sử.
   */
  async execute(request: UpdateStatusRequest): Promise<void> {
    const carData = await this.repository.getById(request.id.toString());
    if (!carData) throw new Error('Không tìm thấy xe');

    const vehicle = new VehicleEntity(carData);
    
    // Kiểm tra tính hợp lệ của bước chuyển trạng thái
    if (!VehicleStateMachine.canTransition(vehicle.status, request.nextStatus)) {
      throw new Error(`Chuyển đổi trạng thái từ ${vehicle.status} sang ${request.nextStatus} không hợp lệ.`);
    }

    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      status: request.nextStatus,
      user: request.user,
      note: request.note || `Chuyển sang ${request.nextStatus}`,
      ...request.extra
    };

    // Thực hiện cập nhật thông qua Repository
    await this.repository.updateStatus(request.id, request.nextStatus, historyEntry, request.updates);
  }
}
