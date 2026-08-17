import React from 'react';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useStaffState } from './useStaffState';
import { StaffWebView } from './StaffWebView';
import { StaffMobileView } from './StaffMobileView';

interface StaffPageProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

/**
 * StaffPage - The Dispatcher.
 * Direct imports prevent Double Suspense Waterfall and eliminate UI flickering.
 */
export const StaffPage: React.FC<StaffPageProps> = (props) => {
  const isMobile = useIsMobile();
  const currentMonth = React.useMemo(() => new Date().toISOString().slice(0, 7), []);
  const staffState = useStaffState(currentMonth, props.userRole);

  return isMobile ? (
    <StaffMobileView {...props} state={staffState} />
  ) : (
    <StaffWebView {...props} state={staffState} />
  );
};
