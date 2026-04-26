import React, { useMemo, Suspense } from 'react';
import { PERMISSIONS } from '../constants';
import { UserRole } from '../shared/domain/constants';
import { DashboardSkeleton } from '../modules/dashboard/presentation/DashboardSkeleton';
import { InventorySkeleton } from '../modules/inventory/presentation/components/InventorySkeleton';
import { StaffSkeleton } from '../modules/staff/presentation/components/StaffSkeleton';
import { CashflowSkeleton } from '../modules/finance/presentation/components/CashflowSkeleton';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './PageTransition';

// Lazy load tab components
const DashboardPage = React.lazy(() => import('../modules/finance/presentation/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage = React.lazy(() => import('../modules/inventory/presentation/InventoryPage').then(m => ({ default: m.InventoryPage })));
const StaffPage = React.lazy(() => import('../modules/staff/presentation/StaffPage').then(m => ({ default: m.StaffPage })));
const CashflowPage = React.lazy(() => import('../modules/finance/presentation/CashflowPage').then(m => ({ default: m.CashflowPage })));
const AccountPage = React.lazy(() => import('../modules/staff/presentation/AccountPage').then(m => ({ default: m.AccountPage })));
const PersonalView = React.lazy(() => import('../components/PersonalView').then(m => ({ default: m.PersonalView })));
const SandboxPage = React.lazy(() => import('../modules/sandbox/presentation/SandboxPage').then(m => ({ default: m.SandboxPage })));

const TabLoading = () => <div className="animate-in fade-in duration-500 h-full w-full" />;

interface MainContentProps {
  activeTab: string;
  userRole: string;
  currentUser: any;
  inventorySearch: string;
  inventoryFilter: any;
  inventoryAction: string;
  handleLogout: () => void;
  hasPermission: (p: string) => boolean;
  onUpdateUser: (email: string, data: any) => void;
  financePresenter: any;
  handleDashboardAction: (tab: string, search?: string, filter?: string, action?: string) => void;
  loading: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  userRole,
  currentUser,
  inventorySearch,
  inventoryFilter,
  inventoryAction,
  handleLogout,
  hasPermission,
  onUpdateUser,
  financePresenter,
  handleDashboardAction,
  loading
}) => {

  const content = useMemo(() => {
    if (loading) {
      switch (activeTab) {
        case 'dashboard': return <DashboardSkeleton />;
        case 'inventory': return <InventorySkeleton />;
        case 'staff': return <StaffSkeleton />;
        case 'cashflow': return <CashflowSkeleton />;
        default: return <div className="animate-pulse bg-kraft-accent/5 h-screen w-full rounded-[3rem]" />;
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return hasPermission(PERMISSIONS.VIEW_DASHBOARD) && <DashboardPage presenter={financePresenter} onNavigate={handleDashboardAction} />;
      case 'inventory':
        return hasPermission(PERMISSIONS.VIEW_INVENTORY) && <InventoryPage userRole={userRole} currentUser={currentUser} hasPermission={hasPermission} initialSearch={inventorySearch} initialFilter={inventoryFilter} initialAction={inventoryAction} />;
      case 'staff': {
        return hasPermission(PERMISSIONS.VIEW_STAFF) && <StaffPage userRole={userRole} hasPermission={hasPermission} />;
      }
      case 'cashflow':
        return hasPermission(PERMISSIONS.VIEW_CASHFLOW) && <CashflowPage presenter={financePresenter} userRole={userRole} hasPermission={hasPermission} />;
      case 'users':
        return hasPermission(PERMISSIONS.MANAGE_USERS) && <AccountPage />;
      case 'personal':
        return hasPermission(PERMISSIONS.VIEW_PERSONAL) && <PersonalView user={currentUser} onUpdateUser={onUpdateUser} onLogout={handleLogout} />;
      case 'sandbox':
        return currentUser?.role === UserRole.ADMIN && <SandboxPage />;
      default:
        return null;
    }
  }, [activeTab, userRole, currentUser, inventorySearch, inventoryFilter, inventoryAction, financePresenter, handleLogout, hasPermission, handleDashboardAction, loading]);

  return (
    <div className="w-full h-full min-h-screen">
      <AnimatePresence mode="wait">
        <PageTransition transitionKey={`${activeTab}-${loading}`}>
          <Suspense fallback={<TabLoading />}>
            {content}
          </Suspense>
        </PageTransition>
      </AnimatePresence>
    </div>
  );
};
