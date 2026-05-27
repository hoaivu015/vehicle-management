import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  subValue?: string;
  isNegative?: boolean;
  isWarning?: boolean;
  onClick?: () => void;
  actionIcon?: React.ElementType;
  onActionClick?: (e: React.MouseEvent) => void;
  tooltip?: string;
}

interface DashboardStatGridProps {
  stats: Stat[];
}

export const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({ stats }) => {
  const [hoveredLabel, setHoveredLabel] = React.useState<string | null>(null);
  const [clickedLabel, setClickedLabel] = React.useState<string | null>(null);

  const handleToggle = (label: string) => {
    setClickedLabel(prev => prev === label ? null : label);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-g3 md:gap-g4">
      {stats.map((stat, _i) => {
        const isActive = clickedLabel === stat.label || hoveredLabel === stat.label;

        return (
          <div key={stat.label} className="relative group/card">
            <AnimatePresence>
              {isActive && stat.tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 bg-kraft-ink/95 backdrop-blur-2xl text-white rounded-t2 shadow-kraft-deep border border-white/10 w-[85vw] sm:w-auto sm:max-w-xs pointer-events-none"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                  <p className="text-lg font-black tracking-tight text-white break-words">{stat.tooltip}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-kraft-ink/95 rotate-45 border-r border-b border-hairline-soft" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: _i * 0.05 }}
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHoveredLabel(stat.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onClick={(_e) => {
                if (stat.onClick) {
                  stat.onClick();
                } else if (stat.tooltip) {
                  handleToggle(stat.label);
                }
              }}
              className={cn(
                "relative h-full p-g3 md:p-g4 rounded-t2 border transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-kraft-deep active:scale-[0.98] active:brightness-95 native-interactive",
                stat.isWarning
                  ? "bg-expense-light/40 border-expense/20 hover:bg-expense-light/60"
                  : "bg-white border-black/5 hover:bg-white/80",
                isActive && "border-kraft-accent/40 bg-white/90 shadow-kraft-accent/10"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                   "w-14 h-14 rounded-xl md:rounded-t2 flex items-center justify-center shadow-inner border border-white/20 transition-all duration-500 group-hover/card:rotate-12",
                   stat.isWarning
                     ? "bg-expense-light text-expense"
                     : "bg-kraft-accent/10 text-kraft-accent group-hover/card:bg-kraft-accent group-hover/card:text-white"
                )}>
                  <stat.icon size={24} />
                </div>

                {stat.actionIcon && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e: React.MouseEvent) => {
                       e.stopPropagation();
                       stat.onActionClick?.(e);
                    }}
                    className="w-11 h-11 bg-white/60 rounded-xl border border-hairline-soft text-sub-label hover:text-kraft-accent hover:border-kraft-accent/40 shadow-sm transition-all flex items-center justify-center"
                    title="Hành động nhanh"
                  >
                    <stat.actionIcon size={18} />
                  </motion.button>
                )}
              </div>

              <div className="space-y-1">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
                  stat.isWarning ? "text-expense/60" : "text-kraft-ink/60"
                )}>
                  {stat.label}
                </p>
                <h4 className={cn(
                  "text-xl sm:text-2xl md:text-[28px] font-black tracking-tighter leading-tight break-all",
                  stat.isNegative ? "text-expense" : "text-kraft-ink"
                )}>
                  {stat.value}
                </h4>
                {stat.subValue && (
                  <div className="flex items-center gap-2 pt-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      stat.isWarning ? "bg-expense" : "bg-kraft-accent"
                    )} />
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.15em]",
                      stat.isWarning ? "text-expense/60" : "text-kraft-ink/60"
                    )}>
                      {stat.subValue}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};
