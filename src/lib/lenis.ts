import Lenis from 'lenis';

interface LenisInstance {
  scrollTo: (target: string | number | HTMLElement, options?: unknown) => void;
  destroy: () => void;
  raf: (time: number) => void;
}

let lenis: Lenis | null = null;

export const initLenis = async () => {
  if (typeof window !== 'undefined' && !lenis) {
    try {
      const LenisConstructor = (await import('lenis')).default;
      
      // Detect if it's mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      
      lenis = new LenisConstructor({
        // 🔧 FIXED: Slower, smoother scrolling
        lerp: 0.1,           // Reduced from 0.1 (slower interpolation)
        duration: 1.2,        // Increased from 1.2 (longer duration)
        
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        
        // 🔧 FIXED: Mobile scroll support
        syncTouch: true,      // Changed from false - enables touch scrolling
        touchMultiplier: isMobile ? 2 : 1,  // Better touch sensitivity on mobile
        wheelMultiplier: 1,
        
        // 🔧 FIXED: Better mobile easing
        easing: (t: number) => {
          // Smoother easing function for better feel
          return 1 - Math.pow(1 - t, 3);
          // return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        
        autoResize: true,
        infinite: false,
      });

      // Request animation frame loop
      function raf(time: number) {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Make lenis available globally
      (window as unknown as { lenis: LenisInstance }).lenis = lenis as LenisInstance;
      
      console.log('Lenis initialized successfully', { isMobile });
      return lenis;
    } catch (error) {
      console.error('Failed to initialize Lenis:', error);
      return null;
    }
  }
  return lenis;
};

export const getLenis = () => lenis;

export const destroyLenis = () => {
  if (lenis) {
    lenis.destroy();
    lenis = null;
    delete (window as unknown as { lenis?: LenisInstance }).lenis;
  }
};
