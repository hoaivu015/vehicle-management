import React from 'react';
import { InventoryWebView } from './InventoryWebView';
import { InventoryMobileView } from './InventoryMobileView';
import { useIsMobile } from '@/src/shared/presentation/hooks/useIsMobile';

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

  if (isMobile) {
    return <InventoryMobileView {...props} />;
  }

  return <InventoryWebView {...props} />;
};
