import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { haptics } from '@/src/shared/utils/haptics';

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isLarge?: boolean;
  isCompact?: boolean;
  minHeight?: string;
  /** Meta spec: If true, uses 40px radius (for heroes/large features), else 32px. */
  variant?: 'standard' | 'large';
  glowState?: 'stable' | 'warning' | 'none';
}

/**
 * BaseCard - Thành phần cốt lõi cho mọi loại thẻ (Inventory, Staff, Cashflow).
 * Tuân thủ chuẩn Pure Light Canvas: Nền trắng kính mờ, bo góc 32px/40px, viền hairline.
 */
export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className,
  onClick,
  isLarge = false,
  isCompact = false,
  variant,
  minHeight,
  glowState = 'none'
}) => {
  const isLargeVariant = variant === 'large' || isLarge;

  const handleClick = () => {
    if (onClick) {
      haptics.light();
      onClick();
    }
  };

  const glowClasses = {
    stable: "shadow-neural-t3 border-neon-blue/20 animate-breathe-glow",
    warning: "shadow-coral-pulse border-coral/15 hover:border-coral/30 transition-all duration-300",
    none: "shadow-neural-t2 border-white/60 hover:shadow-kraft-deep"
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group bg-white/70 hover:bg-white/85 backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-300",
        "border border-white/60 shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)]",
        glowClasses[glowState],
        isLargeVariant ? "rounded-t1" : "rounded-t2",
        !isLargeVariant && !isCompact && (minHeight || "md:min-h-[380px] min-h-0"),
        isCompact && "min-h-0",
        onClick && "cursor-pointer active:scale-[0.97] ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-300 native-interactive",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardImageSection: React.FC<{ children: React.ReactNode; isLarge?: boolean; className?: string }> = ({
  children,
  isLarge,
  className
}) => (
  <div className={cn(
    "relative overflow-hidden shrink-0 transition-all duration-300",
    "mx-g2 mt-g2 rounded-[20px] border border-white/60 shadow-sm bg-kraft-folder",
    isLarge ? "aspect-video md:h-auto" : "aspect-[1.5/1] md:aspect-none md:h-[180px]",
    className
  )}>
    {children}
  </div>
);

export const CardContentSection: React.FC<{ children: React.ReactNode; isLarge?: boolean; isCompact?: boolean; className?: string; padding?: string }> = ({
  children,
  isLarge,
  isCompact,
  className,
  padding
}) => (
  <div className={cn(
    padding || (isCompact ? "p-g1 md:p-g2" : "p-g2 md:p-g3"),
    "flex-1 flex flex-col",
    isLarge && "p-g3 md:p-g4",
    className
  )}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  noMargin?: boolean;
}> = ({
  children,
  className,
  accentColor,
  noMargin = false
}) => (
    <div className={cn("flex items-center gap-4 px-2", !noMargin && "mb-6", className)}>
      {accentColor && <div className={cn("w-1.5 h-6 rounded-full", accentColor)} />}
      <h4 className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-kraft-accent/60">
        {children}
      </h4>
    </div>
  );

/**
 * PriceBadge - Nhãn giá đè lên ảnh.
 */
export const PriceBadge: React.FC<{ label: string; value: string; className?: string }> = ({
  label,
  value,
  className
}) => (
  <div className={cn(
    "absolute bottom-2.5 right-2.5 md:bottom-3 md:right-3",
    "px-3 py-1.5 md:px-3.5 md:py-2 bg-slate-900/85 text-white rounded-[14px] backdrop-blur-xl shadow-lg border border-white/20 flex flex-col items-end transition-transform group-hover:scale-105 duration-300",
    className
  )}>
    <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-300 mb-0.5 leading-none">
      {label}
    </span>
    <span className="text-sm md:text-[17px] font-black tracking-tight whitespace-nowrap leading-tight text-white">
      {value}
    </span>
  </div>
);

/**
 * InfoTag - Nhãn thông tin nhỏ (Năm, ODO, v.v.).
 */
export const InfoTag: React.FC<{ icon: React.ElementType; label: string | number; className?: string }> = ({
  icon: Icon,
  label,
  className
}) => (
  <div className={cn(
    "px-2.5 py-1 bg-slate-100/90 rounded-full flex items-center gap-1.5 border border-slate-200/60 shadow-2xs",
    className
  )}>
    <Icon size={11} className="text-kraft-accent shrink-0" strokeWidth={2.5} />
    <span className="text-[10px] font-bold text-slate-700 tracking-tight whitespace-nowrap">
      {label}
    </span>
  </div>
);

/**
 * CardFooter - Phần chân trang của thẻ, phân tách bởi viền hairline.
 */
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn(
    "mt-auto pt-g2 md:pt-g3 border-t border-hairline-soft flex items-end justify-between",
    className
  )}>
    {children}
  </div>
);

/**
 * GlassSection - Khối nội dung với hiệu ứng kính chuẩn Meta.
 */
export const GlassSection: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({
  children,
  className,
  noPadding = false
}) => (
  <div className={cn(
    "glass-purity-surface overflow-hidden transition-all duration-300",
    !noPadding && "p-6 md:p-8",
    className
  )}>
    {children}
  </div>
);
