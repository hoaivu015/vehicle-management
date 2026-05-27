import React from 'react';
import { cn } from '@/src/shared/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  noAnimation?: boolean;
  glassmorphism?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangle',
  width,
  height,
  noAnimation = false,
  glassmorphism = false
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div 
      style={style}
      className={cn(
        glassmorphism ? "expressive-shimmer-card" : "shimmer-wrapper",
        variant === 'circle' ? "rounded-full" : "rounded-2xl",
        variant === 'text' ? "h-4 w-full" : "",
        noAnimation && glassmorphism ? "after:hidden" : "",
        className
      )}
    >
      {!noAnimation && !glassmorphism && <div className="shimmer-effect" />}
    </div>
  );
};
