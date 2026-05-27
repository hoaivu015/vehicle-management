import { z } from 'zod';
import { zString, zNumber } from '@/src/shared/utils/zod';

export const AddStaffSchema = z.object({
  name: zString,
  role: z.enum(['ADMIN', 'SALE', 'ACCOUNTANT', 'MANAGER', 'STAFF', 'DIRECTOR', 'PARTNER']),
  email: z.string().email('Email không hợp lệ').or(z.literal('')).optional(),
  phone: zString.optional(),
  department: zString.default('Kinh doanh'),
  base_salary: zNumber.default(0),
  commission_per_car: zNumber.default(0),
  target: zNumber.default(0),
  password: zString.optional(),
  code: zString.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const UpdateStaffSchema = AddStaffSchema.partial().extend({
  id: z.union([z.string(), z.number()]),
});

export const AddStaffExpenseSchema = z.object({
  amount: z.coerce.number().min(1000, 'Số tiền phải lớn hơn 1,000đ'),
  note: z.string().min(3, 'Ghi chú phải có ít nhất 3 ký tự'),
  date: zString,
  type: z.enum(['vehicle', 'operating']),
  vehicleId: z.union([z.string(), z.number()]).optional(),
  vehicle_code: zString.optional(),
  category: zString,
});

export const UpdateStaffExpenseSchema = AddStaffExpenseSchema.partial().extend({
  id: zString,
});

export type AddStaffInput = z.infer<typeof AddStaffSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;
export type AddStaffExpenseInput = z.infer<typeof AddStaffExpenseSchema>;
export type UpdateStaffExpenseInput = z.infer<typeof UpdateStaffExpenseSchema>;
