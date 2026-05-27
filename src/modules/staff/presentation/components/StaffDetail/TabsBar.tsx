import { cn } from '@/src/shared/utils/cn';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface Tab<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
  count: number;
}

interface TabsBarProps<T extends string = string> {
  tabs: Tab<T>[];
  activeTab: T;
  setActiveTab: (id: T) => void;
}

export const TabsBar = <T extends string>({ tabs, activeTab, setActiveTab }: TabsBarProps<T>) => {
  return (
    <div className="px-6 md:px-8 py-4 shrink-0 flex items-center justify-between">
      <nav className="flex items-center gap-1 bg-kraft-ink/[0.04] p-1 rounded-full border border-black/[0.04] backdrop-blur-xl relative h-10 w-fit transition-all duration-300">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center justify-center h-8 px-5 rounded-full transition-all active:scale-95 cursor-pointer z-10 group"
            >
              {isActive && (
                <motion.div
                  layoutId="staffDetailTabPill"
                  className="absolute inset-0 bg-white shadow-[0_3px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] rounded-full z-0 border border-black/5"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon size={13} className={cn("transition-all duration-300", isActive ? "scale-110 text-kraft-accent" : "text-kraft-ink/60 group-hover:text-kraft-ink/90")} />
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.12em] transition-all duration-300",
                  isActive ? "text-kraft-ink font-black" : "text-kraft-ink/65 font-bold group-hover:text-kraft-ink/90"
                )}>
                  {tab.label}
                </span>
                <span className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black transition-all duration-300",
                  isActive ? "bg-kraft-accent/10 text-kraft-accent" : "bg-black/5 text-kraft-ink/30 group-hover:text-kraft-ink/50"
                )}>
                  {tab.count}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
