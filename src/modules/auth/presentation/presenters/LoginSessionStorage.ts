import { SavedAccountSession } from '../../domain/dtos/LoginSchema';
import { QuickPinService } from '../../domain/services/QuickPinService';
import { BiometricAuthService } from '../../domain/services/BiometricAuthService';
import { Staff } from '@/src/shared/domain/types';
import { AuthRepository } from '../../domain/AuthRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';

export const SAVED_ACCOUNT_STORAGE_KEY = 'auto28_saved_account_session';

export class LoginSessionStorage {
  static load(): SavedAccountSession | null {
    try {
      const raw = localStorage.getItem(SAVED_ACCOUNT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedAccountSession;
      return {
        ...parsed,
        hasPin: QuickPinService.hasPin(parsed.email),
        hasBiometrics: BiometricAuthService.hasRegisteredBiometrics(parsed.email),
      };
    } catch {
      return null;
    }
  }

  static save(staff: Staff): void {
    const sessionData: SavedAccountSession = {
      staffCode: staff.code,
      email: staff.email,
      name: staff.name,
      hasPin: QuickPinService.hasPin(staff.email),
      hasBiometrics: BiometricAuthService.hasRegisteredBiometrics(staff.email),
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(SAVED_ACCOUNT_STORAGE_KEY, JSON.stringify(sessionData));
  }

  static clear(email?: string): void {
    if (email) {
      QuickPinService.removePin(email);
      BiometricAuthService.removeBiometrics(email);
    }
    localStorage.removeItem(SAVED_ACCOUNT_STORAGE_KEY);
  }

  static mapAuthErrorToMessage(rawError?: string): string {
    if (!rawError) return 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';
    const lower = rawError.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
      return 'Mã nhân viên hoặc mật khẩu không chính xác.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra hộp thư công ty.';
    }
    if (lower.includes('too many requests') || lower.includes('rate limit')) {
      return 'Bạn đã thao tác quá nhiều lần. Vui lòng chờ 30 giây rồi thử lại.';
    }
    if (lower.includes('network') || lower.includes('failed to fetch')) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền Wi-Fi / 4G.';
    }
    return 'Lỗi đăng nhập: ' + rawError;
  }

  static async autoProvision(
    authRepo: AuthRepository,
    staffRepo: StaffRepository,
    email: string,
    pass: string,
    existingStaff?: Staff | null
  ): Promise<{ success: boolean; staff?: Staff; error?: string }> {
    const profile = existingStaff || (await staffRepo.getByEmail(email));
    if (!profile) return { success: false, error: 'Mã nhân viên hoặc mật khẩu không chính xác.' };

    const upRes = await authRepo.signUp(email, pass);
    if (!upRes.success) {
      const msg = upRes.error?.includes('already registered')
        ? 'Mã nhân viên hoặc mật khẩu không chính xác.'
        : 'Lỗi xác thực hồ sơ nhân viên. Vui lòng liên hệ Quản trị viên.';
      return { success: false, error: msg };
    }
    if (upRes.user && !upRes.user.emailConfirmedAt) {
      return { success: false, error: `Tài khoản đã được tạo! Vui lòng kiểm tra hộp thư (${email}) để kích hoạt trước khi đăng nhập.` };
    }
    return { success: true, staff: profile };
  }
}
