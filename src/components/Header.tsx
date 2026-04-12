import React, { useState } from 'react';
const logo = "/logo_auto28.jpg";
import { Car, Bell, LogOut, LayoutDashboard, Users, User, CircleDollarSign, Menu, X as CloseIcon, Beaker, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { Skeleton } from './Skeleton';
import { HeaderSkeleton } from './HeaderSkeleton';
import { UserRole, USER_ROLE_LABELS } from '../shared/domain/constants';

interface HeaderProps {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  onLogout: () => void;
  onInventoryClick: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading?: boolean;
}

export const Header = ({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  userRole, 
  onLogout,
  onInventoryClick,
  hasPermission,
  isLoading = false
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Báo cáo', 
      icon: LayoutDashboard, 
      onClick: () => setActiveTab('dashboard'),
      visible: hasPermission('VIEW_DASHBOARD')
    },
    { 
      id: 'inventory', 
      label: 'Kho xe', 
      icon: Car, 
      onClick: onInventoryClick,
      visible: hasPermission('VIEW_INVENTORY')
    },
    { 
      id: 'staff', 
      label: 'Nhân sự', 
      icon: Users, 
      onClick: () => setActiveTab('staff'),
      visible: hasPermission('VIEW_STAFF')
    },
    { 
      id: 'cashflow', 
      label: 'Dòng tiền', 
      icon: CircleDollarSign, 
      onClick: () => setActiveTab('cashflow'),
      visible: hasPermission('VIEW_CASHFLOW')
    },
    { 
      id: 'personal', 
      label: 'Cá nhân', 
      icon: User, 
      onClick: () => setActiveTab('personal'),
      visible: hasPermission('VIEW_PERSONAL')
    },
    { 
      id: 'users', 
      label: 'Tài khoản', 
      icon: Shield, 
      onClick: () => setActiveTab('users'),
      visible: hasPermission('MANAGE_USERS')
    },
    { 
      id: 'sandbox', 
      label: 'Thử nghiệm', 
      icon: Beaker, 
      onClick: () => setActiveTab('sandbox'),
      visible: currentUser?.role === UserRole.ADMIN
    },
  ];

  const handleTabClick = (item: any) => {
    item.onClick();
    setIsMenuOpen(false);
  };

  if (isLoading) return <HeaderSkeleton />;

  return (
    <>
      <header className="hidden xl:flex flex-col xl:flex-row xl:items-end justify-between px-4 md:px-8 gap-4 xl:gap-0 relative pt-2 md:pt-4 pb-0">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-8 w-full xl:w-auto pb-0">
          <div className="flex items-center justify-between xl:justify-start gap-3 relative min-h-[48px] md:min-h-[56px]">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 bg-white/40 backdrop-blur-md rounded-xl text-kraft-accent border border-white/40 shadow-sm z-10"
            >
              {isMenuOpen ? <CloseIcon size={18} /> : <Menu size={18} />}
            </button>
  
            <div className="flex items-center gap-2 md:gap-3 xl:static absolute left-1/2 -translate-x-1/2 xl:left-0 xl:translate-x-0 transition-all duration-300">
              <div className="bg-white p-1 rounded-xl shadow-lg border border-kraft-accent/10 overflow-hidden flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                <img src={logo} alt="AUTO 28 Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-lg md:text-xl tracking-tighter text-kraft-ink uppercase">AUTO 28</span>
            </div>
            
            <div className="w-8 xl:hidden" /> {/* Spacer to balance the hamburger button for centering */}
          </div>
  
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-end gap-1">
            {navItems.filter(item => item.visible !== false).map(item => (
              <TabButton 
                key={item.id}
                active={activeTab === item.id} 
                onClick={item.onClick} 
                icon={item.icon} 
                label={item.label} 
              />
            ))}
          </nav>
        </div>
        
        <div className="flex items-center justify-between xl:justify-end gap-4 md:gap-6 w-full xl:w-auto">
          <div 
            onClick={() => setActiveTab('personal')}
            className={cn(
              "flex items-center gap-3 md:gap-4 pr-4 md:pr-6 border-r border-kraft-accent/10",
              "cursor-pointer hover:opacity-80 transition-opacity"
            )}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-kraft-ink truncate max-w-[100px] md:max-w-[120px]">{currentUser?.name || 'Người dùng'}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{USER_ROLE_LABELS[currentUser?.role as UserRole] || currentUser?.role || 'Khách'}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-kraft-accent font-black border border-white/40 shadow-sm shrink-0 text-xs md:text-base">
              {currentUser?.name?.charAt(0) || 'N'}
            </div>
          </div>
  
          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2.5 md:p-3.5 bg-white/40 backdrop-blur-md hover:bg-white/60 rounded-xl text-kraft-accent relative transition-all group border border-white/40 shadow-sm">
              <Bell size={16} className="group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-kraft-red rounded-full border-2 border-white shadow-lg" />
            </button>
            <button 
              onClick={onLogout}
              className="p-2.5 md:p-3.5 bg-white/40 backdrop-blur-md hover:bg-white/60 text-kraft-ink rounded-xl transition-all group border border-white/40 shadow-sm"
              title="Đăng xuất"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>
  
      {/* Mobile Navigation Menu (Sidebar) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-kraft-ink/20 backdrop-blur-sm z-[60] xl:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white/90 backdrop-blur-2xl z-[70] xl:hidden shadow-2xl border-r border-white/40 p-6 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-xl shadow-lg border border-kraft-accent/10 overflow-hidden flex items-center justify-center w-10 h-10">
                    <img src={logo} alt="AUTO 28 Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black text-xl tracking-tighter text-kraft-ink uppercase">AUTO 28</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-kraft-ink/40 hover:text-kraft-ink transition-colors">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.filter(item => item.visible !== false).map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs",
                      activeTab === item.id 
                        ? "bg-kraft-accent text-white shadow-lg shadow-kraft-accent/20" 
                        : "text-kraft-ink/60 hover:bg-kraft-accent/5 hover:text-kraft-accent"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-kraft-accent/10">
                <div className="flex items-center gap-3 mb-6 p-2">
                  <div className="w-10 h-10 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent font-black border border-kraft-accent/20">
                    {currentUser?.name?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-kraft-ink">{currentUser?.name || 'Người dùng'}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{USER_ROLE_LABELS[currentUser?.role as UserRole] || currentUser?.role || 'Khách'}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-4 p-4 w-full rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black uppercase tracking-widest text-xs"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  
      {/* Bottom Navigation for Mobile */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-2xl border-t border-white/40 z-[100] px-4 py-2 pb-safe flex justify-around items-center shadow-[0_-8px_30px_rgba(0,0,0,0.1)] transform-gpu">
        {navItems.filter(item => item.visible !== false).map(item => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all relative",
              activeTab === item.id ? "text-kraft-accent" : "text-kraft-ink/40"
            )}
          >
            <item.icon size={20} className={cn("transition-transform", activeTab === item.id && "scale-110")} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-kraft-accent rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    type="button"
    onClick={onClick}
    className={cn(
      "folder-tab group",
      active ? "folder-tab-active" : "folder-tab-inactive"
    )}
  >
    <div className="flex items-center gap-2 relative z-10">
      <Icon size={16} className={cn("transition-all duration-500", active ? "scale-110 text-kraft-accent" : "opacity-50")} />
      <span className={cn("text-[13px] font-bold uppercase tracking-wider transition-all duration-500", active ? "text-kraft-accent" : "text-kraft-ink/40")}>{label}</span>
    </div>
    {active && (
      <motion.div 
        layoutId="activeTabGlow"
        className="absolute inset-0 bg-kraft-accent/5 blur-xl rounded-t-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    )}
  </button>
);
