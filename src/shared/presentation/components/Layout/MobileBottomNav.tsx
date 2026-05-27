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
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-[9999] h-[calc(60px+env(safe-area-inset-bottom,16px))] bg-white/80 dark:bg-[#161a23]/75 backdrop-blur-[32px] border-t border-black/5 dark:border-white/10 px-4 pt-1.5 pb-[env(safe-area-inset-bottom,12px)] flex items-center justify-between shadow-[0_-8px_32px_rgba(0,0,0,0.06)] native-interactive hardware-acceleration will-change-transform">
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
              <div key={item.id} className="flex justify-center items-center h-full">
                <motion.button 
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                  onClick={async () => {
                    try { await haptics.light(); } catch (err) {}
                    item.onClick();
                  }}
                  className="relative -top-5 flex flex-col items-center justify-center h-13 w-13 bg-gradient-to-tr from-kraft-accent to-[#818cf8] text-white rounded-full border-[3px] border-white dark:border-[#161a23]/90 shadow-[0_6px_24px_rgba(99,102,241,0.3),inset_0_1px_2px_rgba(255,255,255,0.45)] z-20 cursor-pointer will-change-transform"
                >
                  <item.icon size={22} strokeWidth={2.5} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                </motion.button>
              </div>
            );
          }

          return (
            <button 
              key={item.id} 
              onClick={async () => {
                try { await haptics.light(); } catch (err) {}
                item.onClick();
              }} 
              className={cn(
                "relative flex-1 h-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 select-none outline-none z-10",
                isActive ? "text-kraft-accent" : "text-kraft-ink/65 dark:text-white/65"
              )}
            >
              <div className="relative flex flex-col items-center justify-center h-full w-full">
                {/* Viên thuốc chỉ báo (Indicator) cao cấp bọc quanh icon */}
                <div className="relative w-14 h-8 flex items-center justify-center">
                  {isActive && (
                    <motion.div 
                      layoutId="navPill"
                      className="absolute inset-0 bg-gradient-to-tr from-kraft-accent/12 to-kraft-accent/2 dark:from-kraft-accent/25 dark:to-kraft-accent/5 backdrop-blur-md rounded-full border border-kraft-accent/15 dark:border-kraft-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_8px_rgba(99,102,241,0.06)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <item.icon 
                    size={20} 
                    strokeWidth={2}
                    className={cn(
                      "relative z-10 transition-transform duration-300",
                      isActive ? "scale-110 text-kraft-accent" : "text-kraft-ink/50 dark:text-white/50"
                    )} 
                  />
                </div>
                
                {/* Chữ vi mô chuẩn quang học hiển thị ngay dưới viên thuốc */}
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest leading-none mt-1 transition-all duration-300",
                  isActive ? "text-kraft-accent font-black scale-102" : "text-kraft-ink/45 dark:text-white/40 font-bold"
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
