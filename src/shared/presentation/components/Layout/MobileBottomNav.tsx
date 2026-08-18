import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { NavItem } from '@/src/shared/presentation/hooks/useNavigation';
import { haptics } from '@/src/shared/utils/haptics';

export const MobileBottomNav = ({ navItems, activeTab }: { navItems: NavItem[], activeTab: string }) => {
  const rawVisibleItems = navItems.filter(item => item.visible !== false && !item.hideOnMobile);
  
  // Sắp xếp tự động: Đưa nút Action vào vị trí trung tâm của danh sách hiển thị
  const visibleItems = useMemo(() => {
    const actionItem = rawVisibleItems.find(item => item.isAction);
    if (!actionItem) return rawVisibleItems;

    const itemsWithoutAction = rawVisibleItems.filter(item => item.id !== actionItem.id);
    const centerIndex = Math.floor(rawVisibleItems.length / 2);
    
    const result = [...itemsWithoutAction];
    result.splice(centerIndex, 0, actionItem);
    return result;
  }, [rawVisibleItems]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-[9999] h-[calc(62px+env(safe-area-inset-bottom,16px))] bg-white/90 dark:bg-[#12161f]/90 backdrop-blur-[32px] border-t border-black/[0.06] dark:border-white/10 px-3 pt-1.5 pb-[env(safe-area-inset-bottom,14px)] flex items-center justify-between shadow-[0_-8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.4)] native-interactive hardware-acceleration will-change-transform">
      <nav className={cn(
        "grid w-full h-full relative items-center",
        visibleItems.length === 5 ? "grid-cols-5" : 
        visibleItems.length === 4 ? "grid-cols-4" : 
        visibleItems.length === 3 ? "grid-cols-3" : "flex justify-around"
      )}>
        {visibleItems.map((item: NavItem) => {
          const isActive = activeTab === item.id;
          const isAction = item.isAction;

          if (isAction) {
            return (
              <div key={item.id} className="relative flex justify-center items-center h-full">
                {/* Frosted Dock Aura - Vầng kính mờ sáng ôm chân nút (+) chuẩn Light Mode */}
                <div className="absolute -top-6 w-[58px] h-[58px] rounded-full bg-white/70 dark:bg-[#12161f]/60 backdrop-blur-md shadow-sm -z-10 pointer-events-none" />

                <motion.button 
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  onClick={async () => {
                    try { await haptics.light(); } catch { /* ignore haptics error */ }
                    item.onClick();
                  }}
                  className="relative -top-5 flex flex-col items-center justify-center w-[52px] h-[52px] bg-gradient-to-tr from-kraft-accent via-[#6366f1] to-[#818cf8] text-white rounded-full border-[3px] border-white dark:border-[#12161f] shadow-[0_8px_24px_rgba(99,102,241,0.35),inset_0_1px_2px_rgba(255,255,255,0.7)] z-20 cursor-pointer will-change-transform active:shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition-shadow duration-200"
                >
                  <item.icon size={23} strokeWidth={2.5} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                </motion.button>
              </div>
            );
          }

          return (
            <button 
              key={item.id} 
              onClick={async () => {
                try { await haptics.light(); } catch { /* ignore haptics error */ }
                item.onClick();
              }} 
              className={cn(
                "relative flex-1 min-h-[48px] h-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 select-none outline-none z-10 cursor-pointer",
                isActive ? "text-kraft-accent dark:text-[#818cf8]" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <div className="relative flex flex-col items-center justify-center h-full w-full">
                {/* Active Indicator Pill - Chuẩn kính lỏng trong suốt sáng */}
                <div className="relative w-[48px] h-[30px] flex items-center justify-center">
                  {isActive && (
                    <motion.div 
                      layoutId="mobileNavPill"
                      className="absolute inset-0 bg-kraft-accent/10 dark:bg-kraft-accent/25 backdrop-blur-md rounded-full border border-kraft-accent/15 dark:border-kraft-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(99,102,241,0.08)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={cn(
                      "relative z-10 transition-all duration-300",
                      isActive ? "scale-[1.08] text-kraft-accent dark:text-[#818cf8]" : "text-slate-500 dark:text-slate-400"
                    )} 
                  />
                </div>
                
                {/* Nhãn chữ vi mô độ nét cao chuẩn Light Mode mặc định */}
                <span className={cn(
                  "text-[9.5px] font-black uppercase tracking-wider leading-none mt-1 transition-all duration-300 whitespace-nowrap",
                  isActive ? "text-kraft-accent dark:text-[#818cf8] scale-[1.02]" : "text-slate-600 dark:text-slate-300 font-bold"
                )}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>,
    document.body
  );
};
