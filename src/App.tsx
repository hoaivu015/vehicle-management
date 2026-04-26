import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Toaster } from 'sonner';
import { cn } from './utils/cn';
import { UserRole } from './shared/domain/constants';
import { useAuth } from './hooks/useAuth';
import { useFinance } from './hooks/useFinance';
import { MainContent } from './components/MainContent';
import { MobileBottomNavContainer } from './components/MobileBottomNavContainer';

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    isAuthLoading,
    isAuthed,
    hasPermission,
    handleLogout,
    handleUpdateUser
  } = useAuth();

  const { financePresenter } = useFinance();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'AGING_25'>('ALL');
  const [inventoryAction, setInventoryAction] = useState('');

  // Reset scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleDashboardAction = (tab: string, search = '', filter = 'ALL', action = '') => {
    setActiveTab(tab);
    if (tab === 'inventory') {
      setInventorySearch(search);
      setInventoryFilter(filter as any);
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
  const isLoading = isAuthLoading || (isAuthed && !currentUser);

  if (!currentUser && !isAuthLoading && !isAuthed) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col p-0">
      <Toaster position="top-right" expand={true} richColors closeButton />
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
          "ctab-panel flex-1 p-0 relative pb-24 xl:pb-6 overflow-hidden transition-colors duration-700 xl:-mt-px",
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
              <p className="uppercase">© 2026 AUTO 28 Showroom Manager • Liquid Glass Edition</p>
              <div className="flex gap-10">
                <span className="flex items-center gap-2.5 uppercase">
                  Hệ thống: <span className="text-kraft-accent font-black flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-kraft-accent rounded-full animate-pulse" /> Ổn định
                  </span>
                </span>
                <span className="uppercase">Phiên bản: <span className="font-black text-kraft-ink">1.0.0</span></span>
              </div>
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
        />
      )}
    </div>
  );
}
