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
   * Chuyển đổi StaffDTO sang Domain Staff Model an toàn tuyệt đối (Zero Any).
   */
  toStaff(): Staff {
    return {
      id: typeof this.data.id === 'string' ? Number(this.data.id) : this.data.id,
      code: this.data.code,
      name: this.data.name,
      role: this.data.role,
      email: this.data.email,
      phone: this.data.phone,
      status: this.data.status,
      department: this.data.department,
      base_salary: this.data.base_salary,
      commission_per_car: this.data.commission_per_car,
      target: this.data.target,
      expenses: this.data.expenses ? this.data.expenses.map(e => ({
        id: String(e.id),
        amount: e.amount,
        note: e.note,
        date: e.date,
        type: e.type,
        vehicleId: e.vehicleId ? Number(e.vehicleId) : undefined,
        vehicle_code: e.vehicle_code,
        category: e.category,
        is_reimbursed: !!e.is_reimbursed,
      })) : null,
      paid_months: this.data.paid_months ? [...this.data.paid_months] : null,
      password_hash: this.data.password_hash,
      auth_id: this.data.auth_id,
      created_at: this.data.created_at,
      updated_at: this.data.updated_at,
    };
  }

  /**
   * Tính toán chi tiết lương cho nhân viên trong một tháng cụ thể.
   * Kết quả trả về là một SalaryDetails object với Type-safety hoàn chỉnh.
   */
  calculateSalary(cars: Vehicle[], monthStr: string): SalaryDetails {
    return StaffSalaryService.calculateMonthlySalary(this.toStaff(), cars, monthStr);
  }

  /**
   * Trả về dữ liệu nguyên bản đã được xác thực.
   */
  toRaw(): StaffDTO {
    return { ...this.data };
  }
}
