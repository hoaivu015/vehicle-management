import React from 'react';
import { cn } from '@/src/shared/utils/cn';

interface NativePageProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

/**
 * NativePage - The root container for Mobile-only views.
 * Enforces iPhone Native standards: Safe Area, Golden Margin, and breathing space.
 */
export const NativePage: React.FC<NativePageProps> = ({ 
  children, 
  className,
  scrollable = true 
}) => {
  return (
    <div className={cn(
      "flex flex-col w-full h-full min-h-screen bg-kraft-bg relative scroll-safe-bottom",
      "pt-2", 
      "pb-28 md:pb-20", // Dành vừa đúng ~112px để card dừng ngay trên thanh Bottom Nav, không bị hở khoảng trống lớn
      "px-g5", // Golden Margin: 20px on mobile (64px desktop) — see index.css @media override
      scrollable ? "overflow-y-auto scrollbar-hidden" : "overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * NativeHeader - Standardized header for mobile pages.
 */
export const NativeHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <header className={cn(
    "flex flex-col gap-g1 pt-2 pb-2 shrink-0",
    className
  )}>
    {children}
  </header>
);
