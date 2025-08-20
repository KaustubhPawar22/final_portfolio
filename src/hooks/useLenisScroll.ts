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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check for global Lenis instance
    const checkLenis = () => {
      if (typeof window !== 'undefined') {
        const globalLenis = (window as unknown as { lenis?: LenisInstance }).lenis;
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
    
    // Clear interval after 5 seconds (increased from 3)
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('resize', checkMobile);
    };
  }, [lenis]);

  const scrollTo = useCallback((
    target: string | number | HTMLElement, 
    options?: ScrollToOptions
  ) => {
    if (lenis?.scrollTo && isReady) {
      // 🔧 FIXED: Better mobile scroll options
      const mobileOptions = isMobile ? {
        duration: 2.5,  // Slower on mobile
        lerp: 0.04,     // Even smoother on mobile
        ...options
      } : options;
      
      lenis.scrollTo(target, mobileOptions);
      console.log('Scrolling with Lenis to:', target, { isMobile });
    } else {
      // 🔧 FIXED: Enhanced fallback scroll for mobile
      console.log('Lenis not ready, using enhanced fallback scroll');
      
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          // Better mobile scrolling behavior
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ 
          top: target, 
          behavior: 'smooth' 
        });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  }, [lenis, isReady, isMobile]);

  const scrollToTop = useCallback((options?: ScrollToOptions) => {
    // 🔧 FIXED: Smoother scroll to top
    const defaultOptions = {
      duration: isMobile ? 2.5 : 2.0,
      lerp: isMobile ? 0.04 : 0.05,
      ...options
    };
    
    scrollTo(0, defaultOptions);
  }, [scrollTo, isMobile]);

  return {
    scrollTo,
    scrollToTop,
    lenis,
    isReady,
    isMobile,
  };
};
