import React, { useEffect } from 'react';
import { notificationService } from '../../infrastructure/SonnerNotificationService';
import { Toast } from './Toast';

export const NotificationInitializer: React.FC = () => {
  useEffect(() => {
    // Inject the UI renderer into the infrastructure service
    // This decouples Infrastructure (logic) from Presentation (UI)
    notificationService.setRenderer((message, type, onClose) => (
      <Toast 
        message={message} 
        type={type} 
        onClose={onClose} 
      />
    ));
  }, []);

  return null; // This component doesn't render anything itself
};
