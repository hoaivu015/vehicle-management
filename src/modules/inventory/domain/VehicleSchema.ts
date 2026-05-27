import { z } from 'zod';
import { VehicleStatus } from '../../../shared/domain/constants';
import { zNumericId, zString, zNumber, zBoolean, zArray } from '@/src/shared/utils/zod';


export const CostItemSchema = z.object({
  amount: zNumber,
  note: zString,
  date: zString,
  staff_id: zString,
  staff_expense_id: zString,
});

export const PaymentItemSchema = CostItemSchema.extend({
  receiver: zString,
});

export const VehicleHistoryEntrySchema = z.object({
  date: zString,
  status: z.nativeEnum(VehicleStatus),
  user: zString,
  note: zString,
});

export const VehicleSchema = z.object({
  id: zNumericId,
  code: zString,
  created_at: z.string().optional(),
  name: zString,
  year: z.union([z.string(), z.number(), z.null()]).transform(v => v?.toString() || '').default(''),
  status: z.nativeEnum(VehicleStatus),
  purchase_price: zNumber,
  purchase_date: zString,
  buyer: zString, 
  buyer_name: zString,
  customer_name: zString,
  
  sale_price: zNumber,
  sale_date: zString,
  seller: zString,
  seller_name: zString,
  commission: zNumber,
  buying_commission: zNumber,
  buying_bonus: zNumber,
  buying_bonus_paid: zBoolean,
  
  total_cost: zNumber,
  cost_history: zArray(CostItemSchema),
  
  is_coinvested: zBoolean,
  coinvestor_code: zString,
  coinvest_amount: zNumber,
  
  image_url: zString,
  images: zArray(z.string()),
  notes: zString,
  battery_type: zString.default('None'),
  show_on_landing: zBoolean.default(true),
  
  purchase_paid_amount: zNumber,
  purchase_payment_history: zArray(PaymentItemSchema),
  
  received_amount: zNumber,
  sale_payment_history: zArray(PaymentItemSchema),
  
  history: zArray(VehicleHistoryEntrySchema),
  
  odo: zNumber,
  color: zString,
  
  profit: zNumber,
  days: zNumber,
  is_pinned: zBoolean,
  
  partner_capital_repaid: zBoolean,
  partner_profit_shared: zBoolean,
  
  // Note: These fields are handled by zString/zNumber which convert null -> default
  // ensuring the output is compatible with the Domain Entity
});

export type VehicleDTO = z.infer<typeof VehicleSchema>;

export const UpdateVehicleSchema = VehicleSchema.partial().omit({ id: true, code: true });
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;

export const CreateVehicleSchema = z.object({
  name: zString,
  year: z.union([z.string(), z.number()]).transform(v => v.toString()),
  odo: zNumber.default(0),
  color: zString.default(''),
  purchase_price: zNumber,
  purchase_date: zString,
  buyer: zString,
  image_url: zString.default(''),
  is_coinvested: zBoolean.default(false),
  coinvestor_code: zString.default(''),
  coinvest_amount: zNumber.default(0),
  notes: zString.default(''),
  buying_commission: zNumber.default(3000000),
  battery_type: zString.default('None'),
  show_on_landing: zBoolean.default(true),
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

/**
 * VehicleRowSchema
 * 
 * Đại diện cho cấu trúc thực tế của một dòng (row) trong bảng 'vehicles'.
 * Loại bỏ các thuộc tính tính toán hoặc các trường ảo chỉ phục vụ UI.
 */
export const VehicleRowSchema = VehicleSchema.omit({
  buyer_name: true,
  seller_name: true,
  customer_name: true,
  images: true,
}).extend({
  // Đảm bảo các trường date rỗng được gửi dưới dạng null thay vì "" để Postgres không báo lỗi
  purchase_date: z.string().nullish().transform(v => v || null),
  sale_date: z.string().nullish().transform(v => v || null),
  created_at: z.string().nullish().transform(v => v || null),
  // Đảm bảo các trường Foreign Key rỗng được gửi dưới dạng null thay vì ""
  buyer: z.string().nullish().transform(v => v || null),
  seller: z.string().nullish().transform(v => v || null),
  // Đảm bảo trường year rỗng được gửi dưới dạng null hoặc số nguyên thay vì "" để không lỗi Postgres
  year: z.union([z.string(), z.number(), z.null()]).nullish().transform(v => {
    if (v === null || v === undefined || v === '') return null;
    const parsed = parseInt(v.toString(), 10);
    return isNaN(parsed) ? null : parsed;
  }),
});

export type VehicleRow = z.infer<typeof VehicleRowSchema>;
