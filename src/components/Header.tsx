import React, { useState } from 'react';
import { Bell, LogOut, Menu, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { HeaderSkeleton } from './HeaderSkeleton';
import { UserRole, USER_ROLE_LABELS } from '../shared/domain/constants';
import { useNavigation } from '../hooks/useNavigation';

const logo = "/logo_auto28.jpg";

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

export const Header = ({ currentUser, activeTab, setActiveTab, onLogout, onInventoryClick, hasPermission, isLoading = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = useNavigation(currentUser, setActiveTab, onInventoryClick, hasPermission);

  if (isLoading) return <HeaderSkeleton />;

  return (
    <>
      <header className="hidden xl:flex flex-col xl:flex-row xl:items-end justify-between px-4 md:px-8 gap-4 xl:gap-0 relative pt-2 md:pt-4 pb-0">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4 xl:gap-8 w-full xl:w-auto pb-0">
          <div className="flex items-center justify-between xl:justify-start gap-3 relative min-h-[48px] md:min-h-[56px]">
            <div className="flex items-center gap-2 md:gap-3 xl:static absolute left-1/2 -translate-x-1/2 xl:left-0 xl:translate-x-0 transition-all">
              <div className="bg-white p-1 rounded-xl shadow-lg border border-kraft-accent/10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden"><img src={logo} alt="Logo" className="w-full h-full object-cover" /></div>
              <span className="font-black text-lg md:text-xl tracking-tighter text-kraft-ink uppercase">AUTO 28</span>
            </div>
          </div>
          <nav className="hidden xl:flex ctab-bar">
            {navItems.filter(item => item.visible !== false).map(item => (
              <TabButton key={item.id} active={activeTab === item.id} onClick={item.onClick} icon={item.icon} label={item.label} />
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between xl:justify-end gap-4 md:gap-6 w-full xl:w-auto">
          <div onClick={() => setActiveTab('personal')} className="flex items-center gap-3 md:gap-4 pr-4 md:pr-6 border-r border-kraft-accent/10 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-kraft-ink truncate max-w-[100px]">{currentUser?.name || 'Người dùng'}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{USER_ROLE_LABELS[currentUser?.role as UserRole] || currentUser?.role || 'Khách'}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/40 flex items-center justify-center text-kraft-accent font-black border border-white/40 shadow-sm shrink-0 text-xs md:text-base">{currentUser?.name?.charAt(0) || 'N'}</div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button className="p-2.5 md:p-3.5 bg-white/40 rounded-xl text-kraft-accent relative border border-white/40 shadow-sm"><Bell size={16} /><span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-kraft-red rounded-full border-2 border-white" /></button>
            <button onClick={onLogout} className="p-2.5 md:p-3.5 bg-white/40 text-kraft-ink rounded-xl border border-white/40 shadow-sm" title="Đăng xuất"><LogOut size={16} /></button>
            <button onClick={() => setIsMenuOpen(true)} className="xl:hidden p-2.5 bg-white/40 rounded-xl text-kraft-accent border border-white/40"><Menu size={16} /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && <MobileSidebar currentUser={currentUser} activeTab={activeTab} navItems={navItems} onClose={() => setIsMenuOpen(false)} onLogout={onLogout} />}
      </AnimatePresence>
    </>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button type="button" onClick={onClick} className={cn("ctab", active && "ctab-active")}>
    <div className="flex items-center gap-2 relative z-10 px-1">
      <Icon size={14} className={cn("transition-all", active ? "scale-110 text-kraft-accent" : "opacity-40")} />
      <span className={cn("text-[10px] uppercase tracking-[0.2em] transition-all", active ? "text-kraft-ink font-black" : "text-kraft-ink/30 font-bold")}>{label}</span>
    </div>
  </button>
);

const MobileSidebar = ({ currentUser, activeTab, navItems, onClose, onLogout }: any) => (
  <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-kraft-ink/20 backdrop-blur-sm z-[60] xl:hidden" />
    <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 left-0 bottom-0 w-72 bg-white/90 backdrop-blur-3xl z-[70] xl:hidden shadow-2xl border-r border-white/50 p-6 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-lg border border-kraft-accent/10 w-10 h-10 flex items-center justify-center"><img src={logo} alt="Logo" className="w-full h-full object-cover" /></div>
          <span className="font-black text-xl tracking-tighter text-kraft-ink uppercase">AUTO 28</span>
        </div>
        <button onClick={onClose} className="p-2 text-kraft-ink/40"><CloseIcon size={20} /></button>
      </div>
      <div className="flex flex-col gap-3">
        {navItems.filter((item: any) => item.visible !== false).map((item: any) => (
          <button key={item.id} onClick={() => { item.onClick(); onClose(); }} className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] relative overflow-hidden", activeTab === item.id ? "text-white" : "text-kraft-ink/40")}>
            {activeTab === item.id && <motion.div layoutId="mobileActivePill" className="absolute inset-0 bg-kraft-accent shadow-lg" />}
            <item.icon size={18} className="relative z-10" /><span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto pt-6 border-t border-black/5">
        <div className="flex items-center gap-3 mb-6 p-2">
          <div className="w-10 h-10 rounded-xl bg-kraft-accent/10 flex items-center justify-center text-kraft-accent font-black border border-kraft-accent/20">{currentUser?.name?.charAt(0) || 'N'}</div>
          <div><p className="text-xs font-black text-kraft-ink">{currentUser?.name || 'Người dùng'}</p><p className="text-[10px] font-bold uppercase opacity-60">{USER_ROLE_LABELS[currentUser?.role as UserRole] || currentUser?.role}</p></div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-4 p-4 w-full rounded-2xl text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-xs"><LogOut size={18} />Đăng xuất</button>
      </div>
    </motion.div>
  </>
);
