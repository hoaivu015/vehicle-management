import { z } from 'zod';

/**
 * ExpenseSchema - Schema chung cho chi phí.
 * Áp dụng Luật L6 (Zod Boundary) để đảm bảo dữ liệu đầu vào luôn sạch.
 */
export const ExpenseSchema = z.object({
  name: z.string().min(1, "Tên chi phí không được để trống"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)"),
  category: z.string().optional().default("Vận hành"),
  note: z.string().optional()
});

export type ExpenseDTO = z.infer<typeof ExpenseSchema>;

/**
 * StaffExpenseSchema - Schema cho chi phí nhân sự thực hiện.
 */
export const StaffExpenseSchema = ExpenseSchema.extend({
  type: z.enum(['vehicle', 'operating']),
  vehicleId: z.number().optional(),
  staffId: z.number().optional()
}).refine(data => {
  if (data.type === 'vehicle' && !data.vehicleId) return false;
  return true;
}, {
  message: "Vui lòng chọn xe cho chi phí này",
  path: ["vehicleId"]
});

export type StaffExpenseDTO = z.infer<typeof StaffExpenseSchema>;

/**
 * UnifiedExpenseCommand - Hợp đồng dữ liệu bắt buộc cho mọi giao dịch chi phí.
 * Được dùng làm Input cho RecordExpense UseCase.
 */
export const UnifiedExpenseCommandSchema = z.object({
  name: z.string().min(1, "Nội dung chi không được để trống"),
  amount: z.number().min(1000, "Số tiền tối thiểu là 1,000đ"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  type: z.enum(['vehicle', 'operating']),
  category: z.string().default("Vận hành"),
  staffId: z.union([z.string(), z.number()]).optional(),
  vehicleId: z.union([z.string(), z.number()]).optional(),
  note: z.string().optional()
}).refine(data => {
  if (data.type === 'vehicle' && !data.vehicleId) return false;
  return true;
}, {
  message: "Vui lòng chọn xe cho chi phí này",
  path: ["vehicleId"]
});

export interface UnifiedExpenseCommand {
  name: string;
  amount: number;
  date: string;
  type: 'vehicle' | 'operating';
  category: string;
  staffId?: string | number;
  vehicleId?: string | number;
  note?: string;
}
