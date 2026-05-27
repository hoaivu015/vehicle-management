import { z } from 'zod';
import { zNumericId, zString, zNumber, zArray } from '@/src/shared/utils/zod';

export const StaffExpenseSchema = z.object({
  id: zString,
  amount: zNumber,
  note: zString,
  date: zString,
  type: z.enum(['vehicle', 'operating']),
  vehicleId: z.union([z.string(), z.number()]).transform(v => v ? Number(v) : v).optional().nullable(),
  vehicle_code: zString,
  category: zString,
  is_reimbursed: z.boolean().default(false),
}).passthrough().transform((data: any) => {
  // Backward compatibility: If vehicle_id exists but vehicleId doesn't, map it
  if (data.vehicle_id && !data.vehicleId) {
    data.vehicleId = Number(data.vehicle_id);
  }
  return data;
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
  status: zString,
  department: zString,
  expenses: zArray(StaffExpenseSchema).nullable(),
  paid_months: zArray(z.string()).nullable(),
  created_at: zString.optional(),
  updated_at: zString.optional(),
});

export type StaffDTO = z.infer<typeof StaffSchema>;
export type StaffExpenseDTO = z.infer<typeof StaffExpenseSchema>;
