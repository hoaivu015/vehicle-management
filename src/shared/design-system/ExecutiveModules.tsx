import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { SectionHeader } from './BaseCard';
import { DESIGN_TOKENS } from './tokens';

/**
 * ExecutiveHeader - Tiêu đề chuẩn cao cấp của Meta.
 * Kết hợp tiêu đề và badge trạng thái thời gian thực.
 */
interface ExecutiveHeaderProps {
  title: string;
  subtitle?: string;
  showLiveBadge?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({ 
  title, 
  subtitle, 
  showLiveBadge = true, 
  className,
  action 
}) => (
  <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", DESIGN_TOKENS.layout.container_px, className)}>
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <SectionHeader noMargin className="px-0">{title}</SectionHeader>
        {showLiveBadge && (
          <div className="px-3 py-1 glass-purity-surface rounded-full border border-white/40 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">Live</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-[11px] font-bold text-kraft-ink/30 uppercase tracking-widest">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);

/**
 * FinancialMatrix - Bố cục lưới 12 cột cho báo cáo tài chính.
 */
export const FinancialMatrix: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10", className)}>
    {children}
  </div>
);

export const MatrixSummary: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
  children, 
  title, 
  className 
}) => (
  <div className={cn("lg:col-span-5 space-y-6", className)}>
    {title && (
      <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/30", DESIGN_TOKENS.layout.container_px)}>
        {title}
      </p>
    )}
    <div className={cn("bg-white/40 rounded-[2.5rem] py-6 border border-white/60 shadow-sm space-y-3", DESIGN_TOKENS.layout.container_px)}>
      {children}
    </div>
  </div>
);

export const MatrixLedger: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("lg:col-span-7", className)}>
    <div className="bg-[#f8fafc] rounded-[3rem] p-8 border border-[#e2e8f0] min-h-[400px] flex flex-col shadow-sm relative overflow-hidden">
      {children}
    </div>
  </div>
);

/**
 * MatrixRow - Một hàng dữ liệu trong MatrixSummary.
 * Đảm bảo nhãn và giá trị luôn thẳng hàng tuyệt đối trên mọi hàng.
 */
interface MatrixRowProps {
  label: string;
  value: string | number | React.ReactNode;
  type?: 'income' | 'expense' | 'warning' | 'neutral';
  isBold?: boolean;
  className?: string;
}

export const MatrixRow: React.FC<MatrixRowProps> = ({ 
  label, 
  value, 
  type = 'neutral', 
  isBold = false,
  className 
}) => {
  const colors = {
    income: "text-emerald-600",
    expense: "text-red-500",
    warning: "text-warning",
    neutral: "text-kraft-ink"
  };

  return (
    <div className={cn(
      "flex flex-col justify-center gap-1.5 py-4 rounded-2xl transition-colors",
      DESIGN_TOKENS.layout.item_px,
      type === 'income' ? "bg-emerald-50/50" : 
      type === 'expense' ? "bg-red-50/50" : 
      type === 'warning' ? "bg-warning/10" :
      "bg-black/[0.02]",
      className
    )}>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 leading-tight">{label}</span>
      <span className={cn(
        "font-black tracking-tight whitespace-nowrap",
        isBold ? "text-lg" : "text-sm",
        colors[type]
      )}>
        {value}
      </span>
    </div>
  );
};

/**
 * DataRow - Component đa năng để hiển thị dữ liệu cặp Label/Value thẳng hàng.
 * Dùng cho các tab thông số hoặc các khối thông tin chung.
 */
interface DataRowProps { 
  label: string; 
  value: string | React.ReactNode; 
  icon?: React.ElementType; 
  highlight?: boolean; 
  className?: string;
}

export const DataRow: React.FC<DataRowProps> = ({
  label, value, icon: Icon, highlight, className
}) => (
  <div className={cn(
    "flex items-center justify-between py-4 border-b border-black/[0.03] last:border-0",
    DESIGN_TOKENS.layout.item_px,
    className
  )}>
    <div className="flex items-center gap-3">
      {Icon && <Icon size={14} className="text-kraft-ink/30" />}
      <span className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">{label}</span>
    </div>
    <span className={cn("text-sm font-bold", highlight ? "text-kraft-accent" : "text-kraft-ink")}>
      {value}
    </span>
  </div>
);

import { PillButton } from './Buttons';
export { PillButton };

/**
 * ExecutiveSection - Layout Primitive chuẩn cho các phân đoạn hồ sơ.
 * Tự động hóa: Khoảng cách (24px), Lưới (Grid), Chia khối (Divider) và Hiệu ứng (Motion).
 */
interface ExecutiveSectionProps {
  title: string;
  subtitle?: string;
  accent?: string;
  action?: React.ReactNode;
  columns?: 1 | 2 | 3;
  divider?: boolean;
  animate?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ExecutiveSection: React.FC<ExecutiveSectionProps> = ({
  title,
  subtitle,
  accent = "bg-kraft-accent",
  action,
  columns = 1,
  divider = false,
  animate = true,
  children,
  className
}) => {
  const content = (
    <div className={cn(
      "group",
      divider && "pt-6 mt-6 md:pt-8 md:mt-8 border-t border-black/5",
      className
    )}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <SectionHeader accentColor={accent} noMargin className="px-0">
            {title}
          </SectionHeader>
          {subtitle && (
            <p className="text-[11px] font-bold text-kraft-ink/30 uppercase tracking-widest mt-1 ml-2">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <div className={cn(
        "grid gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-3"
      )}>
        {children}
      </div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  );
};
