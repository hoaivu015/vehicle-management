import React, { Suspense, useState } from 'react';
import { PERMISSIONS } from '@/src/constants';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { DashboardSkeleton } from '@/src/modules/dashboard/presentation/DashboardSkeleton';
import { InventorySkeleton } from '@/src/modules/inventory/presentation/components/InventorySkeleton';
import { StaffSkeleton } from '@/src/modules/staff/presentation/components/StaffSkeleton';
import { CashflowSkeleton } from '@/src/modules/finance/presentation/components/CashflowSkeleton';
import { PersonalSkeleton } from '@/src/modules/personal/presentation/components/PersonalSkeleton';
import { AccountSkeleton } from '@/src/shared/design-system/AccountSkeleton';
import { PageTransition } from '@/src/shared/design-system/PageTransition';
import { cn } from '@/src/shared/utils/cn';

// Lazy load tab components
const DashboardPage = React.lazy(() => import('@/src/modules/finance/presentation/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage = React.lazy(() => import('@/src/modules/inventory/presentation/InventoryPage').then(m => ({ default: m.InventoryPage })));
const StaffPage = React.lazy(() => import('@/src/modules/staff/presentation/StaffPage').then(m => ({ default: m.StaffPage })));
const CashflowPage = React.lazy(() => import('@/src/modules/finance/presentation/CashflowPage').then(m => ({ default: m.CashflowPage })));
const AccountPage = React.lazy(() => import('@/src/modules/staff/presentation/AccountPage').then(m => ({ default: m.AccountPage })));
const PersonalView = React.lazy(() => import('@/src/modules/personal/presentation/PersonalView').then(m => ({ default: m.PersonalView })));
const SandboxPage = React.lazy(() => import('@/src/modules/sandbox/presentation/SandboxPage').then(m => ({ default: m.SandboxPage })));
const PermissionsPage = React.lazy(() => import('@/src/modules/auth/presentation/PermissionsPage').then(m => ({ default: m.PermissionsPage })));

// Skeleton cho trang Phân quyền (admin-only)
const PermissionsSkeleton = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-kraft-accent/10 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-52 rounded-xl bg-black/5 animate-pulse" />
          <div className="h-3 w-72 rounded-lg bg-black/5 animate-pulse" />
        </div>
      </div>
      <div className="h-12 w-36 rounded-2xl bg-kraft-accent/10 animate-pulse" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-black/5 animate-pulse mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-black/5 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
      <div className="lg:col-span-3 rounded-[2.5rem] border border-black/5 overflow-hidden bg-white/40">
        <div className="grid grid-cols-5 gap-4 p-6 border-b border-black/5 bg-black/[0.02]">
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 rounded bg-black/5 animate-pulse" />)}
        </div>
        <div className="divide-y divide-black/5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center p-5" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-3 w-20 rounded bg-black/5 animate-pulse" />
                  <div className="h-2 w-14 rounded bg-black/5 animate-pulse" />
                </div>
              </div>
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-center">
                  <div className="w-10 h-10 rounded-xl bg-black/5 animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton mặc định cho các trang không có skeleton riêng (sandbox, unknown routes)
const DefaultPageSkeleton = () => (
  <div className="p-4 md:p-12 max-w-[1700px] mx-auto space-y-8 animate-in fade-in duration-500">
    <div className="space-y-3 border-b border-black/5 pb-8">
      <div className="h-10 w-64 rounded-2xl bg-black/5 animate-pulse" />
      <div className="h-3 w-96 rounded-xl bg-black/5 animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-[2.5rem] bg-black/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
    <div className="h-80 rounded-[3rem] bg-black/5 animate-pulse" />
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 rounded-2xl bg-black/5 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
      ))}
    </div>
  </div>
);

