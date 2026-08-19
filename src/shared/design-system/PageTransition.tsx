import React from 'react';
import { motion, Variants } from 'motion/react';

/**
 * Liquid Glass 2.0 Animation Standard
 * - Spring-based for physical feel
 * - Subtle scale and Y-offset for depth
 * - High-purity opacity cross-fade
 */
export const LIQUID_VARIANTS: Variants = {
  initial: { 
    opacity: 0, 
    y: 6, 
    scale: 0.995
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -4, 
    scale: 1.005,
    transition: { duration: 0.1, ease: "easeIn" }
  },
};

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  transitionKey,
  className = "w-full h-full"
}) => {
  return (
    <motion.div
      key={transitionKey}
      variants={LIQUID_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
    >
      {children}
    </motion.div>
  );
};
