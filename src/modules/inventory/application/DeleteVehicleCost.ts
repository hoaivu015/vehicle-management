import { Vehicle } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { StaffRepository } from '../../staff/domain/StaffRepository';

export interface DeleteVehicleCostRequest {
  vehicleId: number;
  costIndex: number;
  user?: string;
  reason?: string;
}

export class DeleteVehicleCost {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly staffRepository: StaffRepository
  ) {}

  async execute(request: DeleteVehicleCostRequest): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.getById(request.vehicleId.toString());
    if (!vehicle) throw new Error('Vehicle not found');

    const costHistory = vehicle.cost_history || [];
    const costToRemove = costHistory[request.costIndex];

    if (!costToRemove) throw new Error('Cost entry not found');

    // 1. If it was a staff advance, remove from staff record
    if (costToRemove.staff_expense_id && costToRemove.staff_id) {
      const staffMember = await this.staffRepository.getById(costToRemove.staff_id);
      if (staffMember) {
        const updatedStaffExpenses = (staffMember.expenses || []).filter(
          exp => exp.id !== costToRemove.staff_expense_id
        );
        await this.staffRepository.update(staffMember.id, {
          expenses: updatedStaffExpenses
        });
      }
    }

    // 2. Remove from vehicle and append an immutable Audit Log into history
    const updatedCostHistory = costHistory.filter((_, i) => i !== request.costIndex);
    const updatedHistoryLogs = [
      ...(vehicle.history || []),
      {
        date: new Date().toISOString().split('T')[0],
        status: vehicle.status,
        user: request.user || 'Kế toán',
        note: `Đã xóa chi phí: "${costToRemove.note || 'Chi phí'}" (${(costToRemove.amount || 0).toLocaleString('vi-VN')}đ)${request.reason ? ` - Lý do: ${request.reason}` : ''}`
      }
    ];

    return await this.vehicleRepository.update(vehicle.id.toString(), {
      cost_history: updatedCostHistory,
      history: updatedHistoryLogs
    });
  }
}
