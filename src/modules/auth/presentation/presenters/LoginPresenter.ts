import { AuthRepository } from '../../domain/AuthRepository';
import { StaffRepository } from '@/src/modules/staff/domain/StaffRepository';
import { LoginSchema, SavedAccountSession } from '../../domain/dtos/LoginSchema';
import { QuickPinService } from '../../domain/services/QuickPinService';
import { BiometricAuthService } from '../../domain/services/BiometricAuthService';
import { Staff } from '@/src/shared/domain/types';
import { LoginSessionStorage } from './LoginSessionStorage';
import { LoginIdentifierResolver } from './LoginIdentifierResolver';

export type LoginMode = 'SMART_FORM' | 'QUICK_PIN' | 'BIOMETRIC_PROMPT';

export interface LoginViewContract {
  showLoading: (isLoading: boolean) => void;
  showError: (message: string) => void;
  clearError: () => void;
  setMode: (mode: LoginMode) => void;
  setSavedAccount: (account: SavedAccountSession | null) => void;
  onLoginSuccess?: (staff?: Staff) => void;
}

export class LoginPresenter {
  private view: LoginViewContract | null = null;
  private savedAccount: SavedAccountSession | null = null;
  private readonly resolver: LoginIdentifierResolver;

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly staffRepo: StaffRepository
  ) {
    this.resolver = new LoginIdentifierResolver(this.staffRepo);
  }

  attachView(view: LoginViewContract): void { this.view = view; }
  detachView(): void { this.view = null; }

  async init(): Promise<void> {
    this.savedAccount = LoginSessionStorage.load();
    this.view?.setSavedAccount(this.savedAccount);
    this.view?.setMode(this.savedAccount?.hasPin ? 'QUICK_PIN' : 'SMART_FORM');
  }

  async resolveIdentifierToEmail(id: string): Promise<{ email: string; staff?: Staff | null }> {
    return this.resolver.resolve(id);
  }

  async loginWithPassword(identifier: string, pass: string, remember: boolean): Promise<boolean> {
    this.view?.clearError();
    const val = LoginSchema.safeParse({ identifier, password: pass, rememberMe: remember });
    if (!val.success) {
      this.view?.showError(val.error.issues[0]?.message || 'Dữ liệu không hợp lệ');
      return false;
    }

    this.view?.showLoading(true);
    try {
      const { email, staff } = await this.resolveIdentifierToEmail(identifier);
      const res = await this.authRepo.signIn(email, pass);
      if (res.success) {
        await this.handlePostLoginSuccess(email, staff, remember);
        return true;
      }
      if (res.error?.toLowerCase().includes('invalid login credentials')) {
        const prov = await LoginSessionStorage.autoProvision(this.authRepo, this.staffRepo, email, pass, staff);
        if (prov.success && prov.staff) {
          await this.handlePostLoginSuccess(email, prov.staff, remember);
          return true;
        }
        this.view?.showError(prov.error || 'Mã nhân viên hoặc mật khẩu không chính xác.');
        return false;
      }
      this.view?.showError(LoginSessionStorage.mapAuthErrorToMessage(res.error));
      return false;
    } catch (err: unknown) {
      this.view?.showError(LoginSessionStorage.mapAuthErrorToMessage((err as { message?: string }).message));
      return false;
    } finally {
      this.view?.showLoading(false);
    }
  }

  async unlockWithPin(pin: string): Promise<boolean> {
    if (!this.savedAccount?.email) return this.fallbackToSmartForm();
    this.view?.clearError();
    this.view?.showLoading(true);
    try {
      const res = await QuickPinService.verifyPin(this.savedAccount.email, pin);
      if (!res.success) {
        this.view?.showError(res.error || 'Mã PIN không chính xác.');
        return false;
      }
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

  async unlockWithBiometrics(): Promise<boolean> {
    if (!this.savedAccount?.email) {
      this.view?.showError('Chưa có thông tin tài khoản trên thiết bị này.');
      return false;
    }
    this.view?.clearError();
    this.view?.showLoading(true);
    try {
      const res = await BiometricAuthService.authenticateBiometrics(this.savedAccount.email);
      if (!res.success) {
        this.view?.showError(res.error || 'Xác thực sinh trắc học thất bại.');
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

  private fallbackToSmartForm(): boolean {
    this.view?.showError('Không tìm thấy phiên tài khoản đã lưu.');
    this.view?.setMode('SMART_FORM');
    return false;
  }

  switchAccount(): void {
    this.view?.setMode('SMART_FORM');
    this.view?.clearError();
  }

  clearSavedAccount(): void {
    LoginSessionStorage.clear(this.savedAccount?.email);
    this.savedAccount = null;
    this.view?.setSavedAccount(null);
    this.view?.setMode('SMART_FORM');
  }

  private async handlePostLoginSuccess(email: string, staff: Staff | null | undefined, remember: boolean): Promise<void> {
    const staffData = staff || (await this.staffRepo.getByEmail(email));
    if (remember && staffData) LoginSessionStorage.save(staffData);
    this.view?.onLoginSuccess?.(staffData || undefined);
  }
}
