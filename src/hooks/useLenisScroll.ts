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

  useEffect(() => {
    // Check for global Lenis instance
    if (typeof window !== 'undefined') {
      const globalLenis = (window as any).lenis;
      if (globalLenis) {
        setLenis(globalLenis);
      }
    }
  }, []);

  const scrollTo = useCallback((
    target: string | number | HTMLElement, 
    options?: ScrollToOptions
  ) => {
    if (lenis?.scrollTo) {
      lenis.scrollTo(target, options);
    } else {
      // Fallback for when Lenis isn't available
      console.log('Lenis not available, using fallback scroll');
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
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
    isReady: !!lenis,
  };
};
