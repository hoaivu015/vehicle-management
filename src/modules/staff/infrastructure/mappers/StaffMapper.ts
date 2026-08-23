import { Staff } from '@/src/shared/domain/types';
import { StaffDTO } from '../../domain/StaffSchema';

export const staffMapper = {
  toDomain(dto: StaffDTO): Staff {
    return {
      id: typeof dto.id === 'string' ? Number(dto.id) : dto.id,
      code: dto.code,
      name: dto.name,
      role: dto.role,
      email: dto.email,
      phone: dto.phone || undefined,
      status: dto.status,
      department: dto.department,
      base_salary: dto.base_salary,
      commission_per_car: dto.commission_per_car,
      target: dto.target,
      expenses: dto.expenses ? dto.expenses.map(e => ({
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
      paid_months: dto.paid_months ? [...dto.paid_months] : null,
      password_hash: dto.password_hash ?? null,
      auth_id: dto.auth_id ?? null,
      created_at: dto.created_at,
      updated_at: dto.updated_at,
    };
  },

  toDTO(domain: Partial<Staff>): Partial<StaffDTO> {
    return {
      ...domain,
      id: domain.id !== undefined ? Number(domain.id) : undefined,
      expenses: domain.expenses ? domain.expenses.map(e => ({
        id: String(e.id),
        amount: e.amount,
        note: e.note,
        date: e.date,
        type: e.type || 'operating',
        vehicleId: e.vehicleId ? Number(e.vehicleId) : undefined,
        vehicle_code: e.vehicle_code || '',
        category: e.category || '',
        is_reimbursed: !!e.is_reimbursed,
      })) : null,
      paid_months: domain.paid_months ? [...domain.paid_months] : null,
    };
  }
};
