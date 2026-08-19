import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CircleDollarSign } from 'lucide-react';
import { formatCurrency } from '@/src/shared/utils/currency';
import { cn } from '@/src/shared/utils/cn';
import { motion } from 'motion/react';

interface CashflowMetricRibbonProps {
  openingBalance: number;
  revenue: number;
  totalOutflow: number;
  closingBalance: number;
  netCashflow: number;
  onShowCapital?: () => void;
  canEditCapital?: boolean;
}

export const CashflowMetricRibbon: React.FC<CashflowMetricRibbonProps> = ({
  openingBalance,
  revenue,
  totalOutflow,
  closingBalance,
  netCashflow,
  onShowCapital,
  canEditCapital = false
}) => {
  const cards = [
    {
      id: 'opening',
      label: 'SỐ DƯ ĐẦU KỲ',
      sublabel: 'Vốn chuyển kỳ trước',
      value: formatCurrency(openingBalance),
      icon: Wallet,
      color: 'slate',
      actionLabel: canEditCapital ? 'Chốt vốn' : undefined,
      onAction: onShowCapital
    },
    {
      id: 'inflow',
      label: 'TỔNG THỰC THU',
      sublabel: 'Cọc & thu bán xe',
      value: `+${formatCurrency(revenue)}`,
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      id: 'outflow',
      label: 'TỔNG THỰC CHI',
      sublabel: 'Mua xe, vận hành, lương',
      value: `-${formatCurrency(totalOutflow)}`,
      icon: TrendingDown,
      color: 'rose'
    },
    {
      id: 'closing',
      label: 'SỐ DƯ QUỸ HIỆN TẠI',
      sublabel: `Lưu chuyển: ${netCashflow >= 0 ? '+' : ''}${formatCurrency(netCashflow)}`,
      value: formatCurrency(closingBalance),
      icon: CircleDollarSign,
      color: 'accent',
      highlight: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 render-boundary-isolated">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isAccent = card.color === 'accent';
        const isEmerald = card.color === 'emerald';
        const isRose = card.color === 'rose';

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "relative p-5 md:p-6 rounded-[24px] border transition-all duration-300 flex flex-col justify-between group overflow-hidden shadow-sm",
              isAccent
                ? "bg-white/90 backdrop-blur-xl border-kraft-accent/30 shadow-kraft-deep hover:border-kraft-accent/50"
                : "bg-white/70 backdrop-blur-xl border-black/5 hover:border-black/10 hover:shadow-md"
            )}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                    isAccent
                      ? "bg-kraft-accent/10 text-kraft-accent border border-kraft-accent/20"
                      : isEmerald
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : isRose
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      : "bg-black/5 text-kraft-ink border border-black/10"
                  )}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none text-sub-label">
                    {card.label}
                  </span>
                  <span className="text-[11px] font-medium block mt-1 leading-tight text-sub-label opacity-70">
                    {card.sublabel}
                  </span>
                </div>
              </div>

              {card.actionLabel && card.onAction && (
                <button
                  type="button"
                  onClick={card.onAction}
                  className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/5 hover:bg-black/10 text-kraft-ink transition-colors active:scale-95 cursor-pointer"
                >
                  {card.actionLabel}
                </button>
              )}
            </div>

            {/* Value */}
            <div className="mt-5 pt-3 border-t border-hairline-soft flex items-baseline justify-between">
              <span
                className={cn(
                  "text-2xl sm:text-3xl font-black tracking-tighter leading-none",
                  isAccent
                    ? "text-kraft-ink"
                    : isEmerald
                    ? "text-emerald-600"
                    : isRose
                    ? "text-rose-600"
                    : "text-kraft-ink"
                )}
              >
                {card.value}
              </span>
            </div>

            {/* Subtle glow effect for accent card */}
            {isAccent && (
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-kraft-accent/5 rounded-full blur-2xl pointer-events-none" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
