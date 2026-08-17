import React, { Suspense } from 'react';
import { FinancePresenter } from './FinancePresenter';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useCashflowState } from './useCashflowState';

// Lazy load views to optimize platform-specific bundle size
const CashflowWebView = React.lazy(() => import('./CashflowWebView').then(m => ({ default: m.CashflowWebView })));
const CashflowMobileView = React.lazy(() => import('./CashflowMobileView').then(m => ({ default: m.CashflowMobileView })));

interface CashflowPageProps {
  presenter: FinancePresenter;
  userRole: string;
  hasPermission: (permission: string) => boolean;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

/**
 * CashflowPage - The Dispatcher.
 */
export const CashflowPage: React.FC<CashflowPageProps> = (props) => {
  const isMobile = useIsMobile();
  const cashflowState = useCashflowState(props.presenter);

  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-kraft-accent/5 rounded-[3rem]" />}>
      {isMobile ? (
        <CashflowMobileView {...props} state={cashflowState} />
      ) : (
        <CashflowWebView {...props} state={cashflowState} />
      )}
    </Suspense>
  );
};
