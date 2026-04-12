import React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangle' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangle',
  width,
  height
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div 
      style={style}
      className={cn(
        "shimmer-wrapper",
        variant === 'circle' ? "rounded-full" : "rounded-2xl",
        variant === 'text' ? "h-4 w-full" : "",
        className
      )}
    >
      <div className="shimmer-effect" />
    </div>
  );
};
