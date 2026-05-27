import React from 'react';
import { StaffWebView } from './StaffWebView';
import { StaffMobileView } from './StaffMobileView';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';

interface StaffPageProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

/**
 * StaffPage - The Dispatcher.
 */
export const StaffPage: React.FC<StaffPageProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <StaffMobileView {...props} />;
  }

  return <StaffWebView {...props} />;
};
