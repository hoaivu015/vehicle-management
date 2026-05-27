import React from 'react';
import { cn } from '@/src/shared/utils/cn';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  scrollable?: boolean;
  animate?: boolean;
}

/**
 * PageShell - The "Single Source of Truth" for Page layout, padding and spacing.
 * Ensures all modules (Inventory, Staff, Finance) have identical layout foundations.
 */
export const PageShell: React.FC<PageShellProps> = ({ 
  children, 
  className,
  maxWidth = "max-w-[1700px]",
  scrollable = false,
  animate = true
}) => {
  return (
    <div className={cn(
      "space-y-6 md:space-y-12 py-4 md:py-12 px-5 md:px-12 mx-auto h-full flex flex-col",
      maxWidth,
      scrollable ? "overflow-y-auto scrollbar-hidden pb-24" : "overflow-hidden",
      animate && "animate-in fade-in slide-in-from-bottom-4 duration-700",
      className
    )}>
      {children}
    </div>
  );
};

interface PageHeaderShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageHeaderShell: React.FC<PageHeaderShellProps> = ({ children, className }) => (
  <div className={cn(
    "flex flex-col lg:flex-row justify-between items-center gap-10 shrink-0 border-b border-black/5 pb-10",
    className
  )}>
    {children}
  </div>
);
