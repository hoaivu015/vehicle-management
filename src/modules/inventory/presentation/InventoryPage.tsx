import React, { Suspense } from 'react';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useInventoryState } from './useInventoryState';

// Lazy load views to optimize platform-specific bundle size
const InventoryWebView = React.lazy(() => import('./InventoryWebView').then(m => ({ default: m.InventoryWebView })));
const InventoryMobileView = React.lazy(() => import('./InventoryMobileView').then(m => ({ default: m.InventoryMobileView })));

interface InventoryPageProps {
  userRole: string;
  currentUser: import('../../../shared/domain/types').Staff | null;
  initialSearch?: string;
  initialFilter?: string;
  initialAction?: string;
  hasPermission: (p: string) => boolean;
}

/**
 * InventoryPage - The Dispatcher.
 * Automatically renders the optimized view based on the platform/screen size.
 */
export const InventoryPage: React.FC<InventoryPageProps> = (props) => {
  const isMobile = useIsMobile();
  const inventoryState = useInventoryState(props);

  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-kraft-accent/5 rounded-[3rem]" />}>
      {isMobile ? (
        <InventoryMobileView {...props} state={inventoryState} />
      ) : (
        <InventoryWebView {...props} state={inventoryState} />
      )}
    </Suspense>
  );
};
