import { z } from 'zod';

/**
 * Schema xác thực form đăng nhập tiêu chuẩn (Smart Identifier)
 */
export const LoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã nhân viên hoặc email công ty'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
  rememberMe: z
    .boolean()
    .default(false),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

/**
 * Schema xác thực mã PIN 4 số
 */
export const PinSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{4}$/, 'Mã PIN phải bao gồm đúng 4 chữ số'),
});

export type PinFormValues = z.infer<typeof PinSchema>;

/**
 * Trạng thái phiên lưu trữ cục bộ cho thiết bị
 */
export interface SavedAccountSession {
  staffCode: string;
  email: string;
  name: string;
  hasPin: boolean;
  hasBiometrics: boolean;
  lastLoginAt: string;
}
