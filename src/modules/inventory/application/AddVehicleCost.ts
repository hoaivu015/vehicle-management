import { Vehicle, CostItem } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';

export interface AddVehicleCostRequest {
  vehicleId: number;
  costName: string;
  amount: number;
  date?: string;
}

export class AddVehicleCost {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(request: AddVehicleCostRequest): Promise<Vehicle> {
    const vehicle = await this.repository.getById(request.vehicleId.toString());
    if (!vehicle) throw new Error('Vehicle not found');

    const newCost: CostItem = {
      date: request.date || new Date().toISOString().split('T')[0],
      note: request.costName,
      amount: request.amount
    };

    if (newCost.amount <= 0) throw new Error('Số tiền chi phí phải lớn hơn 0');

    const updatedHistory = [...(vehicle.cost_history || []), newCost];

    return await this.repository.update(request.vehicleId.toString(), {
      cost_history: updatedHistory
    });
  }
}
