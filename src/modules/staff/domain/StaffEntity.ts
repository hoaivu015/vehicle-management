import { StaffDTO, StaffSchema } from './StaffSchema';
import { SalaryDetails, StaffSalaryService } from './StaffSalaryService';
import { Vehicle, Staff } from '../../../shared/domain/types';

export class StaffEntity {
  private readonly data: StaffDTO;

  constructor(rawData: unknown) {
    this.data = StaffSchema.parse(rawData);
  }

  get id(): string { return String(this.data.id); }
  get code(): string { return this.data.code; }
  get name(): string { return this.data.name; }
  get role(): string { return this.data.role; }
  get baseSalary(): number { return this.data.base_salary; }
  get target(): number { return this.data.target; }
  get commissionPerCar(): number { return this.data.commission_per_car; }

  /**
   * Tính toán chi tiết lương cho nhân viên trong một tháng cụ thể.
   * Kết quả trả về là một SalaryDetails object với Type-safety hoàn chỉnh.
   */
  calculateSalary(cars: Vehicle[], monthStr: string): SalaryDetails {
    // Chúng ta map sang Staff interface để tương thích với Service
    return StaffSalaryService.calculateMonthlySalary(this.data as unknown as Staff, cars, monthStr);
  }

  /**
   * Trả về dữ liệu nguyên bản đã được xác thực.
   */
  toRaw(): StaffDTO {
    return { ...this.data };
  }
}
