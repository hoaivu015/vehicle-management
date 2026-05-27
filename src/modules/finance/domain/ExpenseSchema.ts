import { z } from 'zod';
import { zId, zString, zNumber } from '../../../shared/utils/zod';

/**
 * UnifiedExpenseSchema - Nguồn sự thật duy nhất cho mọi giao dịch chi phí.
 * Áp dụng Luật 6: Zod Boundary.
 */
export const UnifiedExpenseSchema = z.object({
  id: zId.optional(),
  name: z.string().min(1, "Nội dung chi không được để trống"),
  amount: zNumber,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ (YYYY-MM-DD)"),
  category: z.string().default("Vận hành"),
  note: z.string().optional(),
  
  // Linkages
  type: z.enum(['vehicle', 'operating']),
  staffId: z.union([z.string(), z.number()]).optional(),
  vehicleId: z.union([z.string(), z.number()]).optional(),
}).passthrough().transform((data: any) => {
  // Backward compatibility: Map snake_case from DB to camelCase
  if (data.vehicle_id && !data.vehicleId) data.vehicleId = data.vehicle_id;
  if (data.staff_id && !data.staffId) data.staffId = data.staff_id;
  return data;
}).refine(data => {
  if (data.type === 'vehicle' && !data.vehicleId) return false;
  return true;
}, {
  message: "Vui lòng chọn xe cho chi phí này",
  path: ["vehicleId"]
});

export type UnifiedExpenseDTO = z.infer<typeof UnifiedExpenseSchema>;

// Giữ lại ExpenseSchema cũ để đảm bảo tương thích ngược (Backward Compatibility)
export const ExpenseSchema = z.object({
  id: zId.optional(),
  name: zString,
  amount: zNumber,
  category: zString,
  date: zString,
});

export type ExpenseDTO = z.infer<typeof ExpenseSchema>;
