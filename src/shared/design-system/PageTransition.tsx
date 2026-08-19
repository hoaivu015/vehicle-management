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
    y: 16, 
    scale: 0.99
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    scale: 1.01,
    transition: { duration: 0.2, ease: "easeIn" }
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
      transition={{ 
        type: "spring", 
        damping: 30, 
        stiffness: 200,
        mass: 1,
        opacity: { duration: 0.4 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
