export interface VehicleStaffRepository {
  assignVehicleToStaff(staffCode: string, vehicleCode: string): Promise<void>;
  removeFromStaffTracking(vehicleCode: string): Promise<void>;
  getStaffName(staffCode: string): Promise<string>;
}
