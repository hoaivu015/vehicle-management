const BIOMETRIC_KEY_PREFIX = 'auto28_biometric_cred_';

export class BiometricAuthService {
  /**
   * Kiểm tra thiết bị có hỗ trợ xác thực sinh trắc học (Face ID, Touch ID, Vân tay) không
   */
  static async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('PublicKeyCredential' in window)) return false;

    try {
      if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra tài khoản đã đăng ký mở khóa sinh trắc học trên thiết bị này chưa
   */
  static hasRegisteredBiometrics(email: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    return !!localStorage.getItem(`${BIOMETRIC_KEY_PREFIX}${cleanEmail}`);
  }

  /**
   * Đăng ký Face ID / Touch ID cho tài khoản trên thiết bị này
   */
  static async registerBiometrics(
    email: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> {
    const isAvail = await this.isAvailable();
    if (!isAvail) {
      return { success: false, error: 'Thiết bị không hỗ trợ hoặc chưa kích hoạt sinh trắc học.' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const challenge = new Uint8Array(32);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(challenge);
      }

      const userId = new TextEncoder().encode(cleanEmail);

      const credentialCreationOptions = {
        challenge,
        rp: {
          name: 'Auto 28 Showroom Manager',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: cleanEmail,
          displayName: displayName || cleanEmail,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' as const },  // ES256
          { alg: -257, type: 'public-key' as const } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as const,
          userVerification: 'required' as const,
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions,
      });

      if (credential) {
        localStorage.setItem(
          `${BIOMETRIC_KEY_PREFIX}${cleanEmail}`,
          JSON.stringify({
            id: credential.id,
            type: credential.type,
            registeredAt: new Date().toISOString(),
          })
        );
        return { success: true };
      }

      return { success: false, error: 'Không thể khởi tạo khóa sinh trắc học.' };
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Thao tác xác thực sinh trắc học đã bị hủy.' };
      }
      return {
        success: false,
        error: error.message || 'Lỗi đăng ký xác thực sinh trắc học.'
      };
    }
  }

  /**
   * Xác thực bằng Face ID / Touch ID
   */
  static async authenticateBiometrics(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    const isAvail = await this.isAvailable();
    if (!isAvail) {
      return { success: false, error: 'Thiết bị không hỗ trợ sinh trắc học.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = localStorage.getItem(`${BIOMETRIC_KEY_PREFIX}${cleanEmail}`);
    if (!stored) {
      return { success: false, error: 'Tài khoản chưa đăng ký sinh trắc học trên thiết bị này.' };
    }

    try {
      const challenge = new Uint8Array(32);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(challenge);
      }

      const assertionOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'required' as const,
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: assertionOptions,
      });

      if (assertion) {
        return { success: true };
      }

      return { success: false, error: 'Xác thực sinh trắc học thất bại.' };
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Bạn đã hủy xác thực sinh trắc học.' };
      }
      return {
        success: false,
        error: error.message || 'Lỗi xác thực sinh trắc học.'
      };
    }
  }

  /**
   * Hủy kích hoạt sinh trắc học cho tài khoản
   */
  static removeBiometrics(email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    localStorage.removeItem(`${BIOMETRIC_KEY_PREFIX}${cleanEmail}`);
  }
}
