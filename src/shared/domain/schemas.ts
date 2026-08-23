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
  name: z.string().min(1, "Nội dung giao dịch không được để trống"),
  amount: z.number().min(1000, "Số tiền tối thiểu là 1,000đ"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  type: z.enum(['vehicle', 'operating', 'advance']).or(z.string()),
  category: z.string().default("Vận hành"),
  flowType: z.enum(['outflow', 'inflow']).default('outflow'),
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
  type: 'vehicle' | 'operating' | 'advance' | string;
  category: string;
  flowType?: 'outflow' | 'inflow';
  staffId?: string | number;
  vehicleId?: string | number;
  note?: string;
}

/**
 * Transaction Enums & Schemas cho Sổ Cái Giao Dịch Hợp Nhất (Unified Ledger)
 */
export const TransactionFlowEnum = z.enum(['inflow', 'outflow']);
export type TransactionFlow = z.infer<typeof TransactionFlowEnum>;

export const TransactionScopeEnum = z.enum([
  'sale',
  'purchase',
  'car_cost',
  'operating',
  'salary',
  'partner',
  'other_income',
  'deposit_refund',
  'coinvest'
]);
export type TransactionScope = z.infer<typeof TransactionScopeEnum>;

export const FinancialTransactionSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)"),
  amount: z.number().nonnegative("Số tiền giao dịch không được âm"),
  type: TransactionFlowEnum,
  scope: TransactionScopeEnum,
  category: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  vehicleId: z.union([z.string(), z.number()]).optional(),
  vehicleCode: z.string().optional(),
  staffId: z.string().optional(),
  rawExpenseId: z.union([z.string(), z.number()]).optional(),
  sourceRef: z.string().optional(),
  editable: z.boolean().optional()
});

export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>;

