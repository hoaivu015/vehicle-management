import { Bell, LogOut } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { HeaderSkeleton } from '@/src/shared/design-system/HeaderSkeleton';
import { UserRole, USER_ROLE_LABELS } from '@/src/shared/domain/constants';
import { useNavigation } from '@/src/shared/presentation/hooks/useNavigation';
import { motion } from 'motion/react';

const logo = "/logo_auto28.jpg";

import { Staff } from '@/src/shared/domain/types';

interface HeaderProps {
  currentUser: Staff | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onLogout: () => void;
  onInventoryClick: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading?: boolean;
}

export const Header = ({ currentUser, activeTab, setActiveTab, onLogout, onInventoryClick, hasPermission, isLoading = false }: HeaderProps) => {
  const navItems = useNavigation(currentUser, setActiveTab, onInventoryClick, hasPermission);

  if (isLoading) return <HeaderSkeleton />;

  return (
    <>
      {/* Mobile Header (Native Style) */}
      <header className="xl:hidden flex items-center justify-between px-5 pt-[env(safe-area-inset-top,12px)] pb-2 bg-white/80 backdrop-blur-3xl border-b border-black/5 sticky top-0 z-[100] transition-all">
        <div className="flex items-center gap-3 active:scale-95 transition-transform" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-white p-1 rounded-xl shadow-md border border-kraft-accent/10 w-9 h-9 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-apple-headline text-kraft-ink uppercase">AUTO 28</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 glass-purity-surface rounded-xl text-kraft-accent relative active-press">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-kraft-red rounded-full border-2 border-white" />
          </button>
          <div onClick={() => setActiveTab('personal')} className="w-9 h-9 rounded-xl glass-purity-surface flex items-center justify-center text-kraft-accent font-black shadow-sm active-press ml-1 overflow-hidden">
            {currentUser?.name?.charAt(0) || 'N'}
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden xl:flex items-center justify-between px-8 py-3.5 relative border-b border-black/[0.04] bg-white z-[90]">
        <div className="flex items-center gap-8 shrink-0">
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-white p-1 rounded-xl shadow-md border border-kraft-accent/10 w-9 h-9 flex items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-lg tracking-tighter text-kraft-ink uppercase shrink-0 whitespace-nowrap">AUTO 28</span>
          </div>
          
          <nav className="flex items-center gap-1 bg-kraft-ink/[0.04] p-1 rounded-full border border-black/[0.04] backdrop-blur-xl relative h-10 transition-all duration-300">
            {navItems.filter(item => item.visible !== false).map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="relative flex items-center justify-center h-8 px-4 rounded-full transition-all active:scale-95 cursor-pointer z-10 group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktopTabPill"
                      className="absolute inset-0 bg-white shadow-[0_3px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] rounded-full z-0 border border-black/5"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon size={13} className={cn("transition-all duration-300", isActive ? "scale-110 text-kraft-accent" : "text-kraft-ink/60 group-hover:text-kraft-ink/90")} />
                    <span className={cn("text-[10px] uppercase tracking-[0.12em] transition-all duration-300", isActive ? "text-kraft-ink font-black" : "text-kraft-ink/65 font-bold group-hover:text-kraft-ink/90")}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div onClick={() => setActiveTab('personal')} className="flex items-center gap-3 pr-6 border-r border-kraft-accent/10 cursor-pointer hover:opacity-80 transition-opacity shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-kraft-ink truncate max-w-[120px] shrink-0 whitespace-nowrap">{currentUser?.name || 'Người dùng'}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-kraft-ink/50 shrink-0 whitespace-nowrap">{USER_ROLE_LABELS[currentUser?.role as UserRole] || currentUser?.role || 'Khách'}</p>
            </div>
            <div className="w-9 h-9 rounded-xl glass-purity-surface flex items-center justify-center text-kraft-accent font-black shadow-sm shrink-0 text-sm">{currentUser?.name?.charAt(0) || 'N'}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2.5 glass-purity-surface rounded-xl text-kraft-accent relative shadow-sm hover:scale-105 active:scale-95 transition-transform"><Bell size={15} /><span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-kraft-red rounded-full border-2 border-white" /></button>
            <button onClick={onLogout} className="p-2.5 glass-purity-surface text-kraft-ink rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-transform" title="Đăng xuất"><LogOut size={15} /></button>
          </div>
        </div>
      </header>

    </>
  );
};


