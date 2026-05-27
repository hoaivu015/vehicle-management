import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Haptics Utility - Chuẩn Meta 2026.
 * Cung cấp phản hồi vật lý cho các hành động quan trọng.
 * Tự động fallback giữa Capacitor (Native) và navigator.vibrate (Web/Android).
 */
export const haptics = {
  /**
   * Phản hồi nhẹ (Light impact).
   * Dùng cho các tương tác thông thường như Click, Toggle.
   */
  light: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  /**
   * Phản hồi trung bình (Medium impact).
   * Dùng cho các hành động thành công, xác nhận (VD: Chi lương).
   */
  medium: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  },

  /**
   * Phản hồi mạnh (Heavy impact).
   * Dùng cho các hành động quan trọng hoặc cảnh báo (VD: Xóa xe).
   */
  heavy: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }
  },

  /**
   * Phản hồi thành công (Success notification).
   */
  success: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 50, 20]);
    }
  },

  /**
   * Phản hồi lỗi (Error notification).
   */
  error: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Error });
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }
};
