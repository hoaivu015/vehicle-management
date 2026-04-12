import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_STAFF } from './data/mockData';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Toaster, toast } from 'sonner';
import { handleDatabaseError } from './utils/error';
import { STAFF, ROLE_PERMISSIONS, PERMISSIONS } from './constants';
import { UserRole, USER_ROLE_LABELS, ADMIN_EMAILS } from './shared/domain/constants';
import { supabase } from '@/src/shared/infrastructure/supabase';
import { SupabaseExpenseRepository } from './modules/finance/infrastructure/SupabaseExpenseRepository';
import { SupabaseVehicleRepository } from './modules/inventory/infrastructure/SupabaseVehicleRepository';
import { SupabaseStaffRepository } from './modules/staff/infrastructure/SupabaseStaffRepository';
import { GetMonthlyFinance } from './modules/finance/application/GetMonthlyFinance';
import { GetFinancialOverview } from './modules/finance/application/GetFinancialOverview';
import { FinancePresenter } from './modules/finance/presentation/FinancePresenter';

// Lazy load tab components
const DashboardPage = lazy(() => import('./modules/finance/presentation/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage = lazy(() => import('./modules/inventory/presentation/InventoryPage').then(m => ({ default: m.InventoryPage })));
const StaffPage = lazy(() => import('./modules/staff/presentation/StaffPage').then(m => ({ default: m.StaffPage })));
const CashflowPage = lazy(() => import('./modules/finance/presentation/CashflowPage').then(m => ({ default: m.CashflowPage })));
const AccountPage = lazy(() => import('./modules/staff/presentation/AccountPage').then(m => ({ default: m.AccountPage })));
const PersonalView = lazy(() => import('./components/PersonalView').then(m => ({ default: m.PersonalView })));
const SandboxPage = lazy(() => import('./modules/sandbox/presentation/SandboxPage').then(m => ({ default: m.SandboxPage })));

// Skeletons
import { DashboardSkeleton } from './modules/dashboard/presentation/DashboardSkeleton';
import { InventorySkeleton } from './modules/inventory/presentation/components/InventorySkeleton';
import { StaffSkeleton } from './modules/staff/presentation/components/StaffSkeleton';
import { CashflowSkeleton } from './modules/finance/presentation/components/CashflowSkeleton';

// Loading component for Suspense - will be replaced by specific skeletons
const TabLoading = () => <div className="animate-in fade-in duration-500 h-full w-full" />;

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  // Finance Module Dependencies (Shared across pages)
  const financePresenter = useMemo(() => {
    const expenseRepo = new SupabaseExpenseRepository();
    const vehicleRepo = new SupabaseVehicleRepository();
    const staffRepo = new SupabaseStaffRepository();

    return new FinancePresenter(
      new GetMonthlyFinance(expenseRepo, vehicleRepo, staffRepo),
      new GetFinancialOverview(expenseRepo, vehicleRepo, staffRepo),
      expenseRepo,
      vehicleRepo,
      staffRepo
    );
  }, []);

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthLoading(false);
      setIsAuthed(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthLoading(false);
      setIsAuthed(!!session?.user);
      if (!session?.user) setCurrentUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthed || !isAuthLoading) {
      setLoading(false);
    }
  }, [isAuthLoading, isAuthed]);

  // Current User Profile logic
  useEffect(() => {
    if (!isAuthed) return;

    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setIsAuthLoading(false);
          setLoading(false);
          return;
        }

        const { data } = await supabase.from('employees').select('*').eq('email', user.email).maybeSingle();
        
        if (data) {
          setCurrentUser({ ...data, docId: data.id });
          setIsAuthLoading(false);
          setLoading(false);
        } else {
          // Rogue session or deleted employee - Force logout for security
          console.error("Authenticated user has no employee profile. Cleaning up session.");
          toast.error("Tài khoản của bạn không có hồ sơ hợp lệ. Vui lòng liên hệ Admin.");
          
          setCurrentUser(null);
          setIsAuthed(false);
          await supabase.auth.signOut();
          
          setIsAuthLoading(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsAuthLoading(false);
        setLoading(false);
      }
    };

    if (isAuthed) {
      fetchProfile();
    }
  }, [isAuthed]);

  // Inventory/Dashboard shared state
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'AGING_25'>('ALL');
  const [inventoryAction, setInventoryAction] = useState('');

  const userRole = currentUser?.role || UserRole.STAFF;

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    const role = currentUser.role || UserRole.STAFF;
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.STAFF];
    return permissions.includes(permission);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setIsAuthed(false);
    await supabase.auth.signOut();
  };

  const handleDashboardAction = (tab: string, search = '', filter = 'ALL', action = '') => {
    setActiveTab(tab);
    if (tab === 'inventory') {
      setInventorySearch(search);
      setInventoryFilter(filter as any);
      setInventoryAction(action);
    }
  };

  const handleUpdateUser = async (email: string, data: any) => {
    try {
      const { error } = await supabase.from('employees').update(data).eq('email', email);
      if (error) throw error;
      
      // Update local state
      setCurrentUser((prev: any) => {
        if (!prev || prev.email !== email) return prev;
        return { ...prev, ...data };
      });
    } catch (err: any) {
      console.error("Error updating user:", err);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  if (!currentUser && !isAuthLoading && !isAuthed) return <Login onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen bg-kraft-bg relative overflow-hidden flex flex-col p-0">
      <Toaster position="top-right" expand={true} richColors closeButton />
      <div className="w-full flex flex-col flex-1">
        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          onLogout={handleLogout}
          hasPermission={hasPermission}
          isLoading={isAuthLoading || !currentUser}
          onInventoryClick={() => {
            setInventorySearch('');
            setInventoryFilter('ALL');
            setInventoryAction('');
            setActiveTab('inventory');
          }}
        />

        <main className="liquid-card flex-1 p-0 relative z-20 -mt-[1px] pb-24 xl:pb-6 rounded-none border-x-0 overflow-hidden">
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
            loading={loading || isAuthLoading || !currentUser}
          />

          <footer className="mt-12 pt-8 border-t border-white/20 hidden xl:block">
            <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-kraft-accent font-black tracking-[0.25em] px-4 opacity-60">
              <p className="uppercase">© 2026 AUTO 28 Showroom Manager • Liquid Glass Edition</p>
              <div className="flex gap-10">
                <span className="flex items-center gap-2.5 uppercase">Hệ thống: <span className="text-kraft-accent font-black flex items-center gap-2"><div className="w-1.5 h-1.5 bg-kraft-accent rounded-full animate-pulse" /> Ổn định</span></span>
                <span className="uppercase">Phiên bản: <span className="font-black text-kraft-ink">1.0.0</span></span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

const MainContent = ({
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
}: any) => {

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
        return hasPermission(PERMISSIONS.VIEW_INVENTORY) && <InventoryPage userRole={userRole} currentUser={currentUser} initialSearch={inventorySearch} initialFilter={inventoryFilter} initialAction={inventoryAction} />;
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
      <Suspense fallback={<TabLoading />}>
        {content}
      </Suspense>
    </div>
  );
};
