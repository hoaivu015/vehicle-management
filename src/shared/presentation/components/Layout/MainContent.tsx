import React, { Suspense } from 'react';
import { PERMISSIONS } from '@/src/constants';
import { PermissionService } from '@/src/modules/auth/domain/PermissionService';
import { DashboardSkeleton } from '@/src/modules/dashboard/presentation/DashboardSkeleton';
import { InventorySkeleton } from '@/src/modules/inventory/presentation/components/InventorySkeleton';
import { StaffSkeleton } from '@/src/modules/staff/presentation/components/StaffSkeleton';
import { CashflowSkeleton } from '@/src/modules/finance/presentation/components/CashflowSkeleton';
import { PersonalSkeleton } from '@/src/modules/personal/presentation/components/PersonalSkeleton';
import { AccountSkeleton } from '@/src/shared/design-system/AccountSkeleton';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from '@/src/shared/design-system/PageTransition';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Lazy load tab components
const DashboardPage = React.lazy(() => import('@/src/modules/finance/presentation/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage = React.lazy(() => import('@/src/modules/inventory/presentation/InventoryPage').then(m => ({ default: m.InventoryPage })));
const StaffPage = React.lazy(() => import('@/src/modules/staff/presentation/StaffPage').then(m => ({ default: m.StaffPage })));
const CashflowPage = React.lazy(() => import('@/src/modules/finance/presentation/CashflowPage').then(m => ({ default: m.CashflowPage })));
const AccountPage = React.lazy(() => import('@/src/modules/staff/presentation/AccountPage').then(m => ({ default: m.AccountPage })));
const PersonalView = React.lazy(() => import('@/src/modules/personal/presentation/PersonalView').then(m => ({ default: m.PersonalView })));
const SandboxPage = React.lazy(() => import('@/src/modules/sandbox/presentation/SandboxPage').then(m => ({ default: m.SandboxPage })));
const PermissionsPage = React.lazy(() => import('@/src/modules/auth/presentation/PermissionsPage').then(m => ({ default: m.PermissionsPage })));
const LandingPageManager = React.lazy(() => import('@/src/modules/landingpage/presentation/LandingPageManager').then(m => ({ default: m.LandingPageManager })));

// Showroom public pages (lazy loaded)
const ShowroomPage = React.lazy(() => import('@/src/modules/showroom/presentation/ShowroomPage').then(m => ({ default: m.ShowroomPage })));
const SellCarPage = React.lazy(() => import('@/src/modules/showroom/presentation/SellCarPage').then(m => ({ default: m.SellCarPage })));
const LegalGuidePage = React.lazy(() => import('@/src/modules/showroom/presentation/LegalGuidePage').then(m => ({ default: m.LegalGuidePage })));


const TabLoading = () => (
  <div className="w-full h-full min-h-[70vh] p-4 md:p-12 space-y-6 animate-in fade-in duration-300">
    <div className="space-y-3">
      <div className="h-8 w-48 rounded-2xl bg-black/5 animate-pulse" />
      <div className="h-4 w-72 rounded-xl bg-black/5 animate-pulse" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-[2.5rem] bg-black/5 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
    <div className="h-64 rounded-[3rem] bg-black/5 animate-pulse" />
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-black/5 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  </div>
);

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
  financePresenter: import('@/src/modules/finance/presentation/FinancePresenter').FinancePresenter;
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
  const location = useLocation();

  if (loading) {
    switch (activeTab) {
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
    <div className="w-full h-full min-h-screen">
      <AnimatePresence mode="wait">
        <PageTransition transitionKey={location.pathname}>
          <Suspense fallback={<TabLoading />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                (window.location.hostname === 'auto28.com.vn' || window.location.hostname === 'www.auto28.com.vn') ? 
                <ShowroomPage /> : (
                  hasPermission(PERMISSIONS.VIEW_DASHBOARD) ? 
                  <DashboardPage presenter={financePresenter} onNavigate={handleDashboardAction} /> : 
                  <Navigate to="/inventory" replace />
                )
              } />
              
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* Public Showroom Routing */}
              <Route path="/showroom" element={<ShowroomPage />} />
              <Route path="/dinh-gia" element={<SellCarPage />} />
              <Route path="/huong-dan" element={<LegalGuidePage />} />

              <Route path="/inventory" element={
                hasPermission(PERMISSIONS.VIEW_INVENTORY) ?
                <InventoryPage userRole={userRole} currentUser={currentUser} hasPermission={hasPermission} initialSearch={inventorySearch} initialFilter={inventoryFilter} initialAction={inventoryAction} /> :
                <Navigate to="/personal" replace />
              } />

              <Route path="/staff" element={
                hasPermission(PERMISSIONS.VIEW_STAFF) ?
                <StaffPage userRole={userRole} hasPermission={hasPermission} /> :
                <Navigate to="/inventory" replace />
              } />

              <Route path="/cashflow" element={
                hasPermission(PERMISSIONS.VIEW_CASHFLOW) ?
                <CashflowPage presenter={financePresenter} userRole={userRole} hasPermission={hasPermission} onNavigate={handleDashboardAction} /> :
                <Navigate to="/inventory" replace />
              } />

              <Route path="/users" element={
                hasPermission(PERMISSIONS.MANAGE_USERS) ?
                <AccountPage /> :
                <Navigate to="/inventory" replace />
              } />

              <Route path="/personal" element={
                hasPermission(PERMISSIONS.VIEW_PERSONAL) ?
                <PersonalView user={currentUser} onUpdateUser={onUpdateUser} onLogout={handleLogout} /> :
                <Navigate to="/" replace />
              } />

              <Route path="/landingpage" element={
                hasPermission(PERMISSIONS.MANAGE_LANDINGPAGE) ?
                <LandingPageManager /> :
                <Navigate to="/" replace />
              } />

              <Route path="/permissions" element={
                hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) ?
                <PermissionsPage /> :
                <Navigate to="/" replace />
              } />

              <Route path="/sandbox" element={
                PermissionService.isAdmin(currentUser?.role) ?
                <SandboxPage /> :
                <Navigate to="/" replace />
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </AnimatePresence>
    </div>
  );
};
