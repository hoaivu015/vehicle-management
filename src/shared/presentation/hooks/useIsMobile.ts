import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile.
 * Uses screen width as the primary signal.
 */
export const useIsMobile = (breakpoint: number = 1024) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const mobile = window.innerWidth < breakpoint;
      console.log('[useIsMobile] Resize detected. width:', window.innerWidth, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
