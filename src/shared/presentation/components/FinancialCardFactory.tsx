import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatVND } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';

export interface FinancialCardProps {
  title: string;
  value: number;
  icon?: LucideIcon;
  trend?: number; // percentage
  trendLabel?: string;
  loading?: boolean;
  color?: 'blue' | 'green' | 'amber' | 'rose' | 'indigo' | 'emerald';
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  blue: 'from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50',
  green: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-200/50',
  emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-200/50',
  amber: 'from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-200/50',
  rose: 'from-rose-500/10 to-rose-600/5 text-rose-600 border-rose-200/50',
  indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-600 border-indigo-200/50',
};

const iconBgMap = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
  indigo: 'bg-indigo-100 text-indigo-600',
};

/**
 * FinancialCardFactory
 * 
 * A factory for creating premium, animated financial summary cards.
 */
export const FinancialCard: React.FC<FinancialCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading = false,
  color = 'blue',
  className,
  onClick,
}) => {
  if (loading) {
    return (
      <div className={cn("animate-pulse bg-white border border-gray-100 rounded-2xl p-6 h-32", className)} />
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-gradient-to-br border rounded-2xl p-6 transition-all duration-300",
        onClick ? "cursor-pointer hover:shadow-xl hover:shadow-gray-200/50" : "shadow-sm",
        colorMap[color],
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 opacity-80">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">
            {formatVND(value)}
          </h3>
          
          {trend !== undefined && (
            <div className="flex items-center mt-2 space-x-1.5">
              <span className={cn(
                "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full",
                trend > 0 ? "bg-emerald-100 text-emerald-700" : 
                trend < 0 ? "bg-rose-100 text-rose-700" : 
                "bg-gray-100 text-gray-700"
              )}>
                {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : 
                 trend < 0 ? <TrendingDown size={12} className="mr-1" /> : 
                 <Minus size={12} className="mr-1" />}
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{trendLabel}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn("p-3 rounded-xl transition-transform duration-500 hover:rotate-12", iconBgMap[color])}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {/* Decorative Background Element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
};

/**
 * Factory functions to create specific types of financial cards quickly
 */
export const FinancialCardFactory = {
  Profit: (props: Omit<FinancialCardProps, 'color' | 'icon'>) => (
    <FinancialCard {...props} color="emerald" icon={TrendingUp} />
  ),
  Expense: (props: Omit<FinancialCardProps, 'color' | 'icon'>) => (
    <FinancialCard {...props} color="rose" icon={TrendingDown} />
  ),
  Balance: (props: Omit<FinancialCardProps, 'color' | 'icon'>) => (
    <FinancialCard {...props} color="blue" />
  ),
  Warning: (props: Omit<FinancialCardProps, 'color' | 'icon'>) => (
    <FinancialCard {...props} color="amber" />
  ),
};
