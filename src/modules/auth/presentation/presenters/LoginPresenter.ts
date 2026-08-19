import { AuthRepository } from '../../domain/AuthRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { LoginSchema, SavedAccountSession } from '../../domain/dtos/LoginSchema';
import { QuickPinService } from '../../domain/services/QuickPinService';
import { BiometricAuthService } from '../../domain/services/BiometricAuthService';
import { Staff } from '@/src/shared/domain/types';

export type LoginMode = 'SMART_FORM' | 'QUICK_PIN' | 'BIOMETRIC_PROMPT';

export interface LoginViewContract {
  showLoading: (isLoading: boolean) => void;
  showError: (message: string) => void;
  clearError: () => void;
  setMode: (mode: LoginMode) => void;
  setSavedAccount: (account: SavedAccountSession | null) => void;
  onLoginSuccess?: (staff?: Staff) => void;
}

const SAVED_ACCOUNT_STORAGE_KEY = 'auto28_saved_account_session';

export class LoginPresenter {
  private view: LoginViewContract | null = null;
  private savedAccount: SavedAccountSession | null = null;

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly staffRepo: StaffRepository
  ) {}

  attachView(view: LoginViewContract): void {
    this.view = view;
  }

  detachView(): void {
    this.view = null;
  }

  /**
   * Khởi tạo trạng thái đăng nhập, kiểm tra tài khoản đã lưu và mã PIN
   */
  async init(): Promise<void> {
    try {
      const raw = localStorage.getItem(SAVED_ACCOUNT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedAccountSession;
        const hasPin = QuickPinService.hasPin(parsed.email);
        const hasBiometrics = BiometricAuthService.hasRegisteredBiometrics(parsed.email);

        this.savedAccount = {
          ...parsed,
          hasPin,
          hasBiometrics,
        };

        this.view?.setSavedAccount(this.savedAccount);

        if (hasPin) {
          this.view?.setMode('QUICK_PIN');
        } else {
          this.view?.setMode('SMART_FORM');
        }
      } else {
        this.view?.setSavedAccount(null);
        this.view?.setMode('SMART_FORM');
      }
    } catch {
      this.view?.setSavedAccount(null);
      this.view?.setMode('SMART_FORM');
    }
  }

  /**
   * Phân giải thông minh: Mã nhân viên (NV01, ADMIN) hoặc tiền tố email -> Email chuẩn
   */
  async resolveIdentifierToEmail(identifier: string): Promise<{ email: string; staff?: Staff | null }> {
    const raw = identifier.trim();

    // 1. Nếu người dùng nhập email có dấu @ -> chuẩn hóa trực tiếp
    if (raw.includes('@')) {
      const cleanEmail = raw.toLowerCase();
      const staff = await this.staffRepo.getByEmail(cleanEmail).catch(() => null);
      return { email: cleanEmail, staff };
    }

    // 2. Tra cứu theo Mã nhân viên (Code) trong bảng employees
    const staffByCode = await this.staffRepo.getByCode(raw.toUpperCase()).catch(() => null);
    if (staffByCode?.email) {
      return { email: staffByCode.email.toLowerCase(), staff: staffByCode };
    }

    // 3. Fallback: Nếu không có @ và không tìm thấy mã, giả định tiền tố @auto28.vn
    const guessedEmail = `${raw.toLowerCase()}@auto28.vn`;
    const staffByGuessed = await this.staffRepo.getByEmail(guessedEmail).catch(() => null);
    return { email: guessedEmail, staff: staffByGuessed };
  }

  /**
   * Đăng nhập thông minh bằng Mã NV / Email và Mật khẩu
   */
  async loginWithPassword(
    identifier: string,
    password: string,
    rememberMe: boolean
  ): Promise<boolean> {
    this.view?.clearError();

    // 1. Validate form với Zod Schema
    const validation = LoginSchema.safeParse({ identifier, password, rememberMe });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
      this.view?.showError(firstError);
      return false;
    }

    this.view?.showLoading(true);

    try {
      // 2. Phân giải Identifier -> Email chuẩn
      const { email: resolvedEmail, staff: existingStaff } = await this.resolveIdentifierToEmail(identifier);

      // 3. Gọi xác thực Supabase Auth
      const signInResult = await this.authRepo.signIn(resolvedEmail, password);

      if (signInResult.success) {
        await this.handlePostLoginSuccess(resolvedEmail, existingStaff, rememberMe);
        return true;
      }

      // 4. Xử lý trường hợp Auto-Provisioning (Nhân viên đã có trong employees nhưng chưa có tài khoản Supabase Auth)
      if (signInResult.error?.toLowerCase().includes('invalid login credentials')) {
        const staffProfile = existingStaff || (await this.staffRepo.getByEmail(resolvedEmail));

        if (!staffProfile) {
          this.view?.showError('Mã nhân viên hoặc mật khẩu không chính xác.');
          return false;
        }

        // Tự động khởi tạo tài khoản Auth lần đầu
        const signUpResult = await this.authRepo.signUp(resolvedEmail, password);

        if (!signUpResult.success) {
          if (signUpResult.error?.includes('already registered')) {
            this.view?.showError('Mã nhân viên hoặc mật khẩu không chính xác.');
          } else {
            this.view?.showError('Lỗi xác thực hồ sơ nhân viên. Vui lòng liên hệ Quản trị viên.');
          }
          return false;
        }

        if (signUpResult.user && !signUpResult.user.emailConfirmedAt) {
          this.view?.showError(
            `Tài khoản đã được tạo! Vui lòng kiểm tra hộp thư (${resolvedEmail}) để kích hoạt trước khi đăng nhập.`
          );
          return false;
        }

        await this.handlePostLoginSuccess(resolvedEmail, staffProfile, rememberMe);
        return true;
      }

      // Xử lý các lỗi khác từ Auth
      const friendlyMessage = this.mapAuthErrorToMessage(signInResult.error);
      this.view?.showError(friendlyMessage);
      return false;
    } catch (err: unknown) {
      const error = err as { message?: string };
      const friendlyMessage = this.mapAuthErrorToMessage(error.message);
      this.view?.showError(friendlyMessage);
      return false;
    } finally {
      this.view?.showLoading(false);
    }
  }

  /**
   * Mở khóa siêu tốc bằng Mã PIN 4 số
   */
  async unlockWithPin(pin: string): Promise<boolean> {
    if (!this.savedAccount?.email) {
      this.view?.showError('Không tìm thấy phiên tài khoản đã lưu.');
      this.view?.setMode('SMART_FORM');
      return false;
    }

    this.view?.clearError();
    this.view?.showLoading(true);

    try {
      const verifyResult = await QuickPinService.verifyPin(this.savedAccount.email, pin);
      if (!verifyResult.success) {
        this.view?.showError(verifyResult.error || 'Mã PIN không chính xác.');
        return false;
      }

      // Xác thực PIN thành công -> Kích hoạt đăng nhập
      const staff = await this.staffRepo.getByEmail(this.savedAccount.email);
      this.view?.onLoginSuccess?.(staff || undefined);
      return true;
    } catch {
      this.view?.showError('Lỗi xác thực mã PIN. Vui lòng sử dụng mật khẩu chính.');
      return false;
    } finally {
      this.view?.showLoading(false);
    }
  }

  /**
   * Mở khóa 1-chạm bằng Face ID / Touch ID
   */
  async unlockWithBiometrics(): Promise<boolean> {
    if (!this.savedAccount?.email) {
      this.view?.showError('Chưa có thông tin tài khoản trên thiết bị này.');
      return false;
    }

    this.view?.clearError();
    this.view?.showLoading(true);

    try {
      const result = await BiometricAuthService.authenticateBiometrics(this.savedAccount.email);
      if (!result.success) {
        this.view?.showError(result.error || 'Xác thực sinh trắc học thất bại.');
        return false;
      }

      const staff = await this.staffRepo.getByEmail(this.savedAccount.email);
      this.view?.onLoginSuccess?.(staff || undefined);
      return true;
    } catch {
      this.view?.showError('Không thể hoàn tất xác thực sinh trắc học.');
      return false;
    } finally {
      this.view?.showLoading(false);
    }
  }

  /**
   * Chuyển sang tài khoản khác / Thoát chế độ mở khóa nhanh
   */
  switchAccount(): void {
    this.view?.setMode('SMART_FORM');
    this.view?.clearError();
  }

  /**
   * Xóa tài khoản đã lưu khỏi thiết bị
   */
  clearSavedAccount(): void {
    if (this.savedAccount?.email) {
      QuickPinService.removePin(this.savedAccount.email);
      BiometricAuthService.removeBiometrics(this.savedAccount.email);
    }
    localStorage.removeItem(SAVED_ACCOUNT_STORAGE_KEY);
    this.savedAccount = null;
    this.view?.setSavedAccount(null);
    this.view?.setMode('SMART_FORM');
  }

  private async handlePostLoginSuccess(
    email: string,
    staff: Staff | null | undefined,
    rememberMe: boolean
  ): Promise<void> {
    const staffData = staff || (await this.staffRepo.getByEmail(email));

    if (rememberMe && staffData) {
      const sessionData: SavedAccountSession = {
        staffCode: staffData.code,
        email: staffData.email,
        name: staffData.name,
        hasPin: QuickPinService.hasPin(staffData.email),
        hasBiometrics: BiometricAuthService.hasRegisteredBiometrics(staffData.email),
        lastLoginAt: new Date().toISOString(),
      };
      localStorage.setItem(SAVED_ACCOUNT_STORAGE_KEY, JSON.stringify(sessionData));
    }

    this.view?.onLoginSuccess?.(staffData || undefined);
  }

  /**
   * Ánh xạ thông báo lỗi tiếng Anh từ backend sang tiếng Việt chuẩn Showroom
   */
  private mapAuthErrorToMessage(rawError?: string): string {
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
}
