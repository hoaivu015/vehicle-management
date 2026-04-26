import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Wallet,
  Car,
  CircleDollarSign,
  ShoppingBag,
  AlertCircle,
  Coins,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { cn } from '../../../../utils/cn';

interface Stat {
  label: string;
  value: string | number;
  icon: any;
  subValue?: string;
  isNegative?: boolean;
  isWarning?: boolean;
  onClick?: () => void;
  actionIcon?: any;
  onActionClick?: (e: React.MouseEvent) => void;
}

interface DashboardStatGridProps {
  stats: Stat[];
}

export const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={stat.onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              stat.onClick?.();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Thống kê ${stat.label}: ${stat.value}`}
          className={cn(
            "relative group p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl",
            stat.isWarning
              ? "bg-red-50/40 border-red-200/60 hover:bg-red-50/60"
              : "bg-white/40 border-white/60 hover:bg-white/60"
          )}
        >
          {/* Background Gradient Accents */}
          <div className={cn(
            "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40",
            stat.isWarning ? "bg-red-500" : "bg-kraft-accent"
          )} />

          <div className="flex justify-between items-start mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border transition-all duration-500 group-hover:rotate-12",
              stat.isWarning
                ? "bg-red-100/50 text-red-600 border-red-200"
                : "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/10 group-hover:bg-kraft-accent group-hover:text-white"
            )}>
              <stat.icon size={24} />
            </div>

            {stat.actionIcon && (
              <button
                onClick={stat.onActionClick}
                className="p-3 bg-white/60 rounded-xl border border-white/80 text-kraft-ink/40 hover:text-kraft-accent hover:border-kraft-accent/40 shadow-sm transition-all active:scale-95"
                title="Hành động nhanh"
              >
                <stat.actionIcon size={18} />
              </button>
            )}
          </div>

          <div className="space-y-1">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
              stat.isWarning ? "text-red-500/60" : "text-kraft-ink/40"
            )}>
              {stat.label}
            </p>
            <h4 className={cn(
              "text-3xl font-black tracking-tighter leading-tight",
              stat.isNegative ? "text-red-600" : "text-kraft-ink"
            )}>
              {stat.value}
            </h4>
            {stat.subValue && (
              <div className="flex items-center gap-2 pt-2">
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  stat.isWarning ? "bg-red-500" : "bg-kraft-accent"
                )} />
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  stat.isWarning ? "text-red-500/40" : "text-kraft-ink/40"
                )}>
                  {stat.subValue}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
