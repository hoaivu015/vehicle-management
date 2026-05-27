import { useState } from 'react';
import { useNotification } from './useNotification';
import { haptics } from '@/src/shared/utils/haptics';

interface ActionOptions<T> {
  successMessage?: string;
  onSuccess?: (result: T) => void;
  resetFns?: (() => void)[];
}

/**
 * useActionResponse - Module chuẩn hóa phản hồi người dùng cho các tác vụ nghiệp vụ.
 * Đảm bảo: Haptics (Rung), Notification (Thông báo), và Reset (Trạng thái nhập).
 */
export const useActionResponse = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notification = useNotification();

  const executeAction = async <T>(
    action: () => Promise<T>,
    options?: ActionOptions<T>
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      haptics.medium(); // Phản hồi xúc giác khi bắt đầu
      const result = await action();
      
      haptics.success(); // Phản hồi xúc giác khi thành công
      
      if (options?.successMessage) {
        notification.success(options.successMessage);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      // Quan trọng: Reset toàn bộ các trường thông tin đã nhập
      if (options?.resetFns) {
        options.resetFns.forEach(fn => fn());
      }
      
      return result;
    } catch (error: any) {
      haptics.error(); // Phản hồi xúc giác khi lỗi
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      notification.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, executeAction };
};
