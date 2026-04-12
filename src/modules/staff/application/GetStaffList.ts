import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { StaffSalaryService, SalaryDetails } from '../domain/StaffSalaryService';
import { Vehicle } from '../../../shared/domain/types';
import { VehicleRepository } from '../../inventory/domain/VehicleRepository';

export interface StaffWithSalary extends Staff {
  salaryDetails: SalaryDetails;
}

export class GetStaffList {
  constructor(
    private readonly repository: StaffRepository,
    private readonly vehicleRepository: VehicleRepository
  ) {}

  /**
   * Truy xuất danh sách nhân sự và tính toán lương cho tháng cụ thể.
   */
  async execute(monthStr: string): Promise<StaffWithSalary[]> {
    const [staff, cars] = await Promise.all([
      this.repository.getAll(),
      this.vehicleRepository.getAll()
    ]);
    
    return staff.map(member => ({
      ...member,
      salaryDetails: StaffSalaryService.calculateMonthlySalary(member, cars, monthStr)
    }));
  }
}
