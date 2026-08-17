import React from 'react';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';
import { useInventoryState } from './useInventoryState';
import { InventoryWebView } from './InventoryWebView';
import { InventoryMobileView } from './InventoryMobileView';

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
 * Direct imports prevent Double Suspense Waterfall and eliminate UI flickering.
 */
export const InventoryPage: React.FC<InventoryPageProps> = (props) => {
  const isMobile = useIsMobile();
  const inventoryState = useInventoryState(props);

  return isMobile ? (
    <InventoryMobileView {...props} state={inventoryState} />
  ) : (
    <InventoryWebView {...props} state={inventoryState} />
  );
};
