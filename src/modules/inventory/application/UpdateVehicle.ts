import { Vehicle } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';

export interface UpdateVehicleRequest {
  id: number;
  data: Partial<Vehicle>;
}

export class UpdateVehicle {
  constructor(private readonly repository: VehicleRepository) {}

  async execute(request: UpdateVehicleRequest): Promise<Vehicle> {
    return await this.repository.update(request.id.toString(), request.data);
  }
}
