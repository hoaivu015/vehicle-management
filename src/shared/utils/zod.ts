import { z } from 'zod';

/**
 * Zod Utilities for Resilient Data Validation
 * Project: Auto-28
 * Goal: Fundamental elimination of type mismatch errors (string vs number, null vs undefined)
 */

// 1. Chấp nhận ID từ DB (BigInt, Serial) và luôn chuẩn hóa về String cho Domain
export const zId = z.union([z.string(), z.number()]).transform(v => String(v));

// 2. Chấp nhận ID từ DB và luôn chuẩn hóa về Number (dùng cho Vehicle ID)
export const zNumericId = z.union([z.string(), z.number()]).transform(v => Number(v));

// 3. Chuỗi an toàn: Chấp nhận cả string/number và chuyển null/undefined thành chuỗi rỗng
export const zString = z.union([z.string(), z.number()]).nullish().transform(v => v !== null && v !== undefined ? String(v) : '');

// 4. Số an toàn: Chấp nhận cả string/number và chuyển null/undefined thành 0
export const zNumber = z.coerce.number().nullish().transform(v => v ?? 0);

// 5. Boolean an toàn: Chấp nhận cả string/number/boolean và chuyển null/undefined thành false
export const zBoolean = z.coerce.boolean().nullish().transform(v => v ?? false);

// 6. Mảng an toàn: Đảm bảo luôn trả về mảng, kể cả khi dữ liệu là null
export const zArray = <T extends z.ZodTypeAny>(schema: T) => 
  z.array(schema).nullish().transform(v => v ?? []);
