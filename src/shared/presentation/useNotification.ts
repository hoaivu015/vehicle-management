import { useMemo } from 'react';
import { notificationService } from '../infrastructure/SonnerNotificationService';

export const useNotification = () => {
  return useMemo(() => notificationService, []);
};
