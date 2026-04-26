import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';
import { NavItem } from '../hooks/useNavigation';

export const MobileBottomNav = ({ navItems, activeTab }: { navItems: NavItem[], activeTab: string }) => {
  const visibleItems = navItems.filter(item => item.visible !== false && !item.hideOnMobile);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <nav className="xl:hidden fixed inset-x-0 bottom-6 mx-6 bg-white/90 backdrop-blur-3xl border border-white/50 z-[9999] px-2 py-2 rounded-full flex justify-around items-center shadow-2xl pointer-events-auto">
      {visibleItems.map(item => (
        <button key={item.id} onClick={item.onClick} className={cn("flex flex-col items-center gap-1 p-2 transition-all relative flex-1 min-w-0 max-w-[80px]", activeTab === item.id ? "text-kraft-accent" : "text-kraft-ink/30")}>
          <item.icon size={20} className={cn("transition-transform relative z-10", activeTab === item.id && "scale-110")} />
          <span className="text-[8px] font-black uppercase tracking-widest truncate w-full text-center relative z-10">{item.label}</span>
          {activeTab === item.id && <motion.div layoutId="bottomNavIndicator" className="absolute inset-0 bg-kraft-accent/5 rounded-full border border-kraft-accent/10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
        </button>
      ))}
    </nav>,
    document.body
  );
};
