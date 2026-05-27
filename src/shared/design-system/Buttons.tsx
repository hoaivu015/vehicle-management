import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { haptics } from '@/src/shared/utils/haptics';

/**
 * Button Variants & Colors
 */
export type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface BaseButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ElementType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const PillButton: React.FC<BaseButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const variants = {
    primary: "bg-kraft-accent text-white shadow-kraft hover:brightness-110",
    success: "bg-income text-white shadow-kraft hover:brightness-110",
    danger: "bg-expense text-white shadow-kraft hover:brightness-110",
    secondary: "bg-slate-100/60 backdrop-blur-md text-kraft-ink border border-black/5 hover:bg-slate-200/50 shadow-sm",
    ghost: "bg-transparent border border-kraft-ink/20 border-dashed text-kraft-ink/65 hover:border-kraft-accent/40 hover:text-kraft-accent",
    glass: "backdrop-blur-md bg-white/40 border border-white/60 text-kraft-ink shadow-kraft"
  };

  const sizes = {
    sm: "h-11 px-g3 text-[10px] rounded-full", // Minimum 44px height
    md: "h-14 px-g4 text-[11px] rounded-full",
    lg: "h-16 px-g5 text-xs rounded-full",
    xl: "h-20 px-g6 text-sm rounded-full"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptics.light();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(
        "font-black uppercase tracking-[0.2em] inline-flex items-center justify-center gap-g1 transition-all duration-150 ease-out",
        "disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed",
        "native-interactive",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin opacity-60" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} strokeWidth={2.5} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={18} strokeWidth={2.5} />}
        </>
      )}
    </motion.button>
  );
};

interface SlidingPillSwitcherProps {
  isCompact: boolean;
  onChange: (val: boolean) => void;
  className?: string;
}

import { LayoutGrid, List } from 'lucide-react';

export const SlidingPillSwitcher: React.FC<SlidingPillSwitcherProps> = ({
  isCompact,
  onChange,
  className
}) => {
  const handleClick = (val: boolean) => {
    haptics.light();
    onChange(val);
  };

  return (
    <div className={cn(
      "relative flex bg-slate-100/60 backdrop-blur-md p-1 rounded-full border border-black/5 shadow-inner select-none h-12 w-24 shrink-0",
      className
    )}>
      <div className="relative flex w-full h-full items-center">
        {/* Sliding background indicator using spring physics */}
        <motion.div
          className="absolute top-0 bottom-0 w-1/2 rounded-full bg-white shadow-sm border border-black/[0.03]"
          initial={false}
          animate={{
            left: isCompact ? "50%" : "0%"
          }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        />
        <button
          onClick={() => handleClick(false)}
          className={cn(
            "relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 outline-none active:scale-95",
            !isCompact ? "text-kraft-accent scale-110 font-bold" : "text-kraft-ink/30 hover:text-kraft-ink"
          )}
          title="Giao diện tiêu chuẩn"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => handleClick(true)}
          className={cn(
            "relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 outline-none active:scale-95",
            isCompact ? "text-kraft-accent scale-110 font-bold" : "text-kraft-ink/30 hover:text-kraft-ink"
          )}
          title="Giao diện thu gọn"
        >
          <List size={18} />
        </button>
      </div>
    </div>
  );
};
