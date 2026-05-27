import React from 'react';
import { FinancePresenter } from './FinancePresenter';
import { CashflowWebView } from './CashflowWebView';
import { CashflowMobileView } from './CashflowMobileView';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';

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

  if (isMobile) {
    return <CashflowMobileView {...props} />;
  }

  return <CashflowWebView {...props} />;
};
