import React, { Suspense } from 'react';
import { FinancePresenter } from './FinancePresenter';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';

// Lazy load views to optimize bundle size
const DashboardWebView = React.lazy(() => import('./DashboardWebView').then(m => ({ default: m.DashboardWebView })));
const DashboardMobileView = React.lazy(() => import('./DashboardMobileView').then(m => ({ default: m.DashboardMobileView })));

interface DashboardPageProps {
  presenter: FinancePresenter;
  onNavigate: (tab: string, search?: string, filter?: string, action?: string) => void;
}

/**
 * DashboardPage - The Dispatcher.
 * Automatically renders the optimized view based on the platform/screen size.
 * This maintains a single route while delivering two distinct experiences.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  presenter,
  onNavigate
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-kraft-accent/5 rounded-[3rem]" />}>
      {isMobile ? (
        <DashboardMobileView presenter={presenter} onNavigate={onNavigate} />
      ) : (
        <DashboardWebView presenter={presenter} onNavigate={onNavigate} />
      )}
    </Suspense>
  );
};
