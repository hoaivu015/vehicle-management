import { Staff } from '../../../shared/domain/types';
import { StaffRepository } from '../domain/StaffRepository';
import { StaffSalaryService, SalaryDetails } from '../domain/StaffSalaryService';
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
    
    return staff.map(member => {
      // Auto-sync missing vehicle_codes for display
      const fixedExpenses = (member.expenses || []).map(exp => {
        if (exp.type === 'vehicle' && !exp.vehicle_code && exp.vehicleId) {
          const car = cars.find(c => c.id === exp.vehicleId);
          if (car) return { ...exp, vehicle_code: car.code };
        }
        return exp;
      });

      return {
        ...member,
        expenses: fixedExpenses,
        salaryDetails: StaffSalaryService.calculateMonthlySalary({ ...member, expenses: fixedExpenses }, cars, monthStr)
      };
    });
  }
}
