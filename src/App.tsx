import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/src/shared/presentation/components/Layout/Header';
import { Toaster } from 'sonner';
import { cn } from "@/src/shared/utils/cn";
import { UserRole } from '@/src/shared/domain/constants';
import { useAuth } from '@/src/modules/auth/presentation/useAuth';
import { MainContent } from '@/src/shared/presentation/components/Layout/MainContent';
import { MobileBottomNavContainer } from '@/src/shared/presentation/components/Layout/MobileBottomNavContainer';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useLocation, useNavigate } from 'react-router-dom';
import { PERMISSIONS } from '@/src/constants';
import { NotificationInitializer } from '@/src/shared/presentation/components/NotificationInitializer';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { AnimatePresence, MotionConfig } from 'motion/react';

// Lazy-load Login, AppSplashScreen and global modal to minimize initial bundle size
import { AppSplashScreen } from '@/src/shared/presentation/components/Layout/AppSplashScreen';
const Login = React.lazy(() => 
  import('@/src/modules/auth/presentation/views/Login').then(m => ({ default: m.Login }))
);
const StaffAddExpenseModal = React.lazy(() => 
  import('@/src/modules/staff/presentation/components/StaffAddExpenseModal').then(m => ({ default: m.StaffAddExpenseModal }))
);

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    isAuthLoading,
    isAuthed,
    hasPermission,
    isAdmin,
    handleLogout,
    handleUpdateUser
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const { createStaffPresenter } = useDependencies();
  const [isGlobalExpenseOpen, setIsGlobalExpenseOpen] = useState(false);
  const [vehicles, setVehicles] = useState<import('@/src/shared/domain/types').Vehicle[]>([]);

  // Defer vehicle loading until user actually opens global expense modal
  useEffect(() => {
    if (!isGlobalExpenseOpen) return;

    const presenter = createStaffPresenter();
    presenter.attachView({
      showStaffList: () => {},
      onStaffAdded: () => {},
      onStaffUpdated: () => {},
      onStaffDeleted: () => {},
      showVehicles: (v) => setVehicles(v),
      showLoading: () => {},
      hideLoading: () => {},
      showError: () => {}
    });
    presenter.loadVehicles();
    return () => presenter.detachView();
  }, [isGlobalExpenseOpen, createStaffPresenter]);

  // Derive activeTab from URL path
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  const setActiveTab = React.useCallback((tab: string) => {
    if (tab === 'dashboard') navigate('/');
    else navigate(`/${tab}`);
  }, [navigate]);

  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'AGING_25'>('ALL');
  const [inventoryAction, setInventoryAction] = useState('');

  // Permission-based redirection logic
  useEffect(() => {
    if (isAuthLoading || !isAuthed || !currentUser) return;

    const TAB_PERMISSIONS: Record<string, string> = {
      dashboard: PERMISSIONS.VIEW_DASHBOARD,
      inventory: PERMISSIONS.VIEW_INVENTORY,
      staff: PERMISSIONS.VIEW_STAFF,
      cashflow: PERMISSIONS.VIEW_CASHFLOW,
      users: PERMISSIONS.MANAGE_USERS,
      permissions: PERMISSIONS.MANAGE_PERMISSIONS,
      personal: PERMISSIONS.VIEW_PERSONAL,
      sandbox: 'ADMIN_ONLY', // Special case
    };

    const currentPermission = TAB_PERMISSIONS[activeTab];
    
    let isAllowed = true;
    if (activeTab === 'sandbox') {
      isAllowed = isAdmin();
    } else if (currentPermission) {
      isAllowed = hasPermission(currentPermission);
    }
 
    if (!isAllowed) {
      // Find first allowed tab
      const firstAllowedTab = Object.keys(TAB_PERMISSIONS).find(tab => {
        if (tab === 'sandbox') return isAdmin();
        return hasPermission(TAB_PERMISSIONS[tab]);
      });
      
      if (firstAllowedTab) {
        setActiveTab(firstAllowedTab);
      }
    }
  }, [activeTab, currentUser, isAuthLoading, isAuthed, hasPermission, isAdmin, setActiveTab]);

  // Reset scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const mainEl = document.querySelector('.ctab-panel');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleDashboardAction = (tab: string, search = '', filter = 'ALL', action = '') => {
    setActiveTab(tab);
    if (tab === 'inventory') {
      setInventorySearch(search);
      setInventoryFilter(filter as 'ALL' | 'AGING_25');
      setInventoryAction(action);
    }
  };

  const onInventoryClick = () => {
    setInventorySearch('');
    setInventoryFilter('ALL');
    setInventoryAction('');
    setActiveTab('inventory');
  };

  const userRole = currentUser?.role || UserRole.STAFF;
  if (isAuthLoading) {
    return <AppSplashScreen />;
  }

  if (!currentUser && !isAuthed) {
    return (
      <Suspense fallback={<AppSplashScreen />}>
        <Login onLogin={setCurrentUser} />
      </Suspense>
    );
  }

  const isLoading = isAuthed && !currentUser;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen xl:h-auto xl:min-h-[100dvh] overflow-x-hidden xl:overflow-visible bg-transparent flex flex-col p-0">
      <NotificationInitializer />
      <Toaster 
        position="top-right" 
        expand={true} 
        richColors 
        closeButton
        toastOptions={{
          className: "rounded-t2 border-hairline-soft shadow-kraft-deep font-sans",
          descriptionClassName: "text-sub-label",
        }}
      />
      <div className="w-full flex flex-col flex-1">
        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          onLogout={handleLogout}
          hasPermission={hasPermission}
          isLoading={isLoading}
          onInventoryClick={onInventoryClick}
        />
        <main className={cn(
          "ctab-panel flex-1 p-0 relative pb-0 xl:pb-6 overflow-x-hidden transition-colors duration-700 xl:-mt-px",
          activeTab === 'dashboard' && "panel-tint-accent"
        )}>
          <div className="ctab-content h-full w-full">
            <MainContent
              activeTab={activeTab}
              userRole={userRole}
              currentUser={currentUser}
              inventorySearch={inventorySearch}
              inventoryFilter={inventoryFilter}
              inventoryAction={inventoryAction}
              handleLogout={handleLogout}
              hasPermission={hasPermission}
              onUpdateUser={handleUpdateUser}
              handleDashboardAction={handleDashboardAction}
              loading={isLoading}
            />
          </div>

          <footer className="mt-12 pt-8 border-t border-hairline-soft hidden xl:block">
            <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-sub-label/40 font-mono font-bold tracking-widest px-4">
              <p className="uppercase">© 2026 AUTO 28 Showroom Manager • Phanvu</p>
            </div>
          </footer>
        </main>
      </div>

      {currentUser && !isAuthLoading && isAuthed && (
        <MobileBottomNavContainer
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onInventoryClick={onInventoryClick}
          hasPermission={hasPermission}
          onAddExpenseClick={() => setIsGlobalExpenseOpen(true)}
        />
      )}

      <AnimatePresence>
        {isGlobalExpenseOpen && currentUser && (
          <Suspense fallback={null}>
            <StaffAddExpenseModal 
              isOpen={isGlobalExpenseOpen}
              onClose={() => setIsGlobalExpenseOpen(false)}
              staffName={currentUser.name}
              onAdd={async (data) => {
                const presenter = createStaffPresenter();
                await presenter.addStaffExpense(currentUser.id, data);
                setIsGlobalExpenseOpen(false);
              }}
              vehicles={vehicles}
            />
          </Suspense>
        )}
      </AnimatePresence>
      <SpeedInsights />
      </div>
    </MotionConfig>
  );
}
