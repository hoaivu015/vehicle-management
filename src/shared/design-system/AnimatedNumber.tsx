import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { formatCurrency } from '@/src/shared/utils/currency';

interface AnimatedNumberProps {
  value: number;
  isCurrency?: boolean;
  className?: string;
  duration?: number;
}

/**
 * 🌟 AnimatedNumber - Thành phần đếm số mượt mà theo chuẩn Apple Fluid Motion.
 * Tự động nội suy giá trị và format tiền tệ VND chính xác.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  isCurrency = false,
  className = '',
  duration = 0.8
}) => {
  const spring = useSpring(value, {
    stiffness: 70,
    damping: 20,
    duration: duration * 1000
  });

  const [displayValue, setDisplayValue] = useState(value);

  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return rounded.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [rounded]);

  return (
    <motion.span className={className}>
      {isCurrency ? formatCurrency(displayValue) : displayValue.toLocaleString('vi-VN')}
    </motion.span>
  );
};
