import { VehicleRepository } from '../domain/VehicleRepository';
import { VehicleEntity } from '../domain/VehicleEntity';
import { Vehicle } from '../../../shared/domain/types';

export class GetInventoryList {
  constructor(private readonly repository: VehicleRepository) {}

  /**
   * Lấy danh sách xe đang bán (Available)
   */
  async getAvailable(): Promise<Vehicle[]> {
    const rawCars = await this.repository.getAvailableVehicles();
    return rawCars.map(car => new VehicleEntity(car).toRaw());
  }

  /**
   * Lấy danh sách xe đã bán trong tháng (Sold)
   */
  async getSold(monthStr: string): Promise<Vehicle[]> {
    const rawCars = await this.repository.getSoldVehiclesByMonth(monthStr);
    return rawCars.map(car => new VehicleEntity(car).toRaw());
  }

  async getPersonal(staffCode: string): Promise<Vehicle[]> {
    const rawCars = await this.repository.getVehiclesByStaff(staffCode);
    return rawCars.map(car => new VehicleEntity(car).toRaw());
  }

  async getDepartment(codes: string[]): Promise<Vehicle[]> {
    const rawCars = await this.repository.getVehiclesByCodes(codes);
    return rawCars.map(car => new VehicleEntity(car).toRaw());
  }
}
