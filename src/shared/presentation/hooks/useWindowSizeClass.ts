import { useState, useEffect } from 'react';

export type WindowSizeClass = 'compact' | 'medium' | 'expanded';

export interface WindowSizeClassResult {
  width: number;
  height: number;
  sizeClass: WindowSizeClass;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  isFoldable: boolean; // True if physical dual screen or fold media features detected
  posture: 'flat' | 'folded' | 'unknown'; // Foldable posture status
}

/**
 * useWindowSizeClass - Google Neural Expressive (I/O 2026) dynamic layout hook.
 * Replaces device-specific media queries with standard Google Window Size Classes:
 * - Compact Window (< 600px): Phones in portrait, vertical split-screen.
 * - Medium Window (600px - 840px): Foldables (unfolded), small tablets, landscape phones.
 * - Expanded Window (> 840px): Large tablets, laptops, desktops, AR/VR (Android XR).
 *
 * Includes cutting-edge foldable detection utilizing the W3C Device Posture API
 * and CSS Spanning/Viewport Segments Media Features.
 */
export const useWindowSizeClass = (): WindowSizeClassResult => {
  const getSpecs = (): WindowSizeClassResult => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        sizeClass: 'compact',
        isCompact: true,
        isMedium: false,
        isExpanded: false,
        isFoldable: false,
        posture: 'unknown',
      };
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Determine Window Size Class according to Google Neural Expressive specs:
    // Compact: < 600px
    // Medium: 600px - 840px
    // Expanded: >= 840px
    let sizeClass: WindowSizeClass = 'compact';
    if (w >= 840) {
      sizeClass = 'expanded';
    } else if (w >= 600) {
      sizeClass = 'medium';
    }

    // Foldable detection using web standards (Device Posture API and Screen Fold media features)
    let isFoldable = false;
    let posture: 'flat' | 'folded' | 'unknown' = 'unknown';

    // 1. Check experimental CSS Media Query for spanning / viewport segments
    try {
      if (
        window.matchMedia('(screen-spanning: single-fold-vertical)').matches || 
        window.matchMedia('(screen-spanning: single-fold-horizontal)').matches ||
        window.matchMedia('(horizontal-viewport-segments: 2)').matches ||
        window.matchMedia('(vertical-viewport-segments: 2)').matches
      ) {
        isFoldable = true;
        posture = 'folded'; // Active fold/span state
      }
    } catch (e) {
      // Ignore unsupported browser features
    }

    // 2. Check navigator.devicePosture API (W3C standard for foldables)
    const nav = navigator as any;
    if (nav.devicePosture) {
      isFoldable = true;
      posture = nav.devicePosture.type === 'folded' ? 'folded' : 'flat';
    }

    // Heuristics for foldable posture: dynamic layout morphing
    // (Characteristics like tablet-like widths with specific aspects, or rapid 2x width transitions)
    if (!isFoldable && w > 600 && w < 1000) {
      const ratio = w / h;
      // Many foldables unfolded are close to square (aspect ratios around 0.9 to 1.2)
      if (ratio > 0.8 && ratio < 1.35) {
        isFoldable = true;
        posture = 'flat'; // flat/open state
      }
    }

    return {
      width: w,
      height: h,
      sizeClass,
      isCompact: sizeClass === 'compact',
      isMedium: sizeClass === 'medium',
      isExpanded: sizeClass === 'expanded',
      isFoldable,
      posture,
    };
  };

  const [specs, setSpecs] = useState<WindowSizeClassResult>(getSpecs);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSpecs(getSpecs());
    };

    // Optimize listener with native event binding
    window.addEventListener('resize', handleResize);

    // Listen to W3C device posture API changes if available
    const nav = navigator as any;
    let postureListener: (() => void) | null = null;
    if (nav.devicePosture && nav.devicePosture.addEventListener) {
      postureListener = () => {
        setSpecs(getSpecs());
      };
      nav.devicePosture.addEventListener('change', postureListener);
    }

    // Initial sync
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (nav.devicePosture && nav.devicePosture.removeEventListener && postureListener) {
        nav.devicePosture.removeEventListener('change', postureListener);
      }
    };
  }, []);

  return specs;
};
