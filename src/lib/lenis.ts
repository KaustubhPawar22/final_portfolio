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
      
      lenis = new LenisConstructor({
        lerp: 0.1,
        duration: 1.2,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        syncTouch: false,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        autoResize: true,
        infinite: false,
      });

      // Request animation frame loop
      function raf(time: number) {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Make lenis available globally - Fixed: proper typing
      (window as unknown as { lenis: LenisInstance }).lenis = lenis as LenisInstance;
      
      console.log('Lenis initialized successfully');
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
    delete (window as unknown as { lenis?: LenisInstance }).lenis; // Fixed: proper typing
  }
};
