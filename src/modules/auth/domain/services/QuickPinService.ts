const PIN_STORAGE_KEY_PREFIX = 'auto28_pin_hash_';
const PIN_ATTEMPTS_KEY_PREFIX = 'auto28_pin_attempts_';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

export class QuickPinService {
  /**
   * Băm mã PIN kèm Salt theo chuẩn công nghiệp Web Crypto SHA-256
   */
  static async hashPin(pin: string, salt: string): Promise<string> {
    const rawData = `${salt}:auto28_secret_salt_v2_${salt.length}:${pin}`;
    const subtle = typeof globalThis !== 'undefined' ? globalThis.crypto?.subtle : undefined;
    if (subtle) {
      const buffer = new TextEncoder().encode(rawData);
      const hashBuffer = await subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('Yêu cầu môi trường bảo mật (HTTPS/Web Crypto API) để mã hóa mã PIN.');
  }

  /**
   * Thiết lập hoặc đổi mã PIN 4 số
   */
  static async setPin(email: string, pin: string): Promise<void> {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('Mã PIN phải bao gồm đúng 4 chữ số');
    }
    const cleanEmail = email.trim().toLowerCase();
    const hash = await this.hashPin(pin, cleanEmail);
    localStorage.setItem(`${PIN_STORAGE_KEY_PREFIX}${cleanEmail}`, hash);
    this.resetAttempts(cleanEmail);
  }

  /**
   * Kiểm tra xem tài khoản đã cài đặt mã PIN chưa
   */
  static hasPin(email: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    return !!localStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${cleanEmail}`);
  }

  /**
   * Xóa mã PIN của tài khoản
   */
  static removePin(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    localStorage.removeItem(`${PIN_STORAGE_KEY_PREFIX}${cleanEmail}`);
    this.resetAttempts(cleanEmail);
  }

  /**
   * Kiểm tra thời gian khóa nếu nhập sai quá số lần cho phép
   */
  static getLockoutRemainingSeconds(email: string): number {
    const record = this.getAttempts(email);
    if (!record.lockedUntil) return 0;
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    if (remaining <= 0) {
      this.resetAttempts(email);
      return 0;
    }
    return remaining;
  }

  /**
   * Xác thực mã PIN khi mở khóa
   */
  static async verifyPin(
    email: string,
    pin: string
  ): Promise<{ success: boolean; error?: string; remainingAttempts?: number }> {
    const cleanEmail = email.trim().toLowerCase();
    const lockoutSec = this.getLockoutRemainingSeconds(cleanEmail);
    if (lockoutSec > 0) {
      return {
        success: false,
        error: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${lockoutSec} giây hoặc dùng mật khẩu chính.`
      };
    }

    const storedHash = localStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${cleanEmail}`);
    if (!storedHash) {
      return {
        success: false,
        error: 'Tài khoản chưa thiết lập mã PIN.'
      };
    }

    const inputHash = await this.hashPin(pin, cleanEmail);
    if (inputHash === storedHash) {
      this.resetAttempts(cleanEmail);
      return { success: true };
    }

    // Xử lý khi nhập sai PIN
    const attempts = this.recordFailedAttempt(cleanEmail);
    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - attempts.count);

    if (attempts.lockedUntil) {
      return {
        success: false,
        error: `Nhập sai mã PIN 5 lần. Tạm khóa trong ${Math.ceil(LOCKOUT_DURATION_MS / 1000)} giây.`,
        remainingAttempts: 0
      };
    }

    return {
      success: false,
      error: `Mã PIN không chính xác. Còn lại ${remaining} lần thử.`,
      remainingAttempts: remaining
    };
  }

  private static getAttempts(email: string): AttemptRecord {
    const cleanEmail = email.trim().toLowerCase();
    const raw = localStorage.getItem(`${PIN_ATTEMPTS_KEY_PREFIX}${cleanEmail}`);
    if (!raw) return { count: 0, lockedUntil: null };
    try {
      return JSON.parse(raw) as AttemptRecord;
    } catch {
      return { count: 0, lockedUntil: null };
    }
  }

  private static recordFailedAttempt(email: string): AttemptRecord {
    const cleanEmail = email.trim().toLowerCase();
    const current = this.getAttempts(cleanEmail);
    const newCount = current.count + 1;
    const isLocked = newCount >= MAX_FAILED_ATTEMPTS;
    const record: AttemptRecord = {
      count: isLocked ? 0 : newCount,
      lockedUntil: isLocked ? Date.now() + LOCKOUT_DURATION_MS : null
    };
    localStorage.setItem(`${PIN_ATTEMPTS_KEY_PREFIX}${cleanEmail}`, JSON.stringify(record));
    return record;
  }

  private static resetAttempts(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    localStorage.removeItem(`${PIN_ATTEMPTS_KEY_PREFIX}${cleanEmail}`);
  }
}
