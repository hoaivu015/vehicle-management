import { Vehicle } from '../../../shared/domain/types';
import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleStaffRepository } from '../domain/VehicleStaffRepository';
import { EntityNotFoundError } from '../../../shared/domain/errors';

/**
 * Application Service for Vehicle Management.
 * Coordinates between Repository and other domain/infrastructure components.
 * This prevents business logic leakage into the infrastructure layer.
 */
export class VehicleService {
  constructor(
    private vehicleRepo: VehicleRepository,
    private staffManager: VehicleStaffRepository
  ) {}

  /**
   * Updates a vehicle and ensures related staff metadata is synced.
   */
  async updateVehicle(id: string | number, data: Partial<Vehicle>): Promise<Vehicle> {
    const current = await this.vehicleRepo.getById(id);
    if (!current) throw new EntityNotFoundError('Vehicle', id);

    const updates: Partial<Vehicle> = { ...data };

    // Move staff name fetching logic from repository to service
    if (data.buyer && data.buyer !== current.buyer) {
      (updates as any).buyer_name = await this.staffManager.getStaffName(data.buyer);
    }
    if (data.seller && data.seller !== current.seller) {
      (updates as any).seller_name = await this.staffManager.getStaffName(data.seller);
    }

    const updated = await this.vehicleRepo.update(id, updates);

    // Coordinate staff assignment
    if (data.seller && data.seller !== current.seller) {
      await this.staffManager.assignVehicleToStaff(data.seller, updated.code);
    }

    return updated;
  }

  /**
   * Deletes a vehicle and cleans up staff tracking.
   */
  async deleteVehicle(id: string): Promise<void> {
    const car = await this.vehicleRepo.getById(id);
    if (car) {
      await this.staffManager.removeFromStaffTracking(car.code);
    }
    await this.vehicleRepo.delete(id);
  }
}
