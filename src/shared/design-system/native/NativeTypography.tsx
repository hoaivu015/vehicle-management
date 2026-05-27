import React from 'react';
import { cn } from '@/src/shared/utils/cn';

interface TextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Large Title: The primary heading for iPhone Native views.
 * Standard: Mulish, Weight 900, Size 32px-40px.
 */
export const LargeTitle: React.FC<TextProps> = ({ children, className }) => (
  <h1 className={cn(
    "font-black tracking-tighter text-kraft-ink leading-[1.1] uppercase",
    "text-[32px] md:text-[40px]",
    className
  )}>
    {children}
  </h1>
);

/**
 * Secondary Label: For metadata, category labels, or subtitles.
 * Standard: Font size 10px, weight 900, uppercase, tracking widest.
 */
export const SecondaryLabel: React.FC<TextProps> = ({ children, className }) => (
  <span className={cn(
    "text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/50",
    className
  )}>
    {children}
  </span>
);
