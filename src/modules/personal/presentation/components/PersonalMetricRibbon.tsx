import React from 'react';
import { Wallet, Award, CheckCircle2, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedNumber } from '@/src/shared/design-system/AnimatedNumber';
import { cn } from '@/src/shared/utils/cn';

interface PersonalMetricRibbonProps {
  netSalary: number;
  isPaid: boolean;
  totalCommission: number;
  soldCarsCount: number;
  targetCount: number;
  completionRate: number;
  unreimbursedAmount: number;
  selectedMonth: string;
}

export const PersonalMetricRibbon: React.FC<PersonalMetricRibbonProps> = ({
  netSalary,
  isPaid,
  totalCommission,
  soldCarsCount,
  targetCount,
  completionRate,
  unreimbursedAmount,
  selectedMonth
}) => {
  const monthNum = selectedMonth.split('-')[1];

  const cards = [
    {
      label: `Thu nhập thực nhận (T${monthNum})`,
      value: netSalary,
      isCurrency: true,
      icon: Wallet,
      badge: isPaid ? "Đã chi lương" : "Dự tính",
      badgeColor: isPaid ? "text-income bg-income/10 border-income/20" : "text-kraft-accent bg-kraft-accent/10 border-kraft-accent/20",
      iconBg: "bg-income/10 text-income border-income/20",
      glowColor: "from-income/10 to-transparent",
      delay: 0.1
    },
    {
      label: "Hoa hồng & Thưởng tích lũy",
      value: totalCommission,
      isCurrency: true,
      icon: Award,
      badge: "Hoa hồng + Thưởng",
      badgeColor: "text-amber-600 bg-amber-50 border-amber-200",
      iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      glowColor: "from-amber-500/10 to-transparent",
      delay: 0.2
    },
    {
      label: "Tiến độ KPI bán xe",
      displayCustom: `${soldCarsCount} / ${targetCount || 0} xe`,
      icon: CheckCircle2,
      badge: targetCount > 0 ? `${Math.round(completionRate)}% KPI` : "Không áp KPI",
      badgeColor: targetCount > 0
        ? (completionRate >= 100 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-kraft-accent bg-kraft-accent/10 border-kraft-accent/20")
        : "text-sub-label bg-black/5 border-black/5",
      iconBg: "bg-kraft-accent/10 text-kraft-accent border-kraft-accent/20",
      glowColor: "from-kraft-accent/10 to-transparent",
      progress: targetCount > 0 ? completionRate : 0,
      delay: 0.3
    },
    {
      label: "Chi phí chờ hoàn ứng",
      value: unreimbursedAmount,
      isCurrency: true,
      icon: DollarSign,
      badge: unreimbursedAmount > 0 ? "Chờ duyệt chi" : "Không nợ ứng",
      badgeColor: unreimbursedAmount > 0 ? "text-expense bg-expense-light/40 border-expense/20" : "text-slate-500 bg-slate-100 border-slate-200",
      iconBg: unreimbursedAmount > 0 ? "bg-expense/10 text-expense border-expense/20" : "bg-black/5 text-sub-label border-black/5",
      glowColor: unreimbursedAmount > 0 ? "from-expense/10 to-transparent" : "from-black/5 to-transparent",
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: card.delay }}
          style={{ willChange: 'transform, opacity' }}
          className="group relative liquid-card !p-6 rounded-t2 border-hairline-soft overflow-hidden shadow-kraft-deep hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          {/* Subtle gradient glow */}
          <div className={cn(
            "absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl group-hover:opacity-40 transition-opacity pointer-events-none",
            card.glowColor
          )} />

          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110 duration-300",
              card.iconBg
            )}>
              <card.icon size={22} strokeWidth={2.5} />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border whitespace-nowrap shadow-sm",
              card.badgeColor
            )}>
              {card.badge}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-sub-label opacity-60 mb-1 line-clamp-1">
              {card.label}
            </p>
            <div className="text-2xl lg:text-3xl font-black text-kraft-ink tracking-tight whitespace-nowrap">
              {card.displayCustom ? (
                card.displayCustom
              ) : (
                <AnimatedNumber value={card.value || 0} isCurrency={card.isCurrency} />
              )}
            </div>

            {card.progress !== undefined && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, card.progress)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: card.delay + 0.2 }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      card.progress >= 100 ? "bg-income" : "bg-kraft-accent"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
