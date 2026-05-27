import { toast } from 'sonner';
import { NotificationService } from '../domain/NotificationService';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type ToastRenderer = (
  message: string,
  type: NotificationType,
  dismiss: () => void
) => any;

export class SonnerNotificationService implements NotificationService {
  private renderer?: ToastRenderer;

  setRenderer(renderer: ToastRenderer) {
    this.renderer = renderer;
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  private show(message: string, type: NotificationType): void {
    if (this.renderer) {
      toast.custom((t) => this.renderer!(message, type, () => toast.dismiss(t)));
    } else {
      // Fallback to default sonner toasts if no renderer is provided
      toast[type](message);
    }
  }
}

export const notificationService = new SonnerNotificationService();
