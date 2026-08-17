import React, { Suspense } from 'react';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useStaffState } from './useStaffState';

// Lazy load views to optimize platform-specific bundle size
const StaffWebView = React.lazy(() => import('./StaffWebView').then(m => ({ default: m.StaffWebView })));
const StaffMobileView = React.lazy(() => import('./StaffMobileView').then(m => ({ default: m.StaffMobileView })));

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

  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-kraft-accent/5 rounded-[3rem]" />}>
      {isMobile ? (
        <StaffMobileView {...props} state={staffState} />
      ) : (
        <StaffWebView {...props} state={staffState} />
      )}
    </Suspense>
  );
};
