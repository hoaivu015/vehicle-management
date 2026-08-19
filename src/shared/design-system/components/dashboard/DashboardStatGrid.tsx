import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { AnimatedNumber } from '@/src/shared/design-system/AnimatedNumber';

export interface Stat {
  label: string;
  value: string | number;
  numericValue?: number;
  isCurrency?: boolean;
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-g3 md:gap-g4">
      {stats.map((stat, _i) => {
        const isClickable = Boolean(stat.onClick);

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: _i * 0.04 }}
            whileHover={isClickable ? { y: -2 } : undefined}
            whileTap={isClickable ? { scale: 0.98 } : undefined}
            onClick={stat.onClick}
            className={cn(
              "group/card relative h-full p-g3 md:p-g4 rounded-t2 border transition-all duration-300 overflow-hidden shadow-sm backdrop-blur-md",
              isClickable && "cursor-pointer select-none native-interactive",
              stat.isWarning
                ? "bg-expense-light/40 border-expense/20 hover:bg-expense-light/60 hover:border-expense/40 hover:shadow-md"
                : "bg-white/80 border-white/80 hover:bg-white hover:border-kraft-accent/30 hover:shadow-kraft-deep"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl md:rounded-t2 flex items-center justify-center shadow-inner border border-white/20 transition-all duration-300 group-hover/card:scale-105",
                  stat.isWarning
                    ? "bg-expense-light text-expense"
                    : stat.isNegative
                    ? "bg-expense/10 text-expense border-expense/20"
                    : "bg-kraft-accent/10 text-kraft-accent group-hover/card:bg-kraft-accent group-hover/card:text-white"
                )}
              >
                <stat.icon size={24} />
              </div>

              {stat.actionIcon && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    stat.onActionClick?.(e);
                  }}
                  className="w-11 h-11 bg-white/70 hover:bg-white rounded-xl border border-hairline-soft text-sub-label hover:text-kraft-accent hover:border-kraft-accent/40 shadow-sm transition-all flex items-center justify-center cursor-pointer"
                  title="Hành động nhanh"
                >
                  <stat.actionIcon size={18} />
                </motion.button>
              )}
            </div>

            <div className="space-y-1">
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
                  stat.isWarning || stat.isNegative ? "text-expense/60" : "text-kraft-ink/60"
                )}
              >
                {stat.label}
              </p>
              <h4
                className={cn(
                  "text-xl sm:text-2xl md:text-[28px] font-black tracking-tighter leading-tight whitespace-nowrap truncate",
                  stat.isNegative ? "text-expense" : "text-kraft-ink"
                )}
              >
                {stat.numericValue !== undefined ? (
                  <AnimatedNumber value={stat.numericValue} isCurrency={stat.isCurrency ?? true} />
                ) : (
                  stat.value
                )}
              </h4>
              {stat.subValue && (
                <div className="flex items-center gap-2 pt-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      stat.isWarning || stat.isNegative ? "bg-expense" : "bg-kraft-accent"
                    )}
                  />
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.15em] truncate",
                      stat.isWarning || stat.isNegative ? "text-expense/60" : "text-kraft-ink/60"
                    )}
                  >
                    {stat.subValue}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
