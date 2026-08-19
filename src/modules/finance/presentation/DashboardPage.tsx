import React from 'react';
import { FinancePresenter } from './FinancePresenter';
import { useFinance } from './useFinance';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useDashboardState } from './useDashboardState';
import { DashboardWebView } from './DashboardWebView';
import { DashboardMobileView } from './DashboardMobileView';

interface DashboardPageProps {
  presenter?: FinancePresenter;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

/**
 * DashboardPage - The Dispatcher.
 * Automatically renders the optimized view based on the platform/screen size.
 * Direct imports prevent Double Suspense Waterfall and eliminate UI flickering.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  presenter: propPresenter,
  onNavigate
}) => {
  const { financePresenter } = useFinance();
  const presenter = propPresenter || financePresenter;
  const isMobile = useIsMobile();
  const dashboardState = useDashboardState(presenter);
  
  return isMobile ? (
    <DashboardMobileView presenter={presenter} onNavigate={onNavigate} state={dashboardState} />
  ) : (
    <DashboardWebView presenter={presenter} onNavigate={onNavigate} state={dashboardState} />
  );
};
