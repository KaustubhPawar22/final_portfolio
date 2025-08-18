import { useCallback, useEffect, useState } from 'react';

interface ScrollToOptions {
  offset?: number;
  lerp?: number;
  duration?: number;
  easing?: (t: number) => number;
  immediate?: boolean;
  lock?: boolean;
  force?: boolean;
  onComplete?: () => void;
  userData?: object;
}

interface LenisInstance {
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
  destroy: () => void;
  raf: (time: number) => void;
}

export const useLenisScroll = () => {
  const [lenis, setLenis] = useState<LenisInstance | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check for global Lenis instance
    const checkLenis = () => {
      if (typeof window !== 'undefined') {
        const globalLenis = (window as unknown as { lenis?: LenisInstance }).lenis; // Fixed: removed 'any'
        if (globalLenis && !lenis) {
          setLenis(globalLenis);
          setIsReady(true);
          console.log('Lenis ready');
        }
      }
    };

    // Check immediately and set up interval
    checkLenis();
    const interval = setInterval(checkLenis, 100);
    
    // Clear interval after 3 seconds
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [lenis]);

  const scrollTo = useCallback((
    target: string | number | HTMLElement, 
    options?: ScrollToOptions
  ) => {
    if (lenis?.scrollTo) {
      lenis.scrollTo(target, options);
      console.log('Scrolling with Lenis to:', target);
    } else {
      // Fallback scroll
      console.log('Lenis not ready, using fallback scroll');
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [lenis]);

  const scrollToTop = useCallback((options?: ScrollToOptions) => {
    scrollTo(0, options);
  }, [scrollTo]);

  return {
    scrollTo,
    scrollToTop,
    lenis,
    isReady,
  };
};