interface MainContentProps {
  activeTab: string;
  userRole: string;
  currentUser: import('@/src/shared/domain/types').Staff | null;
  inventorySearch: string;
  inventoryFilter: string;
  inventoryAction: string;
  handleLogout: () => void;
  hasPermission: (p: string) => boolean;
  onUpdateUser: (email: string, data: Partial<import('@/src/shared/domain/types').Staff> & { password?: string }) => void;
  financePresenter?: import('@/src/modules/finance/presentation/FinancePresenter').FinancePresenter;
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
  const currentTab = activeTab === '' ? 'dashboard' : activeTab;
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set([currentTab]));

  if (!visitedTabs.has(currentTab)) {
    setVisitedTabs(prev => new Set(prev).add(currentTab));
  }

  if (loading) {
    switch (currentTab) {
      case 'dashboard': return <DashboardSkeleton />;
      case 'inventory': return <InventorySkeleton />;
      case 'staff': return <StaffSkeleton />;
      case 'cashflow': return <CashflowSkeleton />;
      case 'personal': return <PersonalSkeleton />;
      case 'users': return <AccountSkeleton />;
      case 'permissions': return <PermissionsSkeleton />;
      default: return <DefaultPageSkeleton />;
    }
  }

  return (
    <div className="w-full h-full min-h-screen relative">
      {/* 1. Dashboard Tab */}
      {visitedTabs.has('dashboard') && hasPermission(PERMISSIONS.VIEW_DASHBOARD) && (
        <div 
          className={cn("w-full h-full", currentTab === 'dashboard' ? "block" : "hidden")}
          style={{ display: currentTab === 'dashboard' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'dashboard'}
        >
          <PageTransition transitionKey="dashboard">
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardPage presenter={financePresenter} onNavigate={handleDashboardAction} />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 2. Inventory Tab */}
      {visitedTabs.has('inventory') && hasPermission(PERMISSIONS.VIEW_INVENTORY) && (
        <div 
          className={cn("w-full h-full", currentTab === 'inventory' ? "block" : "hidden")}
          style={{ display: currentTab === 'inventory' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'inventory'}
        >
          <PageTransition transitionKey="inventory">
            <Suspense fallback={<InventorySkeleton />}>
              <InventoryPage 
                userRole={userRole} 
                currentUser={currentUser} 
                hasPermission={hasPermission} 
                initialSearch={inventorySearch} 
                initialFilter={inventoryFilter} 
                initialAction={inventoryAction} 
              />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 3. Staff Tab */}
      {visitedTabs.has('staff') && hasPermission(PERMISSIONS.VIEW_STAFF) && (
        <div 
          className={cn("w-full h-full", currentTab === 'staff' ? "block" : "hidden")}
          style={{ display: currentTab === 'staff' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'staff'}
        >
          <PageTransition transitionKey="staff">
            <Suspense fallback={<StaffSkeleton />}>
              <StaffPage userRole={userRole} hasPermission={hasPermission} />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 4. Cashflow Tab */}
      {visitedTabs.has('cashflow') && hasPermission(PERMISSIONS.VIEW_CASHFLOW) && (
        <div 
          className={cn("w-full h-full", currentTab === 'cashflow' ? "block" : "hidden")}
          style={{ display: currentTab === 'cashflow' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'cashflow'}
        >
          <PageTransition transitionKey="cashflow">
            <Suspense fallback={<CashflowSkeleton />}>
              <CashflowPage 
                presenter={financePresenter} 
                userRole={userRole} 
                hasPermission={hasPermission} 
                onNavigate={handleDashboardAction} 
              />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 5. Personal Tab */}
      {visitedTabs.has('personal') && hasPermission(PERMISSIONS.VIEW_PERSONAL) && (
        <div 
          className={cn("w-full h-full", currentTab === 'personal' ? "block" : "hidden")}
          style={{ display: currentTab === 'personal' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'personal'}
        >
          <PageTransition transitionKey="personal">
            <Suspense fallback={<PersonalSkeleton />}>
              <PersonalView 
                user={currentUser} 
                onUpdateUser={onUpdateUser} 
                onLogout={handleLogout} 
              />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 6. Users / Account Management Tab */}
      {visitedTabs.has('users') && hasPermission(PERMISSIONS.MANAGE_USERS) && (
        <div 
          className={cn("w-full h-full", currentTab === 'users' ? "block" : "hidden")}
          style={{ display: currentTab === 'users' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'users'}
        >
          <PageTransition transitionKey="users">
            <Suspense fallback={<AccountSkeleton />}>
              <AccountPage />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 7. Permissions Tab */}
      {visitedTabs.has('permissions') && hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) && (
        <div 
          className={cn("w-full h-full", currentTab === 'permissions' ? "block" : "hidden")}
          style={{ display: currentTab === 'permissions' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'permissions'}
        >
          <PageTransition transitionKey="permissions">
            <Suspense fallback={<PermissionsSkeleton />}>
              <PermissionsPage />
            </Suspense>
          </PageTransition>
        </div>
      )}

      {/* 8. Sandbox Tab */}
      {visitedTabs.has('sandbox') && PermissionService.isAdmin(currentUser?.role) && (
        <div 
          className={cn("w-full h-full", currentTab === 'sandbox' ? "block" : "hidden")}
          style={{ display: currentTab === 'sandbox' ? 'block' : 'none' }}
          aria-hidden={currentTab !== 'sandbox'}
        >
          <PageTransition transitionKey="sandbox">
            <Suspense fallback={<DefaultPageSkeleton />}>
              <SandboxPage />
            </Suspense>
          </PageTransition>
        </div>
      )}
    </div>
  );
};
