import React from 'react';
import { FinancePresenter } from './FinancePresenter';
import { useFinance } from './useFinance';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useCashflowState } from './useCashflowState';
import { CashflowWebView } from './CashflowWebView';
import { CashflowMobileView } from './CashflowMobileView';

interface CashflowPageProps {
  presenter?: FinancePresenter;
  userRole: string;
  hasPermission: (permission: string) => boolean;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

/**
 * CashflowPage - The Dispatcher.
 * Direct imports prevent Double Suspense Waterfall and eliminate UI flickering.
 */
export const CashflowPage: React.FC<CashflowPageProps> = (props) => {
  const { financePresenter } = useFinance();
  const presenter = props.presenter || financePresenter;
  const isMobile = useIsMobile();
  const cashflowState = useCashflowState(presenter);

  return isMobile ? (
    <CashflowMobileView {...props} presenter={presenter} state={cashflowState} />
  ) : (
    <CashflowWebView {...props} presenter={presenter} state={cashflowState} />
  );
};
