import { useState, useEffect } from 'react';
import { Header } from '@/src/shared/presentation/components/Layout/Header';
import { Login } from '@/src/modules/auth/presentation/views/Login';
import { Toaster } from 'sonner';
import { cn } from "@/src/shared/utils/cn";
import { UserRole } from '@/src/shared/domain/constants';
import { useAuth } from '@/src/modules/auth/presentation/useAuth';
import { useFinance } from '@/src/modules/finance/presentation/useFinance';
import { MainContent } from '@/src/shared/presentation/components/Layout/MainContent';
import { MobileBottomNavContainer } from '@/src/shared/presentation/components/Layout/MobileBottomNavContainer';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useLocation, useNavigate } from 'react-router-dom';
import { PERMISSIONS } from '@/src/constants';
import { NotificationInitializer } from '@/src/shared/presentation/components/NotificationInitializer';
import { StaffAddExpenseModal } from '@/src/modules/staff/presentation/components/StaffAddExpenseModal';
import { useDependencies } from '@/src/shared/ioc/DependencyContext';
import { AnimatePresence, MotionConfig } from 'motion/react';

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
  
  const { financePresenter } = useFinance();

  const location = useLocation();
  const navigate = useNavigate();
  const { createStaffPresenter } = useDependencies();
  const [isGlobalExpenseOpen, setIsGlobalExpenseOpen] = useState(false);
  const [vehicles, setVehicles] = useState<import('@/src/shared/domain/types').Vehicle[]>([]);

  const staffPresenter = useState(() => createStaffPresenter())[0];

  useEffect(() => {
    staffPresenter.attachView({
      showStaffList: () => {},
      onStaffAdded: () => {},
      onStaffUpdated: () => {},
      onStaffDeleted: () => {},
      showVehicles: (v) => setVehicles(v),
      showLoading: () => {},
      hideLoading: () => {},
      showError: () => {}
    });
    staffPresenter.loadVehicles();
    return () => staffPresenter.detachView();
  }, [staffPresenter]);

  // Derive activeTab from URL path
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  const setActiveTab = (tab: string) => {
    if (tab === 'dashboard') navigate('/');
    else navigate(`/${tab}`);
  };

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
      landingpage: PERMISSIONS.MANAGE_LANDINGPAGE,
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
  }, [activeTab, currentUser, isAuthLoading, isAuthed, hasPermission]);

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

  const isPublicHost = window.location.hostname === 'auto28.com.vn' || window.location.hostname === 'www.auto28.com.vn';
  const publicRoutes = ['/dinh-gia', '/huong-dan', '/showroom'];
  const isPublicRoute = publicRoutes.includes(location.pathname) || (location.pathname === '/' && isPublicHost);

  const userRole = currentUser?.role || UserRole.STAFF;
  const isLoading = isAuthLoading || (isAuthed && !currentUser);

  if (!currentUser && !isAuthLoading && !isAuthed && !isPublicRoute) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Scoped rendering for public Landing Page / Showroom
  if (isPublicRoute || (isPublicHost && !isAuthed)) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen overflow-x-hidden bg-transparent p-0 flex flex-col">
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
            financePresenter={financePresenter}
            handleDashboardAction={handleDashboardAction}
            loading={isLoading}
          />
          <SpeedInsights />
        </div>
      </MotionConfig>
    );
  }

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
              financePresenter={financePresenter}
              handleDashboardAction={handleDashboardAction}
              loading={isLoading}
            />
          </div>

          <footer className="mt-12 pt-8 border-t border-white/20 hidden xl:block">
            <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-kraft-accent font-black tracking-[0.25em] px-4 opacity-60">
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
          <StaffAddExpenseModal 
            isOpen={isGlobalExpenseOpen}
            onClose={() => setIsGlobalExpenseOpen(false)}
            staffName={currentUser.name}
            onAdd={async (data) => {
              await staffPresenter.addStaffExpense(currentUser.id, data);
              setIsGlobalExpenseOpen(false);
            }}
            vehicles={vehicles}
          />
        )}
      </AnimatePresence>
      <SpeedInsights />
      </div>
    </MotionConfig>
  );
}
