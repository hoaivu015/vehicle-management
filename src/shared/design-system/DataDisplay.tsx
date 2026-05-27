import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { formatCurrency } from '@/src/shared/utils/currency';
import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * InfoBox - Hiển thị thông tin cặp Label/Value có icon.
 */
interface InfoBoxProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  highlight?: boolean;
  badge?: React.ReactNode;
}

export const InfoBox = ({ label, value, icon: Icon, highlight, badge }: InfoBoxProps) => (
  <div className={cn(
    "flex items-center justify-between p-g3 rounded-t2 border transition-all",
    highlight ? "bg-kraft-bg border-kraft-accent shadow-kraft" : "bg-kraft-bg border-hairline-soft hover:bg-kraft-folder"
  )}>
    <div className="flex items-center gap-g2">
      <div className={cn(
        "w-touch h-touch rounded-xl flex items-center justify-center transition-colors", 
        highlight ? "bg-kraft-accent/10 text-kraft-accent" : "bg-kraft-ink/5 text-kraft-ink/40"
      )}>
        <Icon size={20} />
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest text-kraft-ink/40">{label}</span>
    </div>
    <div className="flex items-center gap-g2">
      {badge && badge}
      <span className={cn("text-sm font-black tracking-tighter", highlight ? "text-kraft-accent" : "text-kraft-ink")}>{value}</span>
    </div>
  </div>
);

/**
 * FinancialBox - Thẻ hiển thị số tiền (Vốn, Phí, Lợi nhuận).
 */
interface FinancialBoxProps {
  label: string;
  value: number;
  color: 'income' | 'warning' | 'neutral';
  isEstimated?: boolean;
}

export const FinancialBox = ({ label, value, color, isEstimated }: FinancialBoxProps) => {
  const styles = {
    income: "text-income bg-kraft-bg border-hairline-soft",
    warning: "text-warning bg-kraft-bg border-hairline-soft",
    neutral: "text-kraft-ink bg-kraft-bg border-hairline-soft",
  };
  
  return (
    <div className={cn(
      "p-g4 rounded-t2 border flex flex-col items-start text-left gap-g1 relative overflow-hidden transition-all shadow-kraft", 
      styles[color]
    )}>
      {isEstimated && (
        <div className="absolute top-g1 right-g1 p-g1">
          <div className="w-2 h-2 rounded-full bg-current opacity-20" />
        </div>
      )}
      <span className="text-[11px] font-black uppercase tracking-widest text-kraft-ink/40 leading-none">{label}</span>
      <span className="text-2xl font-black tracking-tighter leading-none">{formatCurrency(value)}</span>
    </div>
  );
};

/**
 * FinancialBadge - Badge hiển thị dòng tài chính (Income/Expense).
 */
export const FinancialBadge: React.FC<{ 
  label: string; 
  value: string | number; 
  type: 'income' | 'expense' | 'warning' | 'neutral';
  className?: string;
}> = ({ label, value, type, className }) => {
  const typeClasses = {
    income: "text-income bg-income/10",
    expense: "text-expense bg-expense/10",
    warning: "text-warning bg-warning/10",
    neutral: "text-kraft-ink/60 bg-kraft-folder"
  };

  return (
    <div className={cn("flex justify-between items-center p-g2 rounded-full border border-hairline-soft", typeClasses[type], className)}>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</span>
      <span className="text-sm font-black tracking-tighter leading-none">{value}</span>
    </div>
  );
};

/**
 * StatusBadge - Nhãn trạng thái chuẩn Meta 2026.
 */
export const StatusBadge: React.FC<{ label: string; badgeClass: string; icon?: React.ElementType; className?: string }> = ({ 
  label, 
  badgeClass, 
  icon: Icon,
  className 
}) => (
  <div className={cn(
    "px-g1.5 py-0.5 md:px-g2 md:py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md flex items-center gap-g1",
    badgeClass,
    className
  )}>
    {Icon ? <Icon size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />}
    {label}
  </div>
);

/**
 * AlertBlock - Thành phần cảnh báo/thông báo chuẩn Meta 2026.
 * Dùng cho các thông báo quan trọng, xác nhận xóa, hoặc lưu ý tài chính.
 */
interface AlertBlockProps {
  title: string;
  description?: string | React.ReactNode;
  icon: React.ElementType;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  className?: string;
}

