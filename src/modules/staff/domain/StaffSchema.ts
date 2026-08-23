import { z } from 'zod';
import { zNumericId, zString, zNumber, zArray } from '@/src/shared/utils/zod';

export const StaffExpenseSchema = z.object({
  id: zString,
  amount: zNumber,
  note: zString,
  date: zString,
  type: z.enum(['vehicle', 'operating', 'advance']).or(z.string()),
  vehicleId: z.union([z.string(), z.number()]).transform(v => v ? Number(v) : undefined).optional().nullable(),
  vehicle_code: zString.optional(),
  category: zString.optional(),
  is_reimbursed: z.boolean().default(false),
});

export const StaffSchema = z.object({
  id: zNumericId, 
  code: zString,
  name: zString,
  role: zString,
  base_salary: zNumber,
  target: zNumber,
  commission_per_car: zNumber,
  email: zString,
  phone: zString.optional(),
  password_hash: zString.optional().nullable(),
  auth_id: zString.optional().nullable(),
  status: zString,
  department: zString,
  expenses: zArray(StaffExpenseSchema).nullable(),
  paid_months: zArray(z.string()).nullable(),
  created_at: zString.optional(),
  updated_at: zString.optional(),
});

export type StaffDTO = z.infer<typeof StaffSchema>;
export type StaffExpenseDTO = z.infer<typeof StaffExpenseSchema>;
