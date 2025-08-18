// lib/lenis.ts or utils/lenis.ts
import Lenis from 'lenis';

let lenis: Lenis | null = null;

export const initLenis = () => {
  if (typeof window !== 'undefined' && !lenis) {
    lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      syncTouch: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoResize: true,
      infinite: false,
      anchors: true, // Enable anchor link handling
    });

    // Request animation frame loop
    function raf(time: number) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Make lenis available globally
    (window as any).lenis = lenis;
  }
  return lenis;
};

export const getLenis = () => lenis;

export const destroyLenis = () => {
  if (lenis) {
    lenis.destroy();
    lenis = null;
    delete (window as any).lenis;
  }
};