export const AlertBlock: React.FC<AlertBlockProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'info',
  className
}) => {
  const variants = {
    danger: {
      bg: "bg-expense/10",
      border: "border-expense/10",
      iconBg: "bg-expense",
      iconColor: "text-white",
      titleColor: "text-expense",
      descColor: "text-expense/60"
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/10",
      iconBg: "bg-warning",
      iconColor: "text-kraft-ink",
      titleColor: "text-warning",
      descColor: "text-warning/60"
    },
    info: {
      bg: "bg-kraft-accent/10",
      border: "border-kraft-accent/10",
      iconBg: "bg-kraft-accent",
      iconColor: "text-white",
      titleColor: "text-kraft-ink",
      descColor: "text-kraft-ink/40"
    },
    success: {
      bg: "bg-income/10",
      border: "border-income/10",
      iconBg: "bg-income",
      iconColor: "text-white",
      titleColor: "text-income",
      descColor: "text-income/60"
    }
  };

  const style = variants[variant];

  return (
    <div className={cn(
      "p-g3 rounded-t2 border flex items-start gap-g2 transition-all",
      style.bg,
      style.border,
      className
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
        style.iconBg,
        style.iconColor
      )}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <p className={cn("text-[11px] font-black uppercase tracking-widest leading-none mb-1", style.titleColor)}>
          {title}
        </p>
        {description && (
          <div className={cn("text-xs font-medium leading-relaxed", style.descColor)}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * MetricCard - Thẻ hiển thị chỉ số tổng quát (Dashboard/Performance Bar).
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  isWarning?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  color = "text-kraft-accent",
  isWarning,
  className
}) => (
  <div className={cn(
    "glass-surface p-g3 rounded-t2 flex items-center gap-g3 group hover:bg-white/60 transition-all",
    className
  )}>
    <div className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-kraft-deep transition-transform group-hover:scale-110",
      isWarning ? "bg-expense-light border-expense/10" : "bg-white border-hairline-soft"
    )}>
      <Icon className={color} size={24} />
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-sub-label leading-none">{label}</p>
      <p className="text-2xl font-black text-kraft-ink tracking-tighter leading-none">{value}</p>
    </div>
  </div>
);

/**
 * EmptyState - Trạng thái trống chuẩn Meta cho Grid và List.
 */
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => (
  <div className={cn("flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-700", className)}>
    <div className="w-24 h-24 bg-surface-soft rounded-t2 flex items-center justify-center mb-g3 border border-hairline-soft opacity-40">
      <Icon size={48} strokeWidth={1} className="text-sub-label" />
    </div>
    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-kraft-ink mb-2">{title}</h3>
    {description && (
      <p className="text-xs font-medium text-sub-label max-w-[280px] leading-relaxed mb-g3">
        {description}
      </p>
    )}
    {action && action}
  </div>
);

/**
 * ActivityItem - Dòng hiển thị lịch sử/hoạt động chuẩn Mobile Native.
 */
interface ActivityItemProps {
  date: string;
  title: string;
  subtitle?: string;
  amount?: string | number;
  amountType?: 'income' | 'expense' | 'neutral';
  category?: string;
  onDelete?: () => void;
  className?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  date,
  title,
  subtitle,
  amount,
  amountType = 'neutral',
  category,
  onDelete,
  className
}) => {
  const amountClasses = {
    income: "text-income",
    expense: "text-expense",
    neutral: "text-kraft-ink"
  };

  return (
    <div className={cn("py-g2 px-g2 space-y-g1 border-b border-hairline-soft last:border-0 transition-colors hover:bg-surface-soft group", className)}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-sub-label uppercase tracking-widest">{date}</span>
        <div className="flex items-center gap-g1">
          {category && (
            <span className="text-[9px] font-black text-kraft-accent bg-kraft-accent/10 px-g1 py-0.5 rounded-full uppercase tracking-widest">
              {category}
            </span>
          )}
          {onDelete && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}
              className="w-11 h-11 rounded-xl bg-expense/10 text-expense flex items-center justify-center opacity-100 md:opacity-40 group-hover:opacity-100 transition-all hover:bg-expense hover:text-white shadow-kraft"
            >
              <Trash2 size={16} />
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center gap-g2">
        <div className="min-w-0">
          <p className="text-sm font-black text-kraft-ink truncate leading-tight">{title}</p>
          {subtitle && <p className="text-[11px] font-medium text-sub-label italic leading-none">{subtitle}</p>}
        </div>
        {amount !== undefined && (
          <div className={cn("text-[15px] font-black tracking-tighter whitespace-nowrap leading-none", amountClasses[amountType])}>
            {typeof amount === 'number' ? (amount > 0 ? `+${amount}` : amount) : amount}
          </div>
        )}
      </div>
    </div>
  );
};
