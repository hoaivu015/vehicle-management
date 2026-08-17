import React from 'react';
import { StaffWebView } from './StaffWebView';
import { StaffMobileView } from './StaffMobileView';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';

import { useStaffState } from './useStaffState';

interface StaffPageProps {
  userRole: string;
  hasPermission: (permission: string) => boolean;
}

/**
 * StaffPage - The Dispatcher.
 */
export const StaffPage: React.FC<StaffPageProps> = (props) => {
  const isMobile = useIsMobile();
  const currentMonth = React.useMemo(() => new Date().toISOString().slice(0, 7), []);
  const staffState = useStaffState(currentMonth, props.userRole);

  if (isMobile) {
    return <StaffMobileView {...props} state={staffState} />;
  }

  return <StaffWebView {...props} state={staffState} />;
};
